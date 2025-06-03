import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ThemedText } from './ThemedText';

const DEFAULT_IMAGE = 'https://via.placeholder.com/150';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(product)}
    >
      <Image
        source={{ uri: product.images?.[0] || DEFAULT_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <ThemedText style={styles.name}>{product.name}</ThemedText>
        <ThemedText style={styles.price}>${product.price.toFixed(2)}</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 