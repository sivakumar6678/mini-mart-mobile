import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import ProductService, { Product } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Default categories for UI (will be replaced by API data when available)
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Fruits', icon: '🍎', color: '#FFA5A5' },
  { id: 2, name: 'Vegetables', icon: '🥦', color: '#A5D6A7' },
  { id: 3, name: 'Dairy', icon: '🥛', color: '#B3E5FC' },
  { id: 4, name: 'Bakery', icon: '🍞', color: '#FFCC80' },
  { id: 5, name: 'Snacks', icon: '🍿', color: '#E1BEE7' },
  { id: 6, name: 'Beverages', icon: '🥤', color: '#B2DFDB' },
];

// Hero carousel banners matching web design
const HERO_BANNERS = [
  {
    id: 1,
    title: 'Fresh Fruits Daily',
    subtitle: 'Farm-fresh fruits delivered to your doorstep',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
    gradient: ['#10b981', '#059669'] as const, // Green to Emerald
    ctaText: 'Shop Fruits',
    category: 'Fruits'
  },
  {
    id: 2,
    title: 'Organic Vegetables',
    subtitle: 'Locally sourced, pesticide-free vegetables',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6',
    gradient: ['#3b82f6', '#2563eb'] as const, // Blue to Indigo
    ctaText: 'Shop Vegetables',
    category: 'Vegetables'
  },
  {
    id: 3,
    title: 'Dairy Products',
    subtitle: 'Fresh milk, cheese, and dairy essentials',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    gradient: ['#ef4444', '#f97316'] as const, // Red to Orange
    ctaText: 'Shop Dairy',
    category: 'Dairy'
  },
];

// Special offers section
const SPECIAL_OFFERS = [
  {
    id: 1,
    title: 'Fresh Deals',
    description: 'Up to 30% off on selected items',
    badge: 'Limited Time',
    color: '#10b981'
  },
  {
    id: 2,
    title: 'Free Delivery',
    description: 'On orders above ₹500',
    badge: 'Today Only',
    color: '#3b82f6'
  }
];

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 48;

