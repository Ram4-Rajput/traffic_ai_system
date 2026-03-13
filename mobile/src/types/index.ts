export interface User {
  user_id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: 'car' | 'bike' | 'walking';
  emergency_contact_primary: string;
  emergency_contact_secondary: string;
  civic_points: number;
  created_at: string;
  last_active: string;
}

export interface TrafficData {
  user_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
  road_id?: string;
}

export interface RoadIssue {
  issue_id: string;
  user_id: string;
  issue_type: 'pothole' | 'roadblock' | 'waterlogging' | 'broken_signal' | 'accident';
  latitude: number;
  longitude: number;
  description: string;
  photo_url?: string;
  verified: boolean;
  verification_count: number;
  created_at: string;
}

export interface AccidentEvent {
  event_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  detected_at: string;
  resolved: boolean;
}

export interface Partner {
  partner_id: string;
  partner_name: string;
  business_type: string;
  coupon_title: string;
  coupon_description: string;
  points_required: number;
  validity_period: number;
  redemption_limit: number;
}

export interface Coupon {
  coupon_id: string;
  user_id: string;
  partner_id: string;
  coupon_code: string;
  points_used: number;
  status: 'active' | 'redeemed' | 'expired';
  expiry_date: string;
}

export interface NavigationRoute {
  route_id: string;
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  waypoints: { latitude: number; longitude: number }[];
  distance: number;
  estimated_time: number;
  traffic_alerts: TrafficAlert[];
}

export interface TrafficAlert {
  alert_id: string;
  type: 'pothole' | 'congestion' | 'hazard' | 'accident';
  latitude: number;
  longitude: number;
  description: string;
  distance_ahead: number;
  severity: 'low' | 'medium' | 'high';
}
