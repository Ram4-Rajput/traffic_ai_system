import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const EmergencyScreen: React.FC = () => {
  const { location } = useLocation();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(15);
  const [isCountingDown, setIsCountingDown] = useState(true);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCountingDown) {
      triggerEmergencyAlert();
    }
  }, [countdown, isCountingDown]);

  const handleImSafe = () => {
    setIsCountingDown(false);
    Alert.alert('Safe', 'Glad to know you are safe!');
  };

  const triggerEmergencyAlert = () => {
    setIsCountingDown(false);
    Alert.alert(
      'Emergency Alert Sent',
      'Emergency services have been notified with your location.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back or handle post-emergency actions
            console.log('Emergency alert triggered');
          },
        },
      ]
    );
  };

  const sendEmergencyHelp = () => {
    setIsCountingDown(false);
    triggerEmergencyAlert();
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>
          
          <Text style={styles.title}>Possible Accident Detected</Text>
          <Text style={styles.subtitle}>
            We detected unusual motion patterns. Are you okay?
          </Text>
          
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>Sending help in</Text>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </View>
            <Text style={styles.countdownText}>seconds</Text>
          </View>
          
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Your Location:</Text>
            <Text style={styles.locationText}>
              {location 
                ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
                : 'Getting location...'
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.safeButton]}
            onPress={handleImSafe}
          >
            <Text style={styles.safeButtonText}>I'm Safe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.emergencyButton]}
            onPress={sendEmergencyHelp}
          >
            <Text style={styles.emergencyButtonText}>Send Emergency Help</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.emergencyContacts}>
          <Text style={styles.contactsTitle}>Emergency Contacts Notified:</Text>
          <Text style={styles.contactText}>
            Primary: {user?.emergency_contact_primary || 'Not set'}
          </Text>
          {user?.emergency_contact_secondary && (
            <Text style={styles.contactText}>
              Secondary: {user?.emergency_contact_secondary}
            </Text>
          )}
          <Text style={styles.contactText}>Emergency Services: 108</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e74c3c',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  warningCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  countdownCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  locationInfo: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%',
  },
  locationLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  safeButton: {
    backgroundColor: '#2ecc71',
  },
  safeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emergencyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  emergencyContacts: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  contactsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
});

export default EmergencyScreen;
