import numpy as np
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from collections import defaultdict, deque
import json
from utils.logger import setup_logger
from models.database import Database

logger = setup_logger(__name__)

class SignalOptimizationService:
    """AI-powered traffic signal optimization service"""
    
    def __init__(self):
        self.db = Database()
        self.signal_timings = {}
        self.optimization_history = defaultdict(list)
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the signal optimization service"""
        try:
            # Load existing signal configurations
            await self.load_signal_configurations()
            self.is_initialized = True
            logger.info("Signal optimization service initialized")
            
        except Exception as e:
            logger.error(f"Error initializing signal service: {str(e)}")
            self.is_initialized = False
    
    async def load_signal_configurations(self):
        """Load traffic signal configurations from database"""
        try:
            signals = await self.db.get_traffic_signals()
            
            for signal in signals:
                self.signal_timings[signal['intersection_id']] = {
                    'current_timings': signal['timings'],
                    'last_optimized': signal.get('last_optimized'),
                    'optimization_count': signal.get('optimization_count', 0)
                }
            
            logger.info(f"Loaded {len(signals)} signal configurations")
            
        except Exception as e:
            logger.error(f"Error loading signal configurations: {str(e)}")
    
    async def optimize_signals(self, intersection_id: str, traffic_data: Dict[str, Any], 
                             current_timings: Dict[str, Any] = None) -> Dict[str, Any]:
        """Optimize traffic signal timings for an intersection"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Get current signal state
            if not current_timings:
                current_timings = self.signal_timings.get(intersection_id, {}).get('current_timings', {})
            
            # Analyze traffic patterns
            traffic_analysis = self.analyze_traffic_patterns(traffic_data)
            
            # Calculate optimal timings
            optimized_timings = self.calculate_optimal_timings(
                traffic_analysis, current_timings
            )
            
            # Validate timings
            validated_timings = self.validate_signal_timings(optimized_timings)
            
            # Calculate improvement metrics
            improvement_metrics = self.calculate_improvement_metrics(
                current_timings, validated_timings, traffic_analysis
            )
            
            # Store optimization results
            await self.store_optimization_results(
                intersection_id, validated_timings, improvement_metrics
            )
            
            # Update local cache
            if intersection_id not in self.signal_timings:
                self.signal_timings[intersection_id] = {}
            
            self.signal_timings[intersection_id].update({
                'current_timings': validated_timings,
                'last_optimized': datetime.now(),
                'optimization_count': self.signal_timings[intersection_id].get('optimization_count', 0) + 1
            })
            
            return {
                'intersection_id': intersection_id,
                'optimized_timings': validated_timings,
                'improvement_metrics': improvement_metrics,
                'traffic_analysis': traffic_analysis,
                'optimized_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing signals: {str(e)}")
            return self.get_fallback_optimization(intersection_id, current_timings)
    
    def analyze_traffic_patterns(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze traffic patterns for signal optimization"""
        try:
            lane_data = traffic_data.get('lane_data', {})
            vehicle_counts = traffic_data.get('vehicle_counts', {})
            flow_rates = traffic_data.get('flow_rates', {})
            queue_lengths = traffic_data.get('queue_lengths', {})
            
            # Calculate traffic density per approach
            approach_densities = {}
            total_vehicles = sum(vehicle_counts.values())
            
            for approach, count in vehicle_counts.items():
                if total_vehicles > 0:
                    approach_densities[approach] = count / total_vehicles
                else:
                    approach_densities[approach] = 0.0
            
            # Calculate priority scores for each approach
            priority_scores = {}
            for approach in vehicle_counts:
                score = self.calculate_approach_priority(
                    approach, vehicle_counts, flow_rates, queue_lengths
                )
                priority_scores[approach] = score
            
            # Identify peak approaches
            peak_approaches = sorted(priority_scores.items(), key=lambda x: x[1], reverse=True)
            
            return {
                'vehicle_counts': vehicle_counts,
                'flow_rates': flow_rates,
                'queue_lengths': queue_lengths,
                'approach_densities': approach_densities,
                'priority_scores': priority_scores,
                'peak_approaches': peak_approaches[:3],  # Top 3 approaches
                'total_vehicles': total_vehicles,
                'congestion_level': self.determine_congestion_level(queue_lengths)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing traffic patterns: {str(e)}")
            return {}
    
    def calculate_approach_priority(self, approach: str, vehicle_counts: Dict[str, int],
                                  flow_rates: Dict[str, float], queue_lengths: Dict[str, int]) -> float:
        """Calculate priority score for a traffic approach"""
        try:
            # Base score from vehicle count
            count_score = vehicle_counts.get(approach, 0) * 0.4
            
            # Flow rate contribution
            flow_score = flow_rates.get(approach, 0) * 0.3
            
            # Queue length penalty (longer queues get higher priority)
            queue_penalty = queue_lengths.get(approach, 0) * 0.2
            
            # Time-based factor (approaches waiting longer get priority)
            time_factor = 0.1  # Would be calculated from actual waiting times
            
            priority = count_score + flow_score + queue_penalty + time_factor
            return min(priority, 100.0)  # Cap at 100
            
        except Exception as e:
            logger.error(f"Error calculating approach priority: {str(e)}")
            return 0.0
    
    def determine_congestion_level(self, queue_lengths: Dict[str, int]) -> str:
        """Determine overall congestion level"""
        try:
            if not queue_lengths:
                return 'low'
            
            avg_queue_length = np.mean(list(queue_lengths.values()))
            
            if avg_queue_length > 15:
                return 'severe'
            elif avg_queue_length > 10:
                return 'high'
            elif avg_queue_length > 5:
                return 'medium'
            else:
                return 'low'
                
        except Exception as e:
            logger.error(f"Error determining congestion level: {str(e)}")
            return 'medium'
    
    def calculate_optimal_timings(self, traffic_analysis: Dict[str, Any],
                               current_timings: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate optimal signal timings using AI algorithms"""
        try:
            priority_scores = traffic_analysis.get('priority_scores', {})
            vehicle_counts = traffic_analysis.get('vehicle_counts', {})
            
            # Base cycle time (seconds)
            base_cycle_time = 120
            min_phase_time = 15  # Minimum green time per phase
            max_phase_time = 60  # Maximum green time per phase
            
            # Calculate total priority weight
            total_priority = sum(priority_scores.values()) if priority_scores else 1
            
            # Calculate green time distribution
            green_times = {}
            total_green_time = base_cycle_time - (len(priority_scores) * 5)  # 5s amber per phase
            
            for approach, priority in priority_scores.items():
                if total_priority > 0:
                    # Proportional allocation based on priority
                    green_time = (priority / total_priority) * total_green_time
                    green_time = max(min_phase_time, min(max_phase_time, green_time))
                    green_times[approach] = int(green_time)
                else:
                    green_times[approach] = min_phase_time
            
            # Adjust for pedestrian crossing times
            pedestrian_times = self.calculate_pedestrian_timings(green_times)
            
            # Calculate phase sequence
            phase_sequence = self.optimize_phase_sequence(priority_scores)
            
            # Calculate all-red intervals
            all_red_intervals = self.calculate_all_red_intervals(green_times)
            
            optimized_timings = {
                'cycle_time': base_cycle_time,
                'green_times': green_times,
                'amber_times': {phase: 5 for phase in green_times},  # 5 seconds amber
                'all_red_times': all_red_intervals,
                'pedestrian_times': pedestrian_times,
                'phase_sequence': phase_sequence,
                'optimization_method': 'priority_weighted'
            }
            
            return optimized_timings
            
        except Exception as e:
            logger.error(f"Error calculating optimal timings: {str(e)}")
            return self.get_default_timings()
    
    def calculate_pedestrian_timings(self, green_times: Dict[str, int]) -> Dict[str, int]:
        """Calculate pedestrian crossing times"""
        try:
            pedestrian_times = {}
            
            for phase in green_times:
                # Minimum pedestrian crossing time based on road width
                # Assuming average walking speed of 1.2 m/s and road width of 14m
                min_crossing_time = 12  # seconds
                pedestrian_times[phase] = max(min_crossing_time, green_times[phase] - 5)
            
            return pedestrian_times
            
        except Exception as e:
            logger.error(f"Error calculating pedestrian timings: {str(e)}")
            return {}
    
    def optimize_phase_sequence(self, priority_scores: Dict[str, float]) -> List[str]:
        """Optimize the sequence of signal phases"""
        try:
            # Sort phases by priority (highest first)
            sorted_phases = sorted(priority_scores.items(), key=lambda x: x[1], reverse=True)
            
            # Create sequence with compatible phases grouped
            sequence = []
            used_phases = set()
            
            for phase, _ in sorted_phases:
                if phase not in used_phases:
                    # Find compatible phases that can run together
                    compatible_phases = self.find_compatible_phases(phase, used_phases, priority_scores)
                    sequence.extend(compatible_phases)
                    used_phases.update(compatible_phases)
            
            return sequence
            
        except Exception as e:
            logger.error(f"Error optimizing phase sequence: {str(e)}")
            return list(priority_scores.keys())
    
    def find_compatible_phases(self, phase: str, used_phases: set, 
                             priority_scores: Dict[str, float]) -> List[str]:
        """Find phases that can run together with the given phase"""
        try:
            # Simplified compatibility matrix
            # In reality, this would be based on intersection geometry
            compatibility = {
                'north': ['north'],
                'south': ['south'],
                'east': ['east'],
                'west': ['west'],
                'north_south': ['north', 'south'],
                'east_west': ['east', 'west']
            }
            
            # For demo, return single phase
            return [phase]
            
        except Exception as e:
            logger.error(f"Error finding compatible phases: {str(e)}")
            return [phase]
    
    def calculate_all_red_intervals(self, green_times: Dict[str, int]) -> Dict[str, int]:
        """Calculate all-red intervals for safety"""
        try:
            all_red_times = {}
            
            for phase in green_times:
                # All-red time based on intersection size and speed limits
                # Assuming 3 seconds for small intersections, 5 for large ones
                all_red_times[phase] = 3
            
            return all_red_times
            
        except Exception as e:
            logger.error(f"Error calculating all-red intervals: {str(e)}")
            return {phase: 3 for phase in green_times}
    
    def validate_signal_timings(self, timings: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and adjust signal timings"""
        try:
            validated = timings.copy()
            
            # Ensure minimum phase times
            min_green = 15
            max_green = 90
            
            green_times = validated.get('green_times', {})
            for phase, time in green_times.items():
                if time < min_green:
                    green_times[phase] = min_green
                elif time > max_green:
                    green_times[phase] = max_green
            
            # Ensure cycle time consistency
            total_phase_time = sum(green_times.values()) + len(green_times) * 5  # Green + amber
            if total_phase_time > 180:  # Maximum cycle time
                scale_factor = 180 / total_phase_time
                for phase in green_times:
                    green_times[phase] = int(green_times[phase] * scale_factor)
            
            validated['green_times'] = green_times
            validated['cycle_time'] = total_phase_time
            
            return validated
            
        except Exception as e:
            logger.error(f"Error validating signal timings: {str(e)}")
            return self.get_default_timings()
    
    def get_default_timings(self) -> Dict[str, Any]:
        """Get default signal timings"""
        return {
            'cycle_time': 120,
            'green_times': {
                'north': 30,
                'south': 30,
                'east': 25,
                'west': 25
            },
            'amber_times': {
                'north': 5,
                'south': 5,
                'east': 5,
                'west': 5
            },
            'all_red_times': {
                'north': 3,
                'south': 3,
                'east': 3,
                'west': 3
            },
            'phase_sequence': ['north', 'south', 'east', 'west'],
            'optimization_method': 'default'
        }
    
    def calculate_improvement_metrics(self, current_timings: Dict[str, Any],
                                    optimized_timings: Dict[str, Any],
                                    traffic_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate improvement metrics for the optimization"""
        try:
            # Calculate estimated reduction in waiting time
            current_cycle = current_timings.get('cycle_time', 120)
            optimized_cycle = optimized_timings.get('cycle_time', 120)
            
            cycle_reduction = ((current_cycle - optimized_cycle) / current_cycle) * 100
            
            # Calculate estimated improvement in traffic flow
            priority_scores = traffic_analysis.get('priority_scores', {})
            green_times = optimized_timings.get('green_times', {})
            
            flow_improvement = 0
            if priority_scores and green_times:
                # Simplified calculation based on better phase distribution
                total_priority = sum(priority_scores.values())
                weighted_green_time = sum(
                    priority_scores.get(phase, 0) * green_times.get(phase, 0)
                    for phase in priority_scores
                )
                
                if total_priority > 0:
                    flow_improvement = (weighted_green_time / (total_priority * 30)) * 100
            
            # Calculate fuel savings estimate
            fuel_savings = cycle_reduction * 0.5  # Rough estimate
            
            return {
                'cycle_time_reduction_percent': max(0, cycle_reduction),
                'estimated_flow_improvement_percent': min(30, flow_improvement),
                'estimated_fuel_savings_percent': max(0, fuel_savings),
                'congestion_reduction': traffic_analysis.get('congestion_level') == 'high',
                'optimization_efficiency': min(100, flow_improvement + cycle_reduction)
            }
            
        except Exception as e:
            logger.error(f"Error calculating improvement metrics: {str(e)}")
            return {
                'cycle_time_reduction_percent': 0,
                'estimated_flow_improvement_percent': 0,
                'estimated_fuel_savings_percent': 0,
                'congestion_reduction': False,
                'optimization_efficiency': 0
            }
    
    async def store_optimization_results(self, intersection_id: str, 
                                      optimized_timings: Dict[str, Any],
                                      improvement_metrics: Dict[str, Any]):
        """Store optimization results in database"""
        try:
            await self.db.store_signal_optimization(
                intersection_id, optimized_timings, improvement_metrics
            )
            
            # Add to optimization history
            self.optimization_history[intersection_id].append({
                'timestamp': datetime.now(),
                'timings': optimized_timings,
                'metrics': improvement_metrics
            })
            
            # Keep only last 100 optimizations per intersection
            if len(self.optimization_history[intersection_id]) > 100:
                self.optimization_history[intersection_id] = self.optimization_history[intersection_id][-100:]
            
        except Exception as e:
            logger.error(f"Error storing optimization results: {str(e)}")
    
    async def get_signal_status(self, intersection_id: str) -> Dict[str, Any]:
        """Get current signal status and performance metrics"""
        try:
            # Get current timings
            current_timings = self.signal_timings.get(intersection_id, {}).get('current_timings', {})
            
            # Get recent performance data
            performance_data = await self.db.get_signal_performance(intersection_id, hours=24)
            
            # Calculate current performance metrics
            current_metrics = self.calculate_current_performance(performance_data)
            
            # Get optimization history
            history = self.optimization_history.get(intersection_id, [])
            
            return {
                'intersection_id': intersection_id,
                'current_timings': current_timings,
                'current_metrics': current_metrics,
                'optimization_history': history[-10:],  # Last 10 optimizations
                'last_optimized': self.signal_timings.get(intersection_id, {}).get('last_optimized'),
                'optimization_count': self.signal_timings.get(intersection_id, {}).get('optimization_count', 0),
                'status': 'active' if current_timings else 'inactive',
                'retrieved_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting signal status: {str(e)}")
            return {'error': str(e)}
    
    def calculate_current_performance(self, performance_data: List[Dict]) -> Dict[str, Any]:
        """Calculate current performance metrics"""
        try:
            if not performance_data:
                return {
                    'average_delay': 0,
                    'throughput': 0,
                    'queue_length': 0,
                    'level_of_service': 'A'
                }
            
            # Calculate metrics from performance data
            delays = [d.get('delay', 0) for d in performance_data]
            throughputs = [d.get('throughput', 0) for d in performance_data]
            queues = [d.get('queue_length', 0) for d in performance_data]
            
            avg_delay = np.mean(delays) if delays else 0
            avg_throughput = np.mean(throughputs) if throughputs else 0
            avg_queue = np.mean(queues) if queues else 0
            
            # Determine Level of Service (LOS)
            los = self.calculate_level_of_service(avg_delay, avg_queue)
            
            return {
                'average_delay': avg_delay,
                'throughput': avg_throughput,
                'queue_length': avg_queue,
                'level_of_service': los
            }
            
        except Exception as e:
            logger.error(f"Error calculating current performance: {str(e)}")
            return {
                'average_delay': 0,
                'throughput': 0,
                'queue_length': 0,
                'level_of_service': 'C'
            }
    
    def calculate_level_of_service(self, delay: float, queue_length: int) -> str:
        """Calculate Level of Service based on delay and queue length"""
        try:
            if delay < 10 and queue_length < 5:
                return 'A'
            elif delay < 20 and queue_length < 10:
                return 'B'
            elif delay < 35 and queue_length < 15:
                return 'C'
            elif delay < 55 and queue_length < 20:
                return 'D'
            elif delay < 80 and queue_length < 25:
                return 'E'
            else:
                return 'F'
                
        except Exception as e:
            logger.error(f"Error calculating LOS: {str(e)}")
            return 'C'
    
    def get_fallback_optimization(self, intersection_id: str, 
                                current_timings: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get fallback optimization when service is unavailable"""
        default_timings = self.get_default_timings()
        
        return {
            'intersection_id': intersection_id,
            'optimized_timings': default_timings,
            'improvement_metrics': {
                'cycle_time_reduction_percent': 0,
                'estimated_flow_improvement_percent': 0,
                'estimated_fuel_savings_percent': 0,
                'congestion_reduction': False,
                'optimization_efficiency': 0
            },
            'traffic_analysis': {},
            'optimized_at': datetime.now().isoformat(),
            'fallback': True
        }
    
    async def health_check(self) -> str:
        """Check service health"""
        try:
            if self.is_initialized:
                return "healthy"
            else:
                return "degraded"
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            return "unhealthy"
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get service performance metrics"""
        return {
            "initialized": self.is_initialized,
            "active_intersections": len(self.signal_timings),
            "optimizations_today": 0,  # Would be tracked in production
            "average_improvement": 15.2,  # Would be calculated from history
            "last_optimization": datetime.now().isoformat()
        }
