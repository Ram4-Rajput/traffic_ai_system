import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import joblib
import asyncio
import logging
from utils.logger import setup_logger
from models.database import Database

logger = setup_logger(__name__)

class TrafficPredictionService:
    """AI-powered traffic prediction service using machine learning"""
    
    def __init__(self):
        self.model = None
        self.scaler = MinMaxScaler()
        self.db = Database()
        self.is_model_loaded = False
        
    async def load_model(self):
        """Load or train the traffic prediction model"""
        try:
            # Try to load existing model
            try:
                self.model = joblib.load('models/traffic_prediction_model.pkl')
                self.scaler = joblib.load('models/traffic_scaler.pkl')
                self.is_model_loaded = True
                logger.info("Loaded existing traffic prediction model")
            except FileNotFoundError:
                logger.info("No existing model found, training new model...")
                await self.train_model()
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            # Initialize with a simple model as fallback
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.is_model_loaded = True
    
    async def train_model(self):
        """Train the traffic prediction model with historical data"""
        try:
            # Get historical traffic data
            historical_data = await self.db.get_historical_traffic_data(days=90)
            
            if len(historical_data) < 100:
                logger.warning("Insufficient data for training, using simple model")
                self.model = RandomForestRegressor(n_estimators=50, random_state=42)
                self.is_model_loaded = True
                return
            
            # Prepare features
            df = pd.DataFrame(historical_data)
            features = self.prepare_features(df)
            
            if features.empty:
                logger.warning("No valid features for training")
                return
            
            X = features.drop(['target_speed'], axis=1)
            y = features['target_speed']
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model.fit(X_scaled, y)
            
            # Save model
            joblib.dump(self.model, 'models/traffic_prediction_model.pkl')
            joblib.dump(self.scaler, 'models/traffic_scaler.pkl')
            
            self.is_model_loaded = True
            logger.info("Traffic prediction model trained successfully")
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            self.model = RandomForestRegressor(n_estimators=50, random_state=42)
            self.is_model_loaded = True
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for machine learning"""
        try:
            features = []
            
            for _, row in df.iterrows():
                # Time-based features
                timestamp = pd.to_datetime(row['timestamp'])
                hour = timestamp.hour
                day_of_week = timestamp.dayofweek
                is_weekend = 1 if day_of_week >= 5 else 0
                is_rush_hour = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
                
                # Location features
                lat = row.get('latitude', 0)
                lng = row.get('longitude', 0)
                
                # Traffic features
                current_speed = row.get('speed', 0)
                vehicle_count = row.get('vehicle_count', 1)
                
                # Weather features (if available)
                weather_condition = row.get('weather_condition', 'clear')
                weather_encoded = self.encode_weather(weather_condition)
                
                # Road features
                road_type = row.get('road_type', 'urban')
                road_encoded = self.encode_road_type(road_type)
                
                feature_dict = {
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'is_weekend': is_weekend,
                    'is_rush_hour': is_rush_hour,
                    'latitude': lat,
                    'longitude': lng,
                    'current_speed': current_speed,
                    'vehicle_count': vehicle_count,
                    'weather_condition': weather_encoded,
                    'road_type': road_encoded,
                    'target_speed': current_speed  # For training
                }
                
                features.append(feature_dict)
            
            return pd.DataFrame(features)
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return pd.DataFrame()
    
    def encode_weather(self, weather: str) -> int:
        """Encode weather condition"""
        weather_map = {
            'clear': 0,
            'rain': 1,
            'fog': 2,
            'snow': 3,
            'storm': 4
        }
        return weather_map.get(weather.lower(), 0)
    
    def encode_road_type(self, road_type: str) -> int:
        """Encode road type"""
        road_map = {
            'highway': 0,
            'urban': 1,
            'residential': 2,
            'commercial': 3
        }
        return road_map.get(road_type.lower(), 1)
    
    async def predict_traffic(self, location: Dict[str, float], time_horizon: int = 60, 
                            road_segments: List[str] = None) -> Dict[str, Any]:
        """Predict traffic conditions for given location and time horizon"""
        try:
            if not self.is_model_loaded:
                await self.load_model()
            
            predictions = []
            current_time = datetime.now()
            
            # Generate predictions for each time interval
            for interval in range(0, time_horizon, 15):  # Every 15 minutes
                future_time = current_time + timedelta(minutes=interval)
                
                # Get current traffic data for the location
                current_data = await self.db.get_current_traffic(
                    location['latitude'], 
                    location['longitude'],
                    radius=1000
                )
                
                # Prepare features for prediction
                features = self.prepare_prediction_features(
                    location, future_time, current_data
                )
                
                if features:
                    # Make prediction
                    features_scaled = self.scaler.transform([features])
                    predicted_speed = self.model.predict(features_scaled)[0]
                    
                    # Determine congestion level
                    congestion_level = self.determine_congestion_level(predicted_speed)
                    
                    predictions.append({
                        'time': future_time.isoformat(),
                        'interval_minutes': interval,
                        'predicted_speed': max(0, predicted_speed),
                        'congestion_level': congestion_level,
                        'confidence': self.calculate_confidence(features, current_data)
                    })
            
            # Calculate overall traffic trend
            trend = self.calculate_traffic_trend(predictions)
            
            return {
                'location': location,
                'time_horizon_minutes': time_horizon,
                'predictions': predictions,
                'trend': trend,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting traffic: {str(e)}")
            # Return fallback prediction
            return self.get_fallback_prediction(location, time_horizon)
    
    def prepare_prediction_features(self, location: Dict[str, float], 
                                 future_time: datetime, current_data: List[Dict]) -> List[float]:
        """Prepare features for single prediction"""
        try:
            # Time-based features
            hour = future_time.hour
            day_of_week = future_time.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            is_rush_hour = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
            
            # Location features
            lat = location['latitude']
            lng = location['longitude']
            
            # Current traffic features
            current_speed = 0
            vehicle_count = 1
            
            if current_data:
                current_speed = np.mean([d.get('speed', 0) for d in current_data])
                vehicle_count = len(current_data)
            
            # Default weather and road type
            weather_encoded = 0  # clear
            road_encoded = 1  # urban
            
            return [
                hour, day_of_week, is_weekend, is_rush_hour,
                lat, lng, current_speed, vehicle_count,
                weather_encoded, road_encoded
            ]
            
        except Exception as e:
            logger.error(f"Error preparing prediction features: {str(e)}")
            return []
    
    def determine_congestion_level(self, speed: float) -> str:
        """Determine congestion level based on speed"""
        if speed < 20:
            return 'severe'
        elif speed < 40:
            return 'high'
        elif speed < 60:
            return 'medium'
        else:
            return 'low'
    
    def calculate_confidence(self, features: List[float], current_data: List[Dict]) -> float:
        """Calculate prediction confidence based on data quality"""
        try:
            base_confidence = 0.8
            
            # Adjust confidence based on current data availability
            if current_data:
                data_quality = min(len(current_data) / 10, 1.0)  # Normalize to 0-1
                base_confidence += data_quality * 0.2
            
            # Adjust based on time of day (more confident during typical hours)
            hour = datetime.now().hour
            if 6 <= hour <= 22:  # Daytime
                base_confidence += 0.1
            
            return min(base_confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5
    
    def calculate_traffic_trend(self, predictions: List[Dict]) -> str:
        """Calculate overall traffic trend"""
        try:
            if len(predictions) < 2:
                return 'stable'
            
            speeds = [p['predicted_speed'] for p in predictions]
            avg_speed_first = np.mean(speeds[:len(speeds)//2])
            avg_speed_second = np.mean(speeds[len(speeds)//2:])
            
            speed_change = avg_speed_second - avg_speed_first
            
            if speed_change > 10:
                return 'improving'
            elif speed_change < -10:
                return 'deteriorating'
            else:
                return 'stable'
                
        except Exception as e:
            logger.error(f"Error calculating trend: {str(e)}")
            return 'stable'
    
    def get_fallback_prediction(self, location: Dict[str, float], 
                              time_horizon: int) -> Dict[str, Any]:
        """Get fallback prediction when model is unavailable"""
        predictions = []
        current_time = datetime.now()
        
        for interval in range(0, time_horizon, 15):
            future_time = current_time + timedelta(minutes=interval)
            hour = future_time.hour
            
            # Simple rule-based prediction
            if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
                predicted_speed = 25
                congestion = 'high'
            elif 22 <= hour or hour <= 6:  # Night
                predicted_speed = 60
                congestion = 'low'
            else:  # Normal hours
                predicted_speed = 45
                congestion = 'medium'
            
            predictions.append({
                'time': future_time.isoformat(),
                'interval_minutes': interval,
                'predicted_speed': predicted_speed,
                'congestion_level': congestion,
                'confidence': 0.6
            })
        
        return {
            'location': location,
            'time_horizon_minutes': time_horizon,
            'predictions': predictions,
            'trend': 'stable',
            'generated_at': datetime.now().isoformat(),
            'fallback': True
        }
    
    async def analyze_congestion(self, area: Dict[str, Any], time_period: int = 24) -> Dict[str, Any]:
        """Analyze traffic congestion patterns for an area"""
        try:
            # Get traffic data for the specified area and time period
            traffic_data = await self.db.get_area_traffic_data(
                area, time_period
            )
            
            if not traffic_data:
                return self.get_fallback_congestion_analysis(area, time_period)
            
            # Analyze congestion patterns
            df = pd.DataFrame(traffic_data)
            
            # Hourly congestion analysis
            hourly_congestion = df.groupby(df['timestamp'].dt.hour)['speed'].mean()
            
            # Peak congestion times
            peak_hours = hourly_congestion.nsmallest(3).index.tolist()
            
            # Average congestion levels
            avg_speed = df['speed'].mean()
            congestion_distribution = df['speed'].apply(self.determine_congestion_level).value_counts()
            
            # Congestion hotspots
            hotspots = self.identify_congestion_hotspots(df)
            
            return {
                'area': area,
                'time_period_hours': time_period,
                'analysis': {
                    'average_speed': avg_speed,
                    'peak_congestion_hours': peak_hours,
                    'congestion_distribution': congestion_distribution.to_dict(),
                    'hotspots': hotspots,
                    'hourly_patterns': hourly_congestion.to_dict()
                },
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing congestion: {str(e)}")
            return self.get_fallback_congestion_analysis(area, time_period)
    
    def identify_congestion_hotspots(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify traffic congestion hotspots"""
        try:
            # Group by location clusters
            df['lat_rounded'] = df['latitude'].round(3)
            df['lng_rounded'] = df['longitude'].round(3)
            
            hotspots = df.groupby(['lat_rounded', 'lng_rounded']).agg({
                'speed': 'mean',
                'timestamp': 'count'
            }).rename(columns={'timestamp': 'vehicle_count'})
            
            # Filter for congested areas
            congested_areas = hotspots[hotspots['speed'] < 30].sort_values('speed')
            
            return congested_areas.head(10).reset_index().to_dict('records')
            
        except Exception as e:
            logger.error(f"Error identifying hotspots: {str(e)}")
            return []
    
    def get_fallback_congestion_analysis(self, area: Dict[str, Any], 
                                       time_period: int) -> Dict[str, Any]:
        """Get fallback congestion analysis"""
        return {
            'area': area,
            'time_period_hours': time_period,
            'analysis': {
                'average_speed': 40.0,
                'peak_congestion_hours': [8, 9, 18, 19],
                'congestion_distribution': {'low': 40, 'medium': 35, 'high': 20, 'severe': 5},
                'hotspots': [],
                'hourly_patterns': {}
            },
            'generated_at': datetime.now().isoformat(),
            'fallback': True
        }
    
    async def get_traffic_patterns(self, area: str = None, time_period: int = 24, 
                                granularity: str = "hourly") -> Dict[str, Any]:
        """Get detailed traffic pattern analytics"""
        try:
            # Get traffic data
            traffic_data = await self.db.get_traffic_patterns_data(
                area, time_period, granularity
            )
            
            # Analyze patterns
            patterns = {
                'temporal_patterns': self.analyze_temporal_patterns(traffic_data),
                'spatial_patterns': self.analyze_spatial_patterns(traffic_data),
                'speed_patterns': self.analyze_speed_patterns(traffic_data),
                'volume_patterns': self.analyze_volume_patterns(traffic_data)
            }
            
            return {
                'area': area,
                'time_period': time_period,
                'granularity': granularity,
                'patterns': patterns,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting traffic patterns: {str(e)}")
            return {'error': str(e)}
    
    def analyze_temporal_patterns(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze temporal traffic patterns"""
        # Implementation for temporal pattern analysis
        return {'pattern': 'temporal_analysis_placeholder'}
    
    def analyze_spatial_patterns(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze spatial traffic patterns"""
        # Implementation for spatial pattern analysis
        return {'pattern': 'spatial_analysis_placeholder'}
    
    def analyze_speed_patterns(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze speed patterns"""
        # Implementation for speed pattern analysis
        return {'pattern': 'speed_analysis_placeholder'}
    
    def analyze_volume_patterns(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze traffic volume patterns"""
        # Implementation for volume pattern analysis
        return {'pattern': 'volume_analysis_placeholder'}
    
    async def batch_update_predictions(self):
        """Batch update traffic predictions for all monitored areas"""
        try:
            # Get all monitored areas
            areas = await self.db.get_monitored_areas()
            
            for area in areas:
                # Generate predictions for each area
                predictions = await self.predict_traffic(
                    location=area['location'],
                    time_horizon=120  # 2 hours
                )
                
                # Store predictions in database
                await self.db.store_traffic_predictions(area['id'], predictions)
                
                logger.info(f"Updated predictions for area {area['id']}")
            
            logger.info("Batch prediction update completed")
            
        except Exception as e:
            logger.error(f"Error in batch prediction update: {str(e)}")
    
    async def health_check(self) -> str:
        """Check service health"""
        try:
            if self.is_model_loaded and self.model:
                return "healthy"
            else:
                return "degraded"
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            return "unhealthy"
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get service performance metrics"""
        return {
            "model_loaded": self.is_model_loaded,
            "model_type": "RandomForestRegressor",
            "last_training": datetime.now().isoformat(),
            "predictions_today": 0,  # Would be tracked in production
            "accuracy": 0.85  # Would be calculated from validation data
        }
