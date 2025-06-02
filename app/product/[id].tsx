import { Button } from '@/components/common/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb'
    ],
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const foundProduct = PRODUCTS.find(p => p.id === Number(id));
          setProduct(foundProduct || null);
          
          // Find related products (same category)
          if (foundProduct) {
            const related = PRODUCTS.filter(
              p => p.category === foundProduct.category && p.id !== foundProduct.id
            );
            setRelatedProducts(related);
          }
          
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
        setIsAddingToCart(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await addToCart(product, quantity);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Show success animation before navigating
        setTimeout(() => {
          router.push('/cart');
        }, 300);
      } catch (error) {
        console.error('Error adding to cart:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(quantity - 1);
    }
  };

  const handleImageScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    if (product?.images?.length) {
      const listener = scrollX.addListener(({ value }) => {
        const index = Math.round(value / width);
        setCurrentImageIndex(index);
      });
      
      return () => {
        scrollX.removeListener(listener);
      };
    }
  }, [product]);

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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        />
      </ThemedView>
    );
  }

  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;
  const currentPrice = hasDiscount ? product.discountedPrice! : product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.discountedPrice! / product.price) * 100) 
    : 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: product.name,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="heart-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <Animated.FlatList
            data={product.images}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.productImage}
                contentFit="cover"
              />
            )}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          />
          
          {/* Image Pagination Dots */}
          {product.images.length > 1 && (
            <View style={styles.paginationContainer}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { 
                      backgroundColor: index === currentImageIndex 
                        ? colors.tint 
                        : colors.tabIconDefault + '50',
                      width: index === currentImageIndex ? 20 : 8,
                    }
                  ]}
                />
              ))}
            </View>
          )}
          
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.contentContainer, { backgroundColor: colors.cardBackground }]}>
          {/* Shop Info */}
          <View style={styles.shopInfoContainer}>
            <View style={styles.shopInfo}>
              <Ionicons name="storefront-outline" size={16} color={colors.tint} />
              <ThemedText style={styles.shopName}>Organic Farms</ThemedText>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>4.8</Text>
              <Text style={[styles.ratingCount, { color: colors.tabIconDefault }]}>(120)</Text>
            </View>
          </View>
          
          {/* Product Title and Category */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.productTitle}>{product.name}</ThemedText>
            <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={[styles.categoryText, { color: colors.tint }]}>{product.category}</ThemedText>
            </View>
          </View>
          
          {/* Price Section */}
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <ThemedText style={styles.originalPrice}>
                {formatCurrency(product.price)}
              </ThemedText>
            )}
            <ThemedText style={styles.price}>
              {formatCurrency(currentPrice)}
            </ThemedText>
            
            {hasDiscount && (
              <View style={[styles.savingsBadge, { backgroundColor: colors.tint + '20' }]}>
                <ThemedText style={[styles.savingsText, { color: colors.tint }]}>
                  Save {formatCurrency(product.price - product.discountedPrice!)}
                </ThemedText>
              </View>
            )}
          </View>
          
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <ThemedText style={styles.sectionTitle}>Quantity</ThemedText>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border 
                  },
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
              
              <View style={[styles.quantityValueContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border 
                  },
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
              
              <ThemedText style={styles.stockInfo}>
                {product.quantity > 10
                  ? 'In Stock'
                  : product.quantity > 0
                  ? `Only ${product.quantity} left`
                  : 'Out of Stock'}
              </ThemedText>
            </View>
          </View>
          
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>{product.description}</ThemedText>
          </View>
          
          {/* Product Details */}
          <View style={styles.detailsSection}>
            <ThemedText style={styles.sectionTitle}>Product Details</ThemedText>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="leaf-outline" size={20} color={colors.tint} />
                <ThemedText style={styles.detailText}>Organic</ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="nutrition-outline" size={20} color={colors.tint} />
                <ThemedText style={styles.detailText}>Fresh</ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="timer-outline" size={20} color={colors.tint} />
                <ThemedText style={styles.detailText}>Same Day Delivery</ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.tint} />
                <ThemedText style={styles.detailText}>Quality Assured</ThemedText>
              </View>
            </View>
          </View>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedProductsSection}>
              <ThemedText style={styles.sectionTitle}>You May Also Like</ThemedText>
              
              <FlatList
                data={relatedProducts}
                renderItem={({ item }) => (
                  <ProductCard product={item} horizontal />
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedProductsList}
              />
            </View>
          )}
          
          {/* Add to Cart Button */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.wishlistButton, { borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="heart-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Button
              title={isAddingToCart ? "Adding..." : "Add to Cart"}
              onPress={handleAddToCart}
              disabled={product.quantity === 0 || isAddingToCart}
              loading={isAddingToCart}
              fullWidth={false}
              style={styles.addButton}
              icon={isAddingToCart ? undefined : "cart-outline"}
            />
          </View>
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
  favoriteButton: {
    padding: 8,
  },
  imageCarouselContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width * 0.8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  shopInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    marginLeft: 2,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginRight: 8,
    opacity: 0.7,
  },
  savingsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantitySection: {
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValueContainer: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  stockInfo: {
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    lineHeight: 22,
    fontSize: 15,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  relatedProductsSection: {
    marginBottom: 24,
  },
  relatedProductsList: {
    paddingRight: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wishlistButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
  },
});