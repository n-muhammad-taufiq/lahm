import '../global.css';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  '@firebase/auth',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Parisienne: require('../../assets/fonts/Parisienne-Regular.ttf'),
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Fail-safe: never keep the app on a blank screen for more than 600ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}


