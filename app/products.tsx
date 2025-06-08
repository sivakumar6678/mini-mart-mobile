import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ProductService, { Product, ProductFilter } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Professional Constants with proper typing
const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Meat & Seafood',
  'Frozen Foods',
  'Personal Care',
] as const;

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' as const },
  { label: 'Price: Low to High', value: 'price_asc' as const },
  { label: 'Price: High to Low', value: 'price_desc' as const },
  { label: 'Name: A to Z', value: 'name_asc' as const },
  { label: 'Name: Z to A', value: 'name_desc' as const },
  { label: 'Newest First', value: 'newest' as const },
  { label: 'Rating: High to Low', value: 'rating_desc' as const },
] as const;

const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 - ₹100', min: 50, max: 100 },
  { label: '₹100 - ₹200', min: 100, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 500, max: undefined },
] as const;

// Performance constants
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;
const SEARCH_DEBOUNCE_MS = 300;
const LOAD_MORE_THRESHOLD = 0.1;

// Professional Type Definitions
type SortValue = typeof SORT_OPTIONS[number]['value'];
type CategoryValue = typeof CATEGORIES[number];

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

interface FiltersState {
  searchQuery: string;
  selectedCategory: CategoryValue;
  selectedSort: SortValue;
  priceRange: { min?: number; max?: number };
  showFilters: boolean;
  inStockOnly: boolean;
}

/**
 * Professional Products Screen Component
 * Features: Advanced filtering, search, pagination, error handling, accessibility
 */
function ProductsScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Performance-optimized refs
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);
  const filterAnimationRef = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);
  
  // Centralized state management
  const [productsState, setProductsState] = useState<ProductsState>({
    products: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    hasMore: false,
    page: 1,
  });

  const [filtersState, setFiltersState] = useState<FiltersState>({
    searchQuery: (params.search as string) || '',
    selectedCategory: (params.category as CategoryValue) || 'All',
    selectedSort: 'relevance',
    priceRange: { min: undefined, max: undefined },
    showFilters: false,
    inStockOnly: false,
  });

  // Memoized filter function for performance
  const applyFilters = useCallback((products: Product[], filters: FiltersState): Product[] => {
    let filtered = [...products];

    // Search filter with fuzzy matching
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.category === filters.selectedCategory
      );
    }

    // Price range filter
    if (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined) {
      filtered = filtered.filter(product => {
        const price = product.discountedPrice || product.price;
        const minCheck = filters.priceRange.min === undefined || price >= filters.priceRange.min;
        const maxCheck = filters.priceRange.max === undefined || price <= filters.priceRange.max;
        return minCheck && maxCheck;
      });
    }

    // Stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.stockStatus !== 'out_of_stock');
    }

    // Advanced sorting with multiple criteria
    filtered.sort((a, b) => {
      switch (filters.selectedSort) {
        case 'price_asc':
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case 'price_desc':
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating_desc':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          // Relevance: prioritize in-stock, then rating, then name
          if (a.stockStatus !== b.stockStatus) {
            if (a.stockStatus === 'in_stock') return -1;
            if (b.stockStatus === 'in_stock') return 1;
          }
          return b.rating - a.rating || a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, []);

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => 
    applyFilters(productsState.products, filtersState),
    [productsState.products, filtersState, applyFilters]
  );

  // Professional load products function with retry logic
  const loadProducts = useCallback(async (refresh = false) => {
    if (!isMountedRef.current) return;

    try {
      if (refresh) {
        setProductsState(prev => ({ ...prev, isRefreshing: true, error: null }));
      } else {
        setProductsState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      const filters: ProductFilter = {
        limit: 20,
        offset: refresh ? 0 : (productsState.page - 1) * 20,
      };

      // Add city filter if available
      if (params.city) {
        filters.city = params.city as string;
      }

      const result = await ProductService.getAllProducts(filters);
      
      if (!isMountedRef.current) return;

      setProductsState(prev => ({
        ...prev,
        products: refresh ? result.products : [...prev.products, ...result.products],
        isLoading: false,
        isRefreshing: false,
        hasMore: result.hasMore,
        page: refresh ? 2 : prev.page + 1,
        error: null,
      }));

    } catch (error: any) {
      if (!isMountedRef.current) return;

      console.error('Error loading products:', error);
      setProductsState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error.message || 'Failed to load products',
      }));

      if (!refresh) {
        Alert.alert(
          'Connection Error',
          'Unable to load products. Please check your internet connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => loadProducts(true) }
          ]
        );
      }
    }
  }, [params.city, productsState.page]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, searchQuery: query }));
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Filter handlers with haptic feedback
  const handleCategorySelect = useCallback((category: CategoryValue) => {
    setFiltersState(prev => ({ ...prev, selectedCategory: category }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSortSelect = useCallback((sort: SortValue) => {
    setFiltersState(prev => ({ ...prev, selectedSort: sort }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePriceRangeSelect = useCallback((range: { min?: number; max?: number }) => {
    setFiltersState(prev => ({ ...prev, priceRange: range }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleFilters = useCallback(() => {
    const toValue = filtersState.showFilters ? 0 : 1;
    setFiltersState(prev => ({ ...prev, showFilters: !prev.showFilters }));
    
    Animated.spring(filterAnimationRef, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [filtersState.showFilters, filterAnimationRef]);

  const clearFilters = useCallback(() => {
    setFiltersState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: 'All',
      selectedSort: 'relevance',
      priceRange: { min: undefined, max: undefined },
      inStockOnly: false,
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleRefresh = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (!productsState.isLoading && productsState.hasMore) {
      loadProducts(false);
    }
  }, [productsState.isLoading, productsState.hasMore, loadProducts]);

  // Effects
  useEffect(() => {
    loadProducts(true);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Optimized render functions
  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productItem, { width: ITEM_WIDTH }]}>
      <ProductCard 
        product={item} 
        testID={`product-card-${item.id}`}
        accessibilityLabel={`Product: ${item.name}, Price: ₹${item.discountedPrice || item.price}`}
      />
    </View>
  ), []);

  const renderCategoryItem = useCallback(({ item }: { item: CategoryValue }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        filtersState.selectedCategory === item && { 
          backgroundColor: colors.tint,
          borderColor: colors.tint,
        }
      ]}
      onPress={() => handleCategorySelect(item)}
      accessibilityRole="button"
      accessibilityState={{ selected: filtersState.selectedCategory === item }}
    >
      <ThemedText
        style={[
          styles.categoryText,
          filtersState.selectedCategory === item && { color: '#FFFFFF', fontWeight: '600' }
        ]}
      >
        {item}
      </ThemedText>
    </TouchableOpacity>
  ), [filtersState.selectedCategory, colors.tint, handleCategorySelect]);

  const renderSortItem = useCallback(({ item }: { item: typeof SORT_OPTIONS[number] }) => (
    <TouchableOpacity
      style={[
        styles.sortItem,
        filtersState.selectedSort === item.value && { backgroundColor: colors.tint + '20' }
      ]}
      onPress={() => handleSortSelect(item.value)}
      accessibilityRole="button"
      accessibilityState={{ selected: filtersState.selectedSort === item.value }}
    >
      <ThemedText
        style={[
          styles.sortText,
          filtersState.selectedSort === item.value && { color: colors.tint, fontWeight: '600' }
        ]}
      >
        {item.label}
      </ThemedText>
      {filtersState.selectedSort === item.value && (
        <Ionicons name="checkmark" size={20} color={colors.tint} />
      )}
    </TouchableOpacity>
  ), [filtersState.selectedSort, colors.tint, handleSortSelect]);

  const renderPriceRangeItem = useCallback(({ item }: { item: typeof PRICE_RANGES[number] }) => {
    const isSelected = filtersState.priceRange.min === item.min && filtersState.priceRange.max === item.max;
    
    return (
      <TouchableOpacity
        style={[
          styles.priceRangeItem,
          isSelected && { backgroundColor: colors.tint + '20' }
        ]}
        onPress={() => handlePriceRangeSelect({ min: item.min, max: item.max })}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <ThemedText
          style={[
            styles.priceRangeText,
            isSelected && { color: colors.tint, fontWeight: '600' }
          ]}
        >
          {item.label}
        </ThemedText>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  }, [filtersState.priceRange, colors.tint, handlePriceRangeSelect]);

  const renderEmptyState = useCallback(() => (
    <EmptyState
      icon={productsState.error ? "alert-circle-outline" : "search-outline"}
      title={productsState.error ? 'Something went wrong' : 'No products found'}
      description={
        productsState.error 
          ? productsState.error
          : filtersState.searchQuery 
            ? `No products match "${filtersState.searchQuery}"`
            : 'No products available at the moment'
      }
      actionText={productsState.error ? 'Try Again' : 'Clear Filters'}
      onAction={() => productsState.error ? loadProducts(true) : clearFilters()}
      fullScreen={false}
    />
  ), [productsState.error, filtersState.searchQuery, loadProducts, clearFilters]);

  const renderListFooter = useCallback(() => {
    if (!productsState.hasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={colors.tint} />
        <ThemedText style={[styles.loadMoreText, { color: colors.tabIconDefault }]}>
          Loading more products...
        </ThemedText>
      </View>
    );
  }, [productsState.hasMore, colors]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: params.city ? `Products in ${params.city}` : 'Products',
          headerShown: true,
        }} 
      />

      {/* Enhanced Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.searchInputContainer, { borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.tabIconDefault}
            value={filtersState.searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            accessibilityLabel="Search products"
            accessibilityHint="Enter product name or category to search"
          />
          {filtersState.searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.tint }]}
          onPress={toggleFilters}
          accessibilityRole="button"
          accessibilityLabel="Toggle filters"
          accessibilityState={{ expanded: filtersState.showFilters }}
        >
          <Ionicons name="options" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          accessibilityRole="tablist"
        />
      </View>

      {/* Animated Filters Panel */}
      <Animated.View
        style={[
          styles.filtersPanel,
          {
            backgroundColor: colors.cardBackground,
            maxHeight: filterAnimationRef.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400],
            }),
            opacity: filterAnimationRef,
          }
        ]}
      >
        {filtersState.showFilters && (
          <ScrollView style={styles.filtersContent} showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <ThemedText style={[styles.filterTitle, { color: colors.text }]}>Sort By</ThemedText>
              <FlatList
                data={SORT_OPTIONS}
                renderItem={renderSortItem}
                keyExtractor={(item) => item.value}
                scrollEnabled={false}
              />
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <ThemedText style={[styles.filterTitle, { color: colors.text }]}>Price Range</ThemedText>
              <FlatList
                data={PRICE_RANGES}
                renderItem={renderPriceRangeItem}
                keyExtractor={(item) => item.label}
                scrollEnabled={false}
              />
            </View>

            {/* Stock Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.stockFilterContainer}
                onPress={() => setFiltersState(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: filtersState.inStockOnly }}
              >
                <Ionicons 
                  name={filtersState.inStockOnly ? "checkbox" : "checkbox-outline"} 
                  size={24} 
                  color={colors.tint} 
                />
                <ThemedText style={[styles.stockFilterText, { color: colors.text }]}>
                  In Stock Only
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterActionButton, { backgroundColor: colors.border }]}
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <ThemedText style={[styles.filterActionText, { color: colors.text }]}>Clear</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterActionButton, { backgroundColor: colors.tint }]}
                onPress={toggleFilters}
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <ThemedText style={[styles.filterActionText, { color: '#FFFFFF' }]}>Apply</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <ThemedText style={[styles.resultsText, { color: colors.text }]}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </ThemedText>
      </View>

      {/* Optimized Products List */}
      {productsState.isLoading && !productsState.isRefreshing ? (
        <LoadingSpinner 
          size="large" 
          text="Loading products..." 
          color={colors.tint}
          fullScreen={true}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={productsState.isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.tint]}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          getItemLayout={(data, index) => ({
            length: 280,
            offset: 280 * Math.floor(index / 2),
            index,
          })}
        />
      )}
    </ThemedView>
  );
}

// Professional Styles with proper spacing and accessibility
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minHeight: 44, // Accessibility minimum touch target
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filtersPanel: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 44, // Accessibility
  },
  sortText: {
    fontSize: 16,
    fontWeight: '400',
  },
  priceRangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 44, // Accessibility
  },
  priceRangeText: {
    fontSize: 16,
    fontWeight: '400',
  },
  stockFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44, // Accessibility
  },
  stockFilterText: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  filterActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44, // Accessibility
  },
  filterActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
    gap: 16,
  },
  productItem: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44, // Accessibility
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// Export with Error Boundary for production-ready error handling
export default function ProductsScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProductsScreen />
    </ErrorBoundary>
  );
}