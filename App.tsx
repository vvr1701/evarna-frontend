// App.tsx (root) — loads the Manrope + Outfit font faces used by the Txt
// component, then renders the navigation router inside a SafeAreaProvider.

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts as useManrope,
  Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { registerGlobals } from '@livekit/react-native';
import Router from './src/navigation/App';
import { W } from './src/theme/theme';

// Install LiveKit's WebRTC globals once, before any Room is created. This is a
// no-op JS shim in Expo Go (where the native module is absent) and only does
// real work inside a development/production build that includes the module.
registerGlobals();

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useManrope({
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold,
    Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: W.bg }} onLayout={onLayout}>
        <StatusBar style="light" />
        <Router />
      </View>
    </SafeAreaProvider>
  );
}
