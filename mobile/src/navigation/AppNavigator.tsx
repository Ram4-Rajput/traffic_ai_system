import React, { useContext, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NavigationScreen from '../screens/NavigationScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreScreen from '../screens/ExploreScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import IssueReportScreen from '../screens/IssueReportScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#ecf0f1',
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#2ecc71',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Navigate' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Explore' }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ title: 'Rewards' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return <SplashScreen />;
  }
  
  const { user, isLoading } = authContext;
  const [showOnboarding, setShowOnboarding] = React.useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboarding = async () => {
      // In a real app, this would check AsyncStorage
      // For demo, we'll show onboarding first
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  // If user is logged in, show main app
  if (user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="Navigation"
          component={NavigationScreen}
          options={{
            headerShown: true,
            title: 'Navigation',
            headerStyle: { backgroundColor: '#2ecc71' },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="IssueReport"
          component={IssueReportScreen}
          options={{
            headerShown: true,
            title: 'Report Issue',
            headerStyle: { backgroundColor: '#2ecc71' },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    );
  }

  // If no user, show onboarding/registration flow
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onComplete={() => setShowOnboarding(false)}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Registration">
          {(props) => (
            <RegistrationScreen
              {...props}
              onComplete={() => {
                // Registration complete, user will be set in context
                // Navigator will re-render automatically
              }}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
