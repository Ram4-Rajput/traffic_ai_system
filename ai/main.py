from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import os
from typing import List, Dict, Any
import numpy as np
from datetime import datetime, timedelta
import json

# Import AI modules
from services.traffic_prediction import TrafficPredictionService
from services.vehicle_detection import VehicleDetectionService
from services.signal_optimization import SignalOptimizationService
from services.emergency_corridor import EmergencyCorridorService
from models.database import Database
from utils.logger import setup_logger

# Initialize logger
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SmartRoad AI Services",
    description="AI-powered traffic intelligence and emergency response system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
traffic_service = TrafficPredictionService()
vehicle_service = VehicleDetectionService()
signal_service = SignalOptimizationService()
emergency_service = EmergencyCorridorService()

# Initialize database connection
db = Database()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting SmartRoad AI Services...")
    
    # Load AI models
    await traffic_service.load_model()
    await vehicle_service.load_model()
    await signal_service.initialize()
    await emergency_service.initialize()
    
    # Connect to database
    await db.connect()
    
    logger.info("All services initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down SmartRoad AI Services...")
    await db.disconnect()
    logger.info("Shutdown complete")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "SmartRoad AI Services",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    services_status = {
        "traffic_prediction": await traffic_service.health_check(),
        "vehicle_detection": await vehicle_service.health_check(),
        "signal_optimization": await signal_service.health_check(),
        "emergency_corridor": await emergency_service.health_check(),
        "database": await db.health_check()
    }
    
    overall_status = "healthy" if all(status == "healthy" for status in services_status.values()) else "degraded"
    
    return {
        "overall_status": overall_status,
        "services": services_status,
        "timestamp": datetime.now().isoformat()
    }

