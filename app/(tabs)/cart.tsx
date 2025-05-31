import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading your cart...</ThemedText>
      </ThemedView>
    );
  }

  if (cart.items.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.emptyText}>Your cart is empty</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Looks like you haven't added any products to your cart yet.
        </ThemedText>
        <Button
          title="Start Shopping"
          onPress={handleContinueShopping}
          style={styles.shopButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => (
          <ThemedView style={styles.cartItem}>
            <Image
              source={{ uri: item.product.images[0] }}
              style={styles.productImage}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <ThemedText style={styles.productName}>{item.product.name}</ThemedText>
              <ThemedText style={styles.productPrice}>
                {formatCurrency(item.product.discountedPrice || item.product.price)}
              </ThemedText>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={item.quantity <= 1 ? colors.disabledText : colors.text}
                  />
                </TouchableOpacity>
                <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.product.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </ThemedView>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <ThemedText type="subtitle">Order Summary</ThemedText>
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>{formatCurrency(cart.total)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Delivery Fee</ThemedText>
                <ThemedText>{formatCurrency(40)}</ThemedText>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText type="defaultSemiBold">Total</ThemedText>
                <ThemedText type="defaultSemiBold">{formatCurrency(cart.total + 40)}</ThemedText>
              </View>
            </View>
            
            <View style={styles.actionsContainer}>
              <Button
                title="Clear Cart"
                onPress={clearCart}
                variant="outline"
                style={styles.clearButton}
              />
              <Button
                title="Checkout"
                onPress={handleCheckout}
                style={styles.checkoutButton}
              />
            </View>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  shopButton: {
    marginTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  footer: {
    marginTop: 16,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  clearButton: {
    flex: 1,
    marginRight: 8,
  },
  checkoutButton: {
    flex: 1,
    marginLeft: 8,
  },
});