import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface RegistrationScreenProps {
  onComplete: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergency_contact_primary: '',
    emergency_contact_secondary: '',
    vehicle_type: 'car' as const,
  });
  const [otp, setOtp] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSendOtp = () => {
    if (!formData.name || !formData.phone || !formData.emergency_contact_primary) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setShowOtpScreen(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP (at least 4 digits)');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Registering user with data:', formData);
      const success = await register(formData);
      if (success) {
        console.log('Registration successful! User should be logged in now.');
        // Don't call onComplete here - let the navigator detect the user change
        // The AppNavigator will automatically show the main app when user is set
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showOtpScreen) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            We've sent an OTP to {formData.phone}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowOtpScreen(false)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the SmartRoad community</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Email (Optional)"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Vehicle Type *</Text>
        <View style={styles.vehicleOptions}>
          {(['car', 'bike', 'walking'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.vehicleOption,
                formData.vehicle_type === type && styles.vehicleOptionSelected,
              ]}
              onPress={() => updateFormData('vehicle_type', type)}
            >
              <Text
                style={[
                  styles.vehicleOptionText,
                  formData.vehicle_type === type && styles.vehicleOptionTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Emergency Contact *"
          value={formData.emergency_contact_primary}
          onChangeText={(value) => updateFormData('emergency_contact_primary', value)}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Secondary Emergency Contact (Optional)"
          value={formData.emergency_contact_secondary}
          onChangeText={(value) => updateFormData('emergency_contact_secondary', value)}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  vehicleOptions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  vehicleOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  vehicleOptionSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  vehicleOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  vehicleOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    color: '#2ecc71',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RegistrationScreen;
