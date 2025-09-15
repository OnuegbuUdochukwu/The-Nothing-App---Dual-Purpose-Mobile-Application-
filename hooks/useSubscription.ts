import * as React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@nothing_app_subscription';

type SubscriptionState = {
  isPremium: boolean;
  expiryDate: string | null;
};

type SubscriptionContextType = {
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => Promise<void>;
  checkPremiumFeatures: () => boolean;
  showPremiumModal: () => void;
};

const defaultState: SubscriptionState = {
  isPremium: false,
  expiryDate: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(defaultState);

  useEffect(() => {
    loadSubscriptionState();
  }, []);

  const loadSubscriptionState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as SubscriptionState;
        
        // Check if subscription has expired
        if (parsedState.expiryDate) {
          const expiryDate = new Date(parsedState.expiryDate);
          if (expiryDate < new Date()) {
            // Subscription expired
            setSubscriptionState(defaultState);
            await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(defaultState));
            return;
          }
        }
        
        setSubscriptionState(parsedState);
      }
    } catch (error) {
      console.error('Error loading subscription state:', error);
    }
  };

  const setPremiumStatus = async (status: boolean) => {
    try {
      // In a real app, this would be set after verifying purchase with app store
      const expiryDate = status ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days from now
      
      const newState: SubscriptionState = {
        isPremium: status,
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
      };
      
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newState));
      setSubscriptionState(newState);
    } catch (error) {
      console.error('Error saving subscription state:', error);
    }
  };

  const checkPremiumFeatures = () => {
    return subscriptionState.isPremium;
  };

  const showPremiumModal = () => {
    // This would be implemented in the component that uses this context
    // We'll just return the status for now
    return subscriptionState.isPremium;
  };

  return React.createElement(
    SubscriptionContext.Provider,
    {
      value: {
        isPremium: subscriptionState.isPremium,
        setPremiumStatus,
        checkPremiumFeatures,
        showPremiumModal
      }
    },
    children
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}