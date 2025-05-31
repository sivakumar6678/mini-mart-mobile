import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Trigger success haptic feedback when the screen loads
  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleViewOrder = () => {
    router.push(`/profile/orders/${orderId}`);
  };

  const handleContinueShopping = () => {
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Order Confirmation',
        headerBackVisible: false,
      }} />
      
      <View style={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: colors.tint + '20' }]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.tint} />
        </View>
        
        <ThemedText type="title" style={styles.title}>
          Order Placed Successfully!
        </ThemedText>
        
        <ThemedText style={styles.message}>
          Your order has been placed successfully. We'll process it right away!
        </ThemedText>
        
        <ThemedText style={styles.orderIdText}>
          Order ID: <ThemedText type="defaultSemiBold">{orderId}</ThemedText>
        </ThemedText>
        
        <ThemedText style={styles.infoText}>
          You will receive an email confirmation shortly with the details of your order.
        </ThemedText>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="View Order"
          onPress={handleViewOrder}
          variant="outline"
          style={styles.viewOrderButton}
        />
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          style={styles.continueButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  orderIdText: {
    marginBottom: 16,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  viewOrderButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 12,
  },
});