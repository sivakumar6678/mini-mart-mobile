import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CityProvider } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
      <Stack.Screen name="shop/[id]" options={{ title: 'Shop Details' }} />
      <Stack.Screen name="category/[name]" options={{ title: 'Category' }} />
      <Stack.Screen name="order/confirmation" options={{ title: 'Order Confirmation' }} />
      <Stack.Screen name="order/track" options={{ title: 'Track Order' }} />
      <Stack.Screen name="profile/addresses" options={{ title: 'Addresses' }} />
      <Stack.Screen name="profile/orders" options={{ title: 'Order History' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="profile/settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile/change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="support/chat" options={{ title: 'Support Chat' }} />
      <Stack.Screen name="support/faq" options={{ title: 'FAQ' }} />
      <Stack.Screen name="help" options={{ title: 'Help' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <CityProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </CityProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
