import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for products (same as in category screen)
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

// Categories for filter
const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
];

export default function ProductsScreen() {
  const { selectedCity } = useCity();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          // In a real app, we would filter by city here
          setProducts(PRODUCTS);
          setFilteredProducts(PRODUCTS);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedCity]);

  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case 'price_asc':
          result.sort((a, b) => {
            const priceA = a.discountedPrice || a.price;
            const priceB = b.discountedPrice || b.price;
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          result.sort((a, b) => {
            const priceA = a.discountedPrice || a.price;
            const priceB = b.discountedPrice || b.price;
            return priceB - priceA;
          });
          break;
        case 'name_asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, sortOption]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortSelect = (option: string) => {
    setSortOption(option);
    setShowSortOptions(false);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'All Products' }} />
      
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
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
        
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && { 
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  }
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <ThemedText
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && { color: '#FFFFFF' }
                  ]}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, { borderColor: colors.border }]}
              onPress={() => setShowSortOptions(!showSortOptions)}
            >
              <Ionicons name="filter-outline" size={18} color={colors.text} />
              <ThemedText style={styles.sortButtonText}>Sort</ThemedText>
            </TouchableOpacity>
            
            {showSortOptions && (
              <View style={[styles.sortOptions, { backgroundColor: colors.cardBackground }]}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortOption === option.value && { backgroundColor: colors.tint + '20' }
                    ]}
                    onPress={() => handleSortSelect(option.value)}
                  >
                    <ThemedText>{option.label}</ThemedText>
                    {sortOption === option.value && (
                      <Ionicons name="checkmark" size={18} color={colors.tint} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
            No products found
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Try different search terms or filters
          </ThemedText>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
  },
  sortContainer: {
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortButtonText: {
    marginLeft: 4,
    fontSize: 14,
  },
  sortOptions: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 200,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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