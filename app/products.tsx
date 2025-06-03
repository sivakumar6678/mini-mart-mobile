import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ProductService, { Product, ProductFilter } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
  { label: 'Newest First', value: 'newest' },
];

export default function ProductsScreen() {
  const params = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(params.search as string || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadProducts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const filters: ProductFilter = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      
      if (priceRange.min) {
        filters.minPrice = parseFloat(priceRange.min);
      }
      
      if (priceRange.max) {
        filters.maxPrice = parseFloat(priceRange.max);
      }

      try {
        const allProducts = await ProductService.getAllProducts(filters);
        setProducts(allProducts);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data as fallback
        let filteredMockProducts = [...PRODUCTS];
        
        // Apply filters to mock data
        if (filters.search) {
          filteredMockProducts = filteredMockProducts.filter(product =>
            product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            product.description.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        
        if (filters.category) {
          filteredMockProducts = filteredMockProducts.filter(product =>
            product.category === filters.category
          );
        }
        
        if (filters.minPrice) {
          filteredMockProducts = filteredMockProducts.filter(product =>
            (product.discountedPrice || product.price) >= filters.minPrice!
          );
        }
        
        if (filters.maxPrice) {
          filteredMockProducts = filteredMockProducts.filter(product =>
            (product.discountedPrice || product.price) <= filters.maxPrice!
          );
        }
        
        setProducts(filteredMockProducts);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      // Use mock data as final fallback
      setProducts(PRODUCTS);
      
      if (showRefreshing) {
        // Don't show alert on refresh, just use mock data
        console.log('Using offline data');
      } else {
        Alert.alert(
          'Offline Mode',
          'Using offline data. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    // Apply sorting to products
    let sorted = [...products];
    
    switch (selectedSort) {
      case 'price_asc':
        sorted.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    setFilteredProducts(sorted);
  }, [products, selectedSort]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadProducts(true);
  }, [loadProducts]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadProducts();
    }
  };

  const handleCategorySelect = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handleSortSelect = (sortValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortValue);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSort('relevance');
    setPriceRange({ min: '', max: '' });
    setShowFilters(false);
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadProducts();
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productWrapper, index % 2 === 1 && styles.productWrapperRight]}>
      <ProductCard product={item} />
    </View>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && { backgroundColor: colors.tint },
        { borderColor: colors.border }
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <ThemedText
        style={[
          styles.categoryText,
          selectedCategory === item && { color: '#FFFFFF' }
        ]}
      >
        {item}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderSortItem = ({ item }: { item: typeof SORT_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.sortItem,
        selectedSort === item.value && { backgroundColor: colors.tint + '20' }
      ]}
      onPress={() => handleSortSelect(item.value)}
    >
      <ThemedText
        style={[
          styles.sortText,
          selectedSort === item.value && { color: colors.tint, fontWeight: '600' }
        ]}
      >
        {item.label}
      </ThemedText>
      {selectedSort === item.value && (
        <Ionicons name="checkmark" size={20} color={colors.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Products',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons 
                name={showFilters ? "close" : "options-outline"} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          )
        }} 
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="search" size={20} color={colors.tabIconDefault} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search products..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.cardBackground }]}>
          {/* Categories */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterTitle}>Categories</ThemedText>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterTitle}>Price Range</ThemedText>
            <View style={styles.priceRangeContainer}>
              <TextInput
                style={[styles.priceInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Min"
                placeholderTextColor={colors.tabIconDefault}
                value={priceRange.min}
                onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
                keyboardType="numeric"
              />
              <ThemedText style={styles.priceSeparator}>to</ThemedText>
              <TextInput
                style={[styles.priceInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Max"
                placeholderTextColor={colors.tabIconDefault}
                value={priceRange.max}
                onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterTitle}>Sort By</ThemedText>
            <FlatList
              data={SORT_OPTIONS}
              renderItem={renderSortItem}
              keyExtractor={(item) => item.value}
              scrollEnabled={false}
            />
          </View>

          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.filterActionButton, { backgroundColor: colors.border }]}
              onPress={clearFilters}
            >
              <ThemedText style={styles.filterActionText}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterActionButton, { backgroundColor: colors.tint }]}
              onPress={applyFilters}
            >
              <ThemedText style={[styles.filterActionText, { color: '#FFFFFF' }]}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <ThemedText style={styles.resultsText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </ThemedText>
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.tint]}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color={colors.tabIconDefault} />
              <ThemedText style={styles.emptyText}>No products found</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Try adjusting your search or filters
              </ThemedText>
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: colors.tint }]}
                onPress={clearFilters}
              >
                <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 12,
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
  filtersPanel: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesList: {
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sortText: {
    fontSize: 16,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filterActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  filterActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  productsList: {
    padding: 16,
  },
  productWrapper: {
    flex: 1,
    marginBottom: 16,
  },
  productWrapperRight: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});