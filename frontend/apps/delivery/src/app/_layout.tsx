/**
 * Delivery App Root Layout
 * 
 * Root navigation container for the delivery partner app. Handles splash screen,
 * custom font loading, and stack navigation.
 */

import '../global.css';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';
import { useAuthStore, queryClient, QueryClientProvider } from '@lahm/api';

LogBox.ignoreLogs([
  '@firebase/auth',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Parisienne: require('../../assets/fonts/Parisienne-Regular.ttf'),
  });
  const [isReady, setIsReady] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isAuthLoading) {
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, isAuthLoading]);

  // Fail-safe: prevent app from hanging indefinitely if network stalls
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
