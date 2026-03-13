import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const ExploreScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'traffic', name: 'Traffic', icon: '🚗' },
    { id: 'hazards', name: 'Hazards', icon: '⚠️' },
    { id: 'accidents', name: 'Accidents', icon: '🚨' },
  ];

  const issues = [
    {
      id: '1',
      type: 'pothole',
      title: 'Large pothole on Main Street',
      location: 'Main Street & 5th Avenue',
      time: '2 hours ago',
      verified: true,
      severity: 'high',
    },
    {
      id: '2',
      type: 'traffic',
      title: 'Heavy traffic congestion',
      location: 'Highway 101 North',
      time: '30 minutes ago',
      verified: true,
      severity: 'medium',
    },
    {
      id: '3',
      type: 'broken_signal',
      title: 'Traffic light not working',
      location: 'Oak Avenue & Elm Street',
      time: '1 hour ago',
      verified: false,
      severity: 'high',
    },
  ];

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.type === selectedCategory);

  const handleVerify = (issueId: string) => {
    Alert.alert(
      'Verify Issue',
      'Is this issue still present?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log('Verified issue:', issueId) },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'pothole': return '🕳️';
      case 'traffic': return '🚗';
      case 'broken_signal': return '🚦';
      case 'accident': return '🚨';
      case 'waterlogging': return '💧';
      default: return '⚠️';
    }
  };

  return (
    <View style={styles.container}>
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Issues List */}
      <ScrollView style={styles.issuesContainer}>
        {filteredIssues.map((issue) => (
          <View key={issue.id} style={styles.issueCard}>
            <View style={styles.issueHeader}>
              <View style={styles.issueInfo}>
                <View style={styles.issueTitleRow}>
                  <Text style={styles.issueIcon}>{getIssueIcon(issue.type)}</Text>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                </View>
                <Text style={styles.issueLocation}>{issue.location}</Text>
                <Text style={styles.issueTime}>{issue.time}</Text>
              </View>
              <View style={styles.issueBadges}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(issue.severity) },
                ]}>
                  <Text style={styles.severityText}>
                    {issue.severity.toUpperCase()}
                  </Text>
                </View>
                {issue.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => handleVerify(issue.id)}
            >
              <Text style={styles.verifyButtonText}>Verify Issue</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  categoriesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCategory: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  issuesContainer: {
    flex: 1,
    padding: 20,
  },
  issueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  issueHeader: {
    marginBottom: 12,
  },
  issueInfo: {
    marginBottom: 8,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  issueLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  issueTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  issueBadges: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  verifiedBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  verifyButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExploreScreen;
