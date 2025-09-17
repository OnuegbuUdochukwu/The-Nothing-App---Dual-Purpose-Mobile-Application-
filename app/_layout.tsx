import * as React from 'react';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();

  return React.createElement(
    GestureHandlerRootView,
    { style: { flex: 1 } },
    React.createElement(
      SubscriptionProvider,
      null,
      React.createElement(
        Stack,
        { screenOptions: { headerShown: false } },
        React.createElement(Stack.Screen, { name: "+not-found" })
      ),
      React.createElement(StatusBar, { style: "auto" })
    )
  );
}
