import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const generateUserId = async (): Promise<string> => {
    try {
      const lastId = await AsyncStorage.getItem('lastUserId');
      const nextId = lastId ? parseInt(lastId) + 1 : 1;
      await AsyncStorage.setItem('lastUserId', nextId.toString());
      return `USR-${nextId.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating user ID:', error);
      return `USR-${Date.now()}`;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // For demo mode, create user locally without backend
      // In production, you would call the backend API here
      const userId = await generateUserId();
      const newUser: User = {
        user_id: userId,
        name: userData.name,
        phone: userData.phone,
        email: userData.email || '',
        vehicle_type: userData.vehicle_type,
        emergency_contact_primary: userData.emergency_contact_primary,
        emergency_contact_secondary: userData.emergency_contact_secondary || '',
        civic_points: 0,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      setUser(newUser);
      await saveUserToStorage(newUser);
      
      console.log('User registered successfully:', newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Demo mode - accept any OTP
      // In production, validate OTP with backend
      console.log('Login attempt:', { phone, otp });
      
      // Check if user exists in storage
      const usersStr = await AsyncStorage.getItem('allUsers');
      let allUsers = usersStr ? JSON.parse(usersStr) : [];
      
      let existingUser = allUsers.find((u: any) => u.phone === phone);
      
      if (!existingUser) {
        // Create new user for this phone
        const userId = await generateUserId();
        existingUser = {
          user_id: userId,
          name: 'User ' + phone.slice(-4),
          phone: phone,
          email: '',
          vehicle_type: 'car',
          emergency_contact_primary: '',
          emergency_contact_secondary: '',
          civic_points: 100,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        };
        
        allUsers.push(existingUser);
        await AsyncStorage.setItem('allUsers', JSON.stringify(allUsers));
      }

      setUser(existingUser);
      await saveUserToStorage(existingUser);
      
      console.log('Login successful:', existingUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, last_active: new Date().toISOString() };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
