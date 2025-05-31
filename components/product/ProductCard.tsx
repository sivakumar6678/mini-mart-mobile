import { Colors } from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  horizontal?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with padding

export const ProductCard: React.FC<ProductCardProps> = ({ product, horizontal = false }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart } = useCart();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : { width: cardWidth },
        { backgroundColor: colors.background }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={horizontal ? styles.horizontalImage : styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.contentContainer}>
        <Text style={[styles.category, { color: colors.tabIconDefault }]}>
          {product.category}
        </Text>
        <Text 
          style={[styles.name, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <View style={styles.priceContainer}>
          {hasDiscount && (
            <Text style={[styles.originalPrice, { color: colors.tabIconDefault }]}>
              {formatCurrency(product.price)}
            </Text>
          )}
          <Text style={[styles.price, { color: colors.text }]}>
            {formatCurrency(hasDiscount ? product.discountedPrice! : product.price)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={handleAddToCart}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: 150,
  },
  horizontalImage: {
    width: 120,
    height: '100%',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
  },
  category: {
    fontSize: 12,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});