export default function HomeScreen() {
  const { selectedCity } = useCity();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [displayCategories, setDisplayCategories] = useState(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<FlatList>(null);

  // Load all data from API
  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Load all data concurrently
      const [
        featuredData,
        bestSellersData,
        newArrivalsData,
        categoriesData
      ] = await Promise.allSettled([
        ProductService.getFeaturedProducts(),
        ProductService.getBestSellers(),
        ProductService.getNewArrivals(),
        ProductService.getCategories()
      ]);

      // Handle featured products
      if (featuredData.status === 'fulfilled') {
        setFeaturedProducts(featuredData.value);
      } else {
        console.warn('Failed to load featured products:', featuredData.reason);
      }

      // Handle best sellers
      if (bestSellersData.status === 'fulfilled') {
        setBestSellers(bestSellersData.value);
      } else {
        console.warn('Failed to load best sellers:', bestSellersData.reason);
      }

      // Handle new arrivals
      if (newArrivalsData.status === 'fulfilled') {
        setNewArrivals(newArrivalsData.value);
      } else {
        console.warn('Failed to load new arrivals:', newArrivalsData.reason);
      }

      // Handle categories
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
        // Update display categories with API data
        const apiCategories = categoriesData.value.map((cat, index) => {
          const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.name.toLowerCase() === cat.toLowerCase()) || DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length];
          return {
            id: index + 1,
            name: cat,
            icon: defaultCat.icon,
            color: defaultCat.color
          };
        });
        setDisplayCategories(apiCategories);
      } else {
        console.warn('Failed to load categories:', categoriesData.reason);
        // Keep default categories
        setDisplayCategories(DEFAULT_CATEGORIES);
      }

      // If city is selected, filter products by city
      if (selectedCity && selectedCity !== 'All Cities') {
        try {
          const cityProducts = await ProductService.getProductsByCity(selectedCity);
          setFeaturedProducts(cityProducts.slice(0, 8));
        } catch (cityError) {
          console.warn('Failed to load city products:', cityError);
        }
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data. Please check your connection.');
      
      // Show error alert for critical failures
      if (!showRefreshing) {
        Alert.alert(
          'Connection Error',
          'Unable to load products. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: () => loadData() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadData(true);
  }, [loadData]);

  const navigateToCategory = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${category}`);
  };

  const navigateToAllProducts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/products');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/products',
        params: { search: searchQuery }
      });
    }
  };

  const handleBannerScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Auto-rotation for hero banners (5-second intervals)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_BANNERS.length;
        bannerScrollRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / BANNER_WIDTH);
      setCurrentBannerIndex(index);
    });
    
    return () => {
      scrollX.removeListener(listener);
    };
  }, []);

  const renderHeroBanner = ({ item, index }: { item: typeof HERO_BANNERS[0], index: number }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        style={[styles.heroBannerContainer, { width: BANNER_WIDTH }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateToCategory(item.category);
        }}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.heroBannerImage}
          imageStyle={{ borderRadius: 16 }}
        >
          {/* Dark overlay */}
          <View style={styles.heroBannerDarkOverlay} />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={[item.gradient[0] + '99', item.gradient[1] + '99', 'transparent'] as const}
            style={styles.heroBannerGradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Content */}
          <View style={styles.heroBannerContent}>
            <Animated.Text 
              style={[
                styles.heroBannerTitle,
                {
                  opacity: new Animated.Value(0),
                  transform: [{ translateY: new Animated.Value(20) }]
                }
              ]}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.heroBannerSubtitle,
                {
                  opacity: new Animated.Value(0),
                  transform: [{ translateY: new Animated.Value(20) }]
                }
              ]}
            >
              {item.subtitle}
            </Animated.Text>
            <Animated.View 
              style={[
                styles.heroBannerCTA,
                {
                  opacity: new Animated.Value(0),
                  transform: [{ translateY: new Animated.Value(20) }]
                }
              ]}
            >
              <Text style={styles.heroBannerCTAText}>{item.ctaText}</Text>
              <Ionicons name="arrow-forward" size={18} color="#1e293b" />
            </Animated.View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Show loading screen on initial load
  if (isLoading && featuredProducts.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
      >
        {/* Welcome section */}
        <ThemedView style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <ThemedText type="title" style={styles.welcomeTitle}>
                Hello, {user?.name?.split(' ')[0] || 'Guest'}
              </ThemedText>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={colors.tint} />
                <ThemedText style={styles.locationText}>{selectedCity}</ThemedText>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.profileButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile');
              }}
            >
              <Ionicons name="person" size={20} color={colors.tint} />
            </TouchableOpacity>
          </View>
          
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
        </ThemedView>

        {/* Hero Carousel Section */}
        <View style={styles.heroSection}>
          <Animated.FlatList
            ref={bannerScrollRef}
            data={HERO_BANNERS}
            renderItem={renderHeroBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={BANNER_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.heroContainer}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
          />
          
          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {HERO_BANNERS.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  { 
                    backgroundColor: index === currentBannerIndex 
                      ? '#ffffff' 
                      : 'rgba(255,255,255,0.5)',
                    width: index === currentBannerIndex ? 24 : 8,
                  }
                ]}
                onPress={() => {
                  bannerScrollRef.current?.scrollToIndex({ index, animated: true });
                  setCurrentBannerIndex(index);
                }}
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={[styles.sectionContainer, { backgroundColor: '#f1f5f9' }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {displayCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem, 
                  { 
                    backgroundColor: colorScheme === 'dark' 
                      ? colors.cardBackground 
                      : '#ffffff'
                  }
                ]}
                onPress={() => navigateToCategory(category.name)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        <View style={[styles.sectionContainer, { backgroundColor: '#ffffff' }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={[styles.seeAllText, { color: colors.tint }]}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.tint} />
            </TouchableOpacity>
          </View>

          {featuredProducts.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={80} color={colors.tabIconDefault} />
              <Text style={styles.emptyText}>No products available</Text>
              <Text style={styles.emptySubtext}>
                {selectedCity ? `No products found in ${selectedCity}` : 'Try selecting a different city'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts.slice(0, 4)}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Special Offers Section */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.specialOffersSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#ffffff' }]}>Fresh Deals</Text>
          </View>
          
          {featuredProducts.filter(p => p.discountedPrice).length > 0 ? (
            <FlatList
              data={featuredProducts.filter(p => p.discountedPrice).slice(0, 4)}
              renderItem={({ item }) => <ProductCard product={item} theme="light" />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: '#ffffff' }]}>No special offers available</Text>
            </View>
          )}
        </LinearGradient>

        {/* Best Sellers Section */}
        <View style={[styles.sectionContainer, { backgroundColor: '#f1f5f9' }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={[styles.seeAllText, { color: colors.tint }]}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.tint} />
            </TouchableOpacity>
          </View>

          {bestSellers.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={80} color={colors.tabIconDefault} />
              <Text style={styles.emptyText}>No best sellers available</Text>
            </View>
          ) : (
            <FlatList
              data={bestSellers.slice(0, 4)}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Features Section */}
        <View style={[styles.sectionContainer, { backgroundColor: '#ffffff' }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
          </View>
          
          <View style={styles.featuresGrid}>
            {[
              { icon: '🚚', title: 'Fast Delivery', description: 'Quick delivery to your doorstep' },
              { icon: '🌱', title: 'Fresh Products', description: 'Farm-fresh quality guaranteed' },
              { icon: '💰', title: 'Best Prices', description: 'Competitive prices every day' },
              { icon: '🛡️', title: 'Secure Payment', description: 'Safe and secure transactions' }
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Newsletter Section */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.newsletterSection}
        >
          <Text style={styles.newsletterTitle}>Stay Updated</Text>
          <Text style={styles.newsletterSubtitle}>Get the latest deals and offers</Text>
          
          <View style={styles.newsletterInputContainer}>
            <TextInput
              style={styles.newsletterInput}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity style={styles.newsletterButton}>
              <Text style={styles.newsletterButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Poppins',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
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
    fontFamily: 'Poppins',
    color: '#1e293b',
  },
  // Hero Section Styles
  heroSection: {
    marginBottom: 24,
    height: width * 0.7, // 60-70vh equivalent
  },
  heroContainer: {
    paddingHorizontal: 16,
  },
  heroBannerContainer: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: width * 0.6,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  heroBannerDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  heroBannerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  heroBannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  heroBannerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  heroBannerSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
    fontFamily: 'Poppins',
  },
  heroBannerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  heroBannerCTAText: {
    color: '#1e293b',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Section Styles
  sectionContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
    fontFamily: 'Poppins',
  },
  // Categories Styles
  categoriesContainer: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginRight: 16,
    borderRadius: 16,
    width: 100,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1e293b',
    fontFamily: 'Poppins',
  },
  
  // Special Offers Section
  specialOffersSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  
  // Features Section
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  
  // Newsletter Section
  newsletterSection: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 0,
  },
  newsletterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  newsletterSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Poppins',
  },
  newsletterInputContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
  },
  newsletterInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginRight: 12,
    fontFamily: 'Poppins',
  },
  newsletterButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsletterButtonText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Poppins',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    color: '#1e293b',
    fontFamily: 'Poppins',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