# Traffic Prediction Endpoints
@app.post("/api/v1/traffic/predict")
async def predict_traffic(request: Dict[str, Any]):
    """Predict traffic conditions for a given area and time"""
    try:
        location = request.get("location")
        time_horizon = request.get("time_horizon", 60)  # minutes
        road_segments = request.get("road_segments", [])
        
        if not location:
            raise HTTPException(status_code=400, detail="Location is required")
        
        predictions = await traffic_service.predict_traffic(
            location=location,
            time_horizon=time_horizon,
            road_segments=road_segments
        )
        
        return {
            "success": True,
            "predictions": predictions,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Traffic prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/traffic/congestion-analysis")
async def analyze_congestion(request: Dict[str, Any]):
    """Analyze traffic congestion patterns"""
    try:
        area = request.get("area")
        time_period = request.get("time_period", 24)  # hours
        
        if not area:
            raise HTTPException(status_code=400, detail="Area is required")
        
        analysis = await traffic_service.analyze_congestion(
            area=area,
            time_period=time_period
        )
        
        return {
            "success": True,
            "analysis": analysis,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Congestion analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vehicle Detection Endpoints
@app.post("/api/v1/vehicles/detect")
async def detect_vehicles(file: UploadFile = File(...)):
    """Detect vehicles in traffic camera image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process image
        image_data = await file.read()
        detections = await vehicle_service.detect_vehicles(image_data)
        
        return {
            "success": True,
            "detections": detections,
            "processed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Vehicle detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vehicles/count")
async def count_vehicles(request: Dict[str, Any]):
    """Count vehicles by lane and type"""
    try:
        camera_id = request.get("camera_id")
        location = request.get("location")
        
        if not camera_id or not location:
            raise HTTPException(status_code=400, detail="Camera ID and location are required")
        
        counts = await vehicle_service.count_vehicles(
            camera_id=camera_id,
            location=location
        )
        
        return {
            "success": True,
            "counts": counts,
            "captured_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Vehicle counting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Traffic Signal Optimization Endpoints
@app.post("/api/v1/signals/optimize")
async def optimize_signals(request: Dict[str, Any]):
    """Optimize traffic signal timings"""
    try:
        intersection_id = request.get("intersection_id")
        traffic_data = request.get("traffic_data")
        current_timings = request.get("current_timings")
        
        if not intersection_id or not traffic_data:
            raise HTTPException(status_code=400, detail="Intersection ID and traffic data are required")
        
        optimized_timings = await signal_service.optimize_signals(
            intersection_id=intersection_id,
            traffic_data=traffic_data,
            current_timings=current_timings
        )
        
        return {
            "success": True,
            "optimized_timings": optimized_timings,
            "intersection_id": intersection_id,
            "optimized_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Signal optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/signals/{intersection_id}/status")
async def get_signal_status(intersection_id: str):
    """Get current signal status and performance metrics"""
    try:
        status = await signal_service.get_signal_status(intersection_id)
        
        return {
            "success": True,
            "status": status,
            "intersection_id": intersection_id,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Get signal status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Emergency Green Corridor Endpoints
@app.post("/api/v1/emergency/corridor")
async def create_emergency_corridor(request: Dict[str, Any]):
    """Create emergency green corridor for ambulance"""
    try:
        emergency_location = request.get("emergency_location")
        destination = request.get("destination")  # Hospital
        vehicle_type = request.get("vehicle_type", "ambulance")
        priority = request.get("priority", "high")
        
        if not emergency_location or not destination:
            raise HTTPException(status_code=400, detail="Emergency location and destination are required")
        
        corridor = await emergency_service.create_corridor(
            emergency_location=emergency_location,
            destination=destination,
            vehicle_type=vehicle_type,
            priority=priority
        )
        
        return {
            "success": True,
            "corridor": corridor,
            "created_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Emergency corridor creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/emergency/corridor/{corridor_id}/update")
async def update_corridor(corridor_id: str, request: Dict[str, Any]):
    """Update emergency corridor with vehicle position"""
    try:
        current_location = request.get("current_location")
        estimated_arrival = request.get("estimated_arrival")
        
        if not current_location:
            raise HTTPException(status_code=400, detail="Current location is required")
        
        updated_corridor = await emergency_service.update_corridor(
            corridor_id=corridor_id,
            current_location=current_location,
            estimated_arrival=estimated_arrival
        )
        
        return {
            "success": True,
            "corridor": updated_corridor,
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Corridor update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/emergency/corridor/{corridor_id}")
async def close_corridor(corridor_id: str):
    """Close emergency corridor and restore normal traffic"""
    try:
        result = await emergency_service.close_corridor(corridor_id)
        
        return {
            "success": True,
            "corridor_id": corridor_id,
            "closed_at": datetime.now().isoformat(),
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Corridor closure error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch Processing Endpoints
@app.post("/api/v1/batch/process-traffic-cameras")
async def process_traffic_cameras(background_tasks: BackgroundTasks):
    """Batch process traffic camera feeds"""
    try:
        # Add background task to process all active cameras
        background_tasks.add_task(vehicle_service.batch_process_cameras)
        
        return {
            "success": True,
            "message": "Batch processing started",
            "started_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Batch processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/batch/update-predictions")
async def update_traffic_predictions(background_tasks: BackgroundTasks):
    """Update traffic predictions for all monitored areas"""
    try:
        background_tasks.add_task(traffic_service.batch_update_predictions)
        
        return {
            "success": True,
            "message": "Prediction update started",
            "started_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Batch prediction update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics Endpoints
@app.get("/api/v1/analytics/traffic-patterns")
async def get_traffic_patterns(
    area: str = None,
    time_period: int = 24,
    granularity: str = "hourly"
):
    """Get traffic pattern analytics"""
    try:
        patterns = await traffic_service.get_traffic_patterns(
            area=area,
            time_period=time_period,
            granularity=granularity
        )
        
        return {
            "success": True,
            "patterns": patterns,
            "parameters": {
                "area": area,
                "time_period": time_period,
                "granularity": granularity
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Traffic patterns error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/performance-metrics")
async def get_performance_metrics():
    """Get AI service performance metrics"""
    try:
        metrics = {
            "traffic_prediction": await traffic_service.get_metrics(),
            "vehicle_detection": await vehicle_service.get_metrics(),
            "signal_optimization": await signal_service.get_metrics(),
            "emergency_corridor": await emergency_service.get_metrics()
        }
        
        return {
            "success": True,
            "metrics": metrics,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Performance metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
