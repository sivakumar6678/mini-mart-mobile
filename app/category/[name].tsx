import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for products (same as in home screen)
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Fresh Organic Apples',
    description: 'Delicious organic apples from local farms',
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
    description: 'Freshly baked whole wheat bread',
    price: 45,
    quantity: 50,
    category: 'Bakery',
    images: ['https://images.unsplash.com/photo-1598373182133-52452f7691ef'],
    shopId: 2,
  },
  {
    id: 3,
    name: 'Organic Milk 1L',
    description: 'Farm fresh organic milk',
    price: 60,
    quantity: 30,
    category: 'Dairy',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b'],
    shopId: 1,
  },
  {
    id: 4,
    name: 'Fresh Tomatoes',
    description: 'Ripe and juicy tomatoes',
    price: 40,
    discountedPrice: 30,
    quantity: 80,
    category: 'Vegetables',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    shopId: 3,
  },
  {
    id: 5,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas',
    price: 80,
    discountedPrice: 65,
    quantity: 150,
    category: 'Fruits',
    images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224'],
    shopId: 1,
  },
  {
    id: 6,
    name: 'Fresh Carrots',
    description: 'Organic carrots freshly harvested',
    price: 35,
    quantity: 80,
    category: 'Vegetables',
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'],
    shopId: 1,
  },
  {
    id: 7,
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt',
    price: 75,
    quantity: 40,
    category: 'Dairy',
    images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777'],
    shopId: 2,
  },
  {
    id: 8,
    name: 'Chocolate Cookies',
    description: 'Freshly baked chocolate cookies',
    price: 60,
    discountedPrice: 50,
    quantity: 60,
    category: 'Bakery',
    images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e'],
    shopId: 2,
  },
];

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const { selectedCity } = useCity();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          // Filter products by category and city
          const categoryProducts = PRODUCTS.filter(
            product => product.category === name
          );
          setProducts(categoryProducts);
          setFilteredProducts(categoryProducts);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    if (name) {
      loadProducts();
    }
  }, [name, selectedCity]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const getCategoryIcon = () => {
    switch (name) {
      case 'Fruits':
        return '🍎';
      case 'Vegetables':
        return '🥦';
      case 'Dairy':
        return '🥛';
      case 'Bakery':
        return '🍞';
      case 'Snacks':
        return '🍿';
      case 'Beverages':
        return '🥤';
      default:
        return '🛒';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: name as string }} />
      
      <View style={styles.header}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
          <ThemedText type="title">{name}</ThemedText>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search in ${name}...`}
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={60} color={colors.tabIconDefault} />
          <ThemedText style={styles.emptyText}>
            No products found in {name}
          </ThemedText>
          {searchQuery ? (
            <ThemedText style={styles.emptySubtext}>
              Try a different search term
            </ThemedText>
          ) : (
            <ThemedText style={styles.emptySubtext}>
              Check back later for new products
            </ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  productsList: {
    paddingBottom: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});