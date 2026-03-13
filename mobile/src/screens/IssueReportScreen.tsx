import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Camera } from 'expo-camera';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

const IssueReportScreen: React.FC = () => {
  const { location } = useLocation();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { id: 'pothole', name: 'Pothole', icon: '🕳️' },
    { id: 'roadblock', name: 'Roadblock', icon: '🚧' },
    { id: 'waterlogging', name: 'Waterlogging', icon: '💧' },
    { id: 'broken_signal', name: 'Broken Signal', icon: '🚦' },
    { id: 'accident', name: 'Accident', icon: '🚨' },
  ];

  const handleTakePhoto = async () => {
    try {
      // In a real app, this would open the camera
      // For demo, we'll simulate photo capture
      Alert.alert('Camera', 'Camera would open here to capture photo');
      setPhoto('mock-photo-url');
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleSubmit = async () => {
    if (!selectedIssue) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      const reportData = {
        user_id: user?.user_id,
        issue_type: selectedIssue,
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
        description: description.trim(),
        photo_url: photo,
        timestamp: new Date().toISOString(),
      };

      console.log('Submitting report:', reportData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Issue reported successfully! You will earn 50 civic points when verified.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form or go back
              setSelectedIssue('');
              setDescription('');
              setPhoto(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Report Road Issue</Text>
        <Text style={styles.subtitle}>
          Help improve road safety by reporting issues in your area
        </Text>

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Issue Type</Text>
          <View style={styles.issueTypesContainer}>
            {issueTypes.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueTypeCard,
                  selectedIssue === issue.id && styles.selectedIssueType,
                ]}
                onPress={() => setSelectedIssue(issue.id)}
              >
                <Text style={styles.issueIcon}>{issue.icon}</Text>
                <Text style={[
                  styles.issueName,
                  selectedIssue === issue.id && styles.selectedIssueName,
                ]}>
                  {issue.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoContainer} onPress={handleTakePhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Tap to take photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the issue in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {location 
                ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
                : 'Getting location...'
              }
            </Text>
            <Text style={styles.locationSubtext}>
              GPS location will be automatically included
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        {/* Points Info */}
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsText}>
            🏆 Earn 50 civic points when your report is verified
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  issueTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  issueTypeCard: {
    width: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedIssueType: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fff4',
  },
  issueIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  issueName: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedIssueName: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  photoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 100,
  },
  locationContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  pointsInfo: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
});

export default IssueReportScreen;
