import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const RewardsScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');

  const availableRewards = [
    {
      id: '1',
      partner: 'Coffee House',
      title: 'Free Coffee',
      description: 'Get a free coffee on your next visit',
      points: 200,
      logo: '☕',
    },
    {
      id: '2',
      partner: 'Gas Station',
      title: 'Fuel Discount',
      description: '10% off on fuel purchase',
      points: 500,
      logo: '⛽',
    },
    {
      id: '3',
      partner: 'Restaurant',
      title: 'Dinner Voucher',
      description: 'Get 20% off on dinner for two',
      points: 1000,
      logo: '🍽️',
    },
  ];

  const redeemedRewards = [
    {
      id: '4',
      partner: 'Coffee House',
      title: 'Free Coffee',
      redeemedDate: '2024-01-15',
      couponCode: 'COFFEE123',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Traffic Hero', points: 2500, badge: '🏆' },
    { rank: 2, name: 'Road Guardian', points: 2100, badge: '🥈' },
    { rank: 3, name: 'City Helper', points: 1800, badge: '🥉' },
    { rank: 4, name: user?.name || 'You', points: user?.civic_points || 0, badge: '📍' },
  ];

  const handleRedeem = (reward: any) => {
    if ((user?.civic_points || 0) >= reward.points) {
      Alert.alert(
        'Confirm Redemption',
        `Redeem ${reward.title} for ${reward.points} points?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Redeem',
            onPress: () => {
              updateUser({
                civic_points: (user?.civic_points || 0) - reward.points,
              });
              Alert.alert('Success', 'Coupon redeemed successfully!');
            },
          },
        ]
      );
    } else {
      Alert.alert('Insufficient Points', `You need ${reward.points} points to redeem this reward.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Points Balance */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{user?.civic_points || 0}</Text>
        <Text style={styles.pointsSubtitle}>Keep contributing to earn more!</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'redeemed' && styles.activeTab]}
          onPress={() => setActiveTab('redeemed')}
        >
          <Text style={[styles.tabText, activeTab === 'redeemed' && styles.activeTabText]}>
            Redeemed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'available' ? (
          <View>
            {availableRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardLogo}>{reward.logo}</Text>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardPartner}>{reward.partner}</Text>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  </View>
                </View>
                <View style={styles.rewardFooter}>
                  <Text style={styles.rewardPoints}>{reward.points} points</Text>
                  <TouchableOpacity
                    style={styles.redeemButton}
                    onPress={() => handleRedeem(reward)}
                  >
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            {redeemedRewards.map((reward) => (
              <View key={reward.id} style={styles.redeemedCard}>
                <View style={styles.redeemedHeader}>
                  <Text style={styles.redeemedTitle}>{reward.title}</Text>
                  <Text style={styles.redeemedPartner}>{reward.partner}</Text>
                </View>
                <View style={styles.redeemedDetails}>
                  <Text style={styles.redeemedDate}>Redeemed: {reward.redeemedDate}</Text>
                  <Text style={styles.couponCode}>Code: {reward.couponCode}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          {leaderboard.map((user) => (
            <View key={user.rank} style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>
                <Text style={styles.rankBadge}>{user.badge}</Text>
                <Text style={styles.rankNumber}>#{user.rank}</Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPoints}>{user.points} pts</Text>
            </View>
          ))}
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
  pointsCard: {
    backgroundColor: '#2ecc71',
    padding: 24,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 8,
  },
  pointsSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2ecc71',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  rewardCard: {
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
  rewardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rewardLogo: {
    fontSize: 32,
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardPartner: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
    marginBottom: 2,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  redeemButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  redeemButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  redeemedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    opacity: 0.8,
  },
  redeemedHeader: {
    marginBottom: 8,
  },
  redeemedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  redeemedPartner: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  redeemedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  redeemedDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
  },
  leaderboardContainer: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rankBadge: {
    fontSize: 20,
    marginRight: 8,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  userPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
});

export default RewardsScreen;
