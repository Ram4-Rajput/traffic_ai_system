import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface NavigationScreenProps {
  route: any;
  navigation: any;
}

const NavigationScreen: React.FC<NavigationScreenProps> = ({ route, navigation }) => {
  const { location } = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const destination = route.params?.destination || {
    latitude: location?.coords.latitude || 0 + 0.01,
    longitude: location?.coords.longitude || 0 + 0.01,
  };

  const routeSteps = [
    {
      instruction: "Head north on Main Street",
      distance: "200m",
      duration: "1 min"
    },
    {
      instruction: "Turn right onto Oak Avenue",
      distance: "500m", 
      duration: "3 min"
    },
    {
      instruction: "Continue straight for 1km",
      distance: "1km",
      duration: "5 min"
    },
    {
      instruction: "Destination on your left",
      distance: "50m",
      duration: "1 min"
    }
  ];

  useEffect(() => {
    if (route.params?.startNavigation) {
      startNavigation();
    }
  }, [route.params]);

  const startNavigation = () => {
    setIsNavigating(true);
    // Start real-time navigation logic here
  };

  const stopNavigation = () => {
    Alert.alert(
      'Stop Navigation',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', onPress: () => navigation.goBack() },
      ]
    );
  };

  const nextStep = () => {
    if (currentStep < routeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Arrived', 'You have reached your destination!');
      navigation.goBack();
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Getting location...</Text>
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
        {/* User location */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        />

        {/* Destination */}
        <Marker
          coordinate={destination}
          pinColor="red"
          title="Destination"
        />

        {/* Route line */}
        <Polyline
          coordinates={[
            location.coords,
            { latitude: location.coords.latitude + 0.005, longitude: location.coords.longitude + 0.005 },
            { latitude: location.coords.latitude + 0.01, longitude: location.coords.longitude + 0.01 },
            destination,
          ]}
          strokeColor="#2ecc71"
          strokeWidth={4}
        />
      </MapView>

      {/* Navigation instruction card */}
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepNumber}>{currentStep + 1}</Text>
          </View>
          <View style={styles.instructionText}>
            <Text style={styles.instruction}>{routeSteps[currentStep].instruction}</Text>
            <Text style={styles.instructionDetail}>
              {routeSteps[currentStep].distance} • {routeSteps[currentStep].duration}
            </Text>
          </View>
        </View>

        <View style={styles.instructionActions}>
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Speed and distance info */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Speed</Text>
          <Text style={styles.infoValue}>45 km/h</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>1.2 km</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>ETA</Text>
          <Text style={styles.infoValue}>8 min</Text>
        </View>
      </View>

      {/* Stop navigation button */}
      <TouchableOpacity style={styles.stopButton} onPress={stopNavigation}>
        <Text style={styles.stopButtonText}>End</Text>
      </TouchableOpacity>

      {/* Traffic alert */}
      <View style={styles.alertContainer}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ Heavy traffic ahead</Text>
          <Text style={styles.alertDescription}>Add 5 min to route</Text>
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
  instructionCard: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  instructionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBar: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  stopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#856404',
  },
});

export default NavigationScreen;
