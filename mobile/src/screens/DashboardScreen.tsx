import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { location } = useLocation();
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [showNavigation, setShowNavigation] = useState(false);
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    if (location) {
      console.log('Current location:', location.coords);
    }
  }, [location]);

  const handleStartNavigation = () => {
    if (!destination) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }
    
    // Mock route calculation
    const mockRoute = {
      coordinates: [
        location?.coords,
        { latitude: location!.coords.latitude + 0.01, longitude: location!.coords.longitude + 0.01 },
        { latitude: location!.coords.latitude + 0.02, longitude: location!.coords.longitude + 0.02 },
      ],
      distance: 2.5,
      estimatedTime: 8,
    };
    
    setRoute(mockRoute);
    setShowNavigation(true);
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Select issue type:',
      [
        { text: 'Pothole', onPress: () => console.log('Report pothole') },
        { text: 'Roadblock', onPress: () => console.log('Report roadblock') },
        { text: 'Waterlogging', onPress: () => console.log('Report waterlogging') },
        { text: 'Broken Signal', onPress: () => console.log('Report broken signal') },
        { text: 'Accident', onPress: () => console.log('Report accident') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
          description={user?.name}
        />

        {/* Traffic heatmap circles (mock data) */}
        <Circle
          center={{
            latitude: location.coords.latitude + 0.005,
            longitude: location.coords.longitude + 0.005,
          }}
          radius={100}
          fillColor="rgba(255, 0, 0, 0.3)"
          strokeColor="rgba(255, 0, 0, 0.5)"
        />

        {/* Route polyline */}
        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#2ecc71"
            strokeWidth={4}
          />
        )}

        {/* Mock hazard markers */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude + 0.003,
            longitude: location.coords.longitude - 0.003,
          }}
          pinColor="orange"
          title="Pothole"
          description="Reported 2 hours ago"
        />
      </MapView>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          value={destination}
          onChangeText={setDestination}
          onSubmitEditing={handleStartNavigation}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleStartNavigation}>
          <Text style={styles.searchButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation card */}
      {showNavigation && route && (
        <View style={styles.navigationCard}>
          <View style={styles.navigationInfo}>
            <View>
              <Text style={styles.navigationTime}>{route.estimatedTime} min</Text>
              <Text style={styles.navigationDistance}>{route.distance} km</Text>
            </View>
            <TouchableOpacity
              style={styles.startNavigationButton}
              onPress={() => console.log('Start navigation')}
            >
              <Text style={styles.startNavigationText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Report issue FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleReportIssue}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Traffic alert */}
      <View style={styles.alertContainer}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Pothole ahead</Text>
          <Text style={styles.alertDescription}>150m</Text>
          <View style={styles.alertButtons}>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Still there</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  navigationCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  navigationDistance: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  startNavigationButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startNavigationText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  alertContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 12,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alertButtonText: {
    fontSize: 12,
    color: '#2c3e50',
  },
});

export default DashboardScreen;
