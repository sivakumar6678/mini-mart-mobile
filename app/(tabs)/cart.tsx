import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CartScreen() {
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState<number | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const deliveryFee = cart.total > 500 ? 0 : 40;
  const totalWithDelivery = cart.total + deliveryFee - couponDiscount;

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/');
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsUpdatingQuantity(productId);
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = (productId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: async () => {
            setRemovingItemId(productId);
            try {
              await removeItem(productId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error removing item:', error);
            } finally {
              setRemovingItemId(null);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleClearCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: () => {
            clearCart();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleApplyCoupon = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate coupon application
    if (!appliedCoupon) {
      setAppliedCoupon('WELCOME20');
      setCouponDiscount(Math.round(cart.total * 0.2)); // 20% discount
      
      // Animate the discount amount
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        })
      ]).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveCoupon = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppliedCoupon(null);
    setCouponDiscount(0);
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
        <View style={styles.emptyCartIconContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.tabIconDefault} />
          <View style={[styles.emptyCartBadge, { backgroundColor: colors.tint }]}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </View>
        </View>
        
        <ThemedText type="subtitle" style={styles.emptyText}>Your cart is empty</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Looks like you haven't added any products to your cart yet.
        </ThemedText>
        
        <View style={styles.recommendationsContainer}>
          <ThemedText style={styles.recommendationsTitle}>Popular Products</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsList}
          >
            {[1, 2, 3].map((i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.recommendationItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/product/${i}`);
                }}
              >
                <Image
                  source={{ uri: `https://images.unsplash.com/photo-${1560806887 + i * 1000}-1e4cd0b6cbd6` }}
                  style={styles.recommendationImage}
                  contentFit="cover"
                />
                <View style={styles.recommendationInfo}>
                  <ThemedText style={styles.recommendationName}>Popular Product {i}</ThemedText>
                  <ThemedText style={styles.recommendationPrice}>{formatCurrency(99 + i * 20)}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <Button
          title="Browse Products"
          onPress={handleContinueShopping}
          style={styles.shopButton}
          icon="bag-outline"
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          My Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
        </ThemedText>
      </View>
      
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => {
          const isRemoving = removingItemId === item.product.id;
          const isUpdating = isUpdatingQuantity === item.product.id;
          const itemPrice = item.product.discountedPrice || item.product.price;
          const itemTotal = itemPrice * item.quantity;
          
          return (
            <ThemedView style={[styles.cartItem, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/product/${item.product.id}`);
                }}
              >
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
              
              <View style={styles.productInfo}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/product/${item.product.id}`);
                  }}
                >
                  <ThemedText style={styles.productName}>{item.product.name}</ThemedText>
                </TouchableOpacity>
                
                <View style={styles.priceRow}>
                  <ThemedText style={styles.productPrice}>
                    {formatCurrency(itemPrice)}
                  </ThemedText>
                  
                  {item.quantity > 1 && (
                    <ThemedText style={styles.itemTotal}>
                      {formatCurrency(itemTotal)}
                    </ThemedText>
                  )}
                </View>
                
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton, 
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.border 
                      },
                      item.quantity <= 1 && styles.disabledButton
                    ]}
                    onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                  >
                    <Ionicons
                      name="remove"
                      size={16}
                      color={item.quantity <= 1 ? colors.disabledText : colors.text}
                    />
                  </TouchableOpacity>
                  
                  <View style={[styles.quantityValueContainer, { backgroundColor: colors.background }]}>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                      <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.quantityButton, 
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.border 
                      },
                      isUpdating && styles.disabledButton
                    ]}
                    onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={isUpdating}
                  >
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.product.id)}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                )}
              </TouchableOpacity>
            </ThemedView>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* Coupon Section */}
            <View style={[styles.couponContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.couponHeader}>
                <Ionicons name="ticket-outline" size={20} color={colors.tint} />
                <ThemedText style={styles.couponTitle}>Apply Coupon</ThemedText>
              </View>
              
              {appliedCoupon ? (
                <View style={styles.appliedCouponContainer}>
                  <View style={[styles.couponBadge, { backgroundColor: colors.tint + '20' }]}>
                    <ThemedText style={[styles.couponCode, { color: colors.tint }]}>
                      {appliedCoupon}
                    </ThemedText>
                    <ThemedText style={[styles.couponDiscount, { color: colors.tint }]}>
                      -20%
                    </ThemedText>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.removeCouponButton}
                    onPress={handleRemoveCoupon}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.applyCouponButton, { borderColor: colors.border }]}
                  onPress={handleApplyCoupon}
                >
                  <ThemedText style={{ color: colors.tint }}>Apply Coupon</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={colors.tint} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Order Summary */}
            <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
              <ThemedText type="subtitle" style={styles.summaryTitle}>Order Summary</ThemedText>
              
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>{formatCurrency(cart.total)}</ThemedText>
              </View>
              
              <View style={styles.summaryRow}>
                <ThemedText>Delivery Fee</ThemedText>
                {deliveryFee === 0 ? (
                  <ThemedText style={{ color: colors.tint }}>FREE</ThemedText>
                ) : (
                  <ThemedText>{formatCurrency(deliveryFee)}</ThemedText>
                )}
              </View>
              
              {appliedCoupon && (
                <View style={styles.summaryRow}>
                  <View style={styles.discountLabelContainer}>
                    <ThemedText>Discount</ThemedText>
                    <View style={[styles.discountBadge, { backgroundColor: colors.tint + '20' }]}>
                      <ThemedText style={[styles.discountBadgeText, { color: colors.tint }]}>
                        {appliedCoupon}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ color: colors.tint }}>
                    -{formatCurrency(couponDiscount)}
                  </ThemedText>
                </View>
              )}
              
              <Animated.View 
                style={[
                  styles.savingsBanner,
                  { 
                    backgroundColor: colors.tint + '20',
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }
                    ],
                    opacity: slideAnim
                  }
                ]}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
                <Text style={[styles.savingsText, { color: colors.tint }]}>
                  You saved {formatCurrency(couponDiscount)} with this order!
                </Text>
              </Animated.View>
              
              <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <ThemedText type="defaultSemiBold">Total</ThemedText>
                <ThemedText type="subtitle" style={styles.totalAmount}>
                  {formatCurrency(totalWithDelivery)}
                </ThemedText>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Button
                title="Clear Cart"
                onPress={handleClearCart}
                variant="outline"
                style={styles.clearButton}
                icon="trash-outline"
              />
              <Button
                title="Checkout"
                onPress={handleCheckout}
                style={styles.checkoutButton}
                icon="wallet-outline"
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
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  emptyCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
    maxWidth: '80%',
  },
  recommendationsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationsList: {
    paddingVertical: 8,
  },
  recommendationItem: {
    width: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationImage: {
    width: '100%',
    height: 100,
  },
  recommendationInfo: {
    padding: 12,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  shopButton: {
    minWidth: 200,
    height: 50,
    borderRadius: 12,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  itemTotal: {
    fontSize: 14,
    opacity: 0.7,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValueContainer: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 8,
  },
  couponContainer: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  applyCouponButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  couponCode: {
    fontWeight: '600',
  },
  couponDiscount: {
    fontWeight: '700',
  },
  removeCouponButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  discountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  savingsText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  clearButton: {
    flex: 1,
    marginRight: 8,
    height: 50,
    borderRadius: 12,
  },
  checkoutButton: {
    flex: 1,
    marginLeft: 8,
    height: 50,
    borderRadius: 12,
  },
});