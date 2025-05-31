import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock data for products (same as in home screen)
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Fresh Organic Apples',
    description: 'Delicious organic apples from local farms. These apples are grown without pesticides and are harvested at peak ripeness to ensure the best flavor and nutritional value.',
    price: 120,
    discountedPrice: 99,
    quantity: 100,
    category: 'Fruits',
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'],
    shopId: 1,
  },
  {
    id: 2,
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread made with 100% whole grain flour. Our bread is baked daily and contains no preservatives or artificial ingredients.',
    price: 45,
    quantity: 50,
    category: 'Bakery',
    images: ['https://images.unsplash.com/photo-1598373182133-52452f7691ef'],
    shopId: 2,
  },
  {
    id: 3,
    name: 'Organic Milk 1L',
    description: 'Farm fresh organic milk from grass-fed cows. Our milk is pasteurized at low temperatures to preserve nutrients and flavor.',
    price: 60,
    quantity: 30,
    category: 'Dairy',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b'],
    shopId: 1,
  },
  {
    id: 4,
    name: 'Fresh Tomatoes',
    description: 'Ripe and juicy tomatoes picked at the peak of freshness. Perfect for salads, sandwiches, or cooking.',
    price: 40,
    discountedPrice: 30,
    quantity: 80,
    category: 'Vegetables',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    shopId: 3,
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const foundProduct = PRODUCTS.find(p => p.id === Number(id));
          setProduct(foundProduct || null);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading product:', error);
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product, quantity);
        router.push('/cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Product Details' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <Stack.Screen options={{ title: 'Product Not Found' }} />
        <Ionicons name="alert-circle-outline" size={60} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.notFoundText}>
          Product not found
        </ThemedText>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </ThemedView>
    );
  }

  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;
  const currentPrice = hasDiscount ? product.discountedPrice! : product.price;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          contentFit="cover"
        />
        
        {hasDiscount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.discountText}>
              {Math.round((1 - product.discountedPrice! / product.price) * 100)}% OFF
            </ThemedText>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <ThemedText type="title">{product.name}</ThemedText>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{product.category}</ThemedText>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <ThemedText style={styles.originalPrice}>
                {formatCurrency(product.price)}
              </ThemedText>
            )}
            <ThemedText style={styles.price}>
              {formatCurrency(currentPrice)}
            </ThemedText>
          </View>
          
          <View style={styles.quantityContainer}>
            <ThemedText style={styles.quantityLabel}>Quantity:</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { borderColor: colors.border },
                  quantity <= 1 && styles.disabledButton
                ]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? colors.disabledText : colors.text}
                />
              </TouchableOpacity>
              <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { borderColor: colors.border },
                  quantity >= product.quantity && styles.disabledButton
                ]}
                onPress={incrementQuantity}
                disabled={quantity >= product.quantity}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= product.quantity ? colors.disabledText : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <ThemedText style={styles.stockInfo}>
            {product.quantity > 0
              ? `In Stock: ${product.quantity} available`
              : 'Out of Stock'}
          </ThemedText>
          
          <View style={styles.divider} />
          
          <ThemedText type="subtitle">Description</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>
          
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            disabled={product.quantity === 0}
            fullWidth
            style={styles.addButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    minWidth: 120,
  },
  productImage: {
    width: width,
    height: width,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginRight: 8,
    opacity: 0.7,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityLabel: {
    marginRight: 16,
    fontSize: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityValue: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  stockInfo: {
    marginBottom: 16,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  description: {
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
  },
});