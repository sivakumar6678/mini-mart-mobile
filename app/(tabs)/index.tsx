import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock data for featured products
const FEATURED_PRODUCTS: Product[] = [
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
];

// Mock data for categories
const CATEGORIES = [
  { id: 1, name: 'Fruits', icon: '🍎' },
  { id: 2, name: 'Vegetables', icon: '🥦' },
  { id: 3, name: 'Dairy', icon: '🥛' },
  { id: 4, name: 'Bakery', icon: '🍞' },
  { id: 5, name: 'Snacks', icon: '🍿' },
  { id: 6, name: 'Beverages', icon: '🥤' },
];

export default function HomeScreen() {
  const { selectedCity } = useCity();
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(FEATURED_PRODUCTS);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // In a real app, we would fetch products from the API based on the selected city
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setFeaturedProducts(FEATURED_PRODUCTS);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedCity]);

  const navigateToCategory = (category: string) => {
    router.push(`/category/${category}`);
  };

  const navigateToAllProducts = () => {
    router.push('/products');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        {/* Welcome section */}
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title">Welcome to Mini Mart</ThemedText>
          <ThemedText>Find everything you need in {selectedCity}</ThemedText>
        </ThemedView>

        {/* Categories */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Categories</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => navigateToCategory(category.name)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <ThemedText>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Featured Products */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Featured Products</ThemedText>
            <TouchableOpacity onPress={navigateToAllProducts}>
              <ThemedText style={{ color: colors.tint }}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
            />
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  loader: {
    marginVertical: 20,
  },
});
