import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
  { id: 1, name: 'Fruits', icon: '🍎', color: '#FFA5A5' },
  { id: 2, name: 'Vegetables', icon: '🥦', color: '#A5D6A7' },
  { id: 3, name: 'Dairy', icon: '🥛', color: '#B3E5FC' },
  { id: 4, name: 'Bakery', icon: '🍞', color: '#FFCC80' },
  { id: 5, name: 'Snacks', icon: '🍿', color: '#E1BEE7' },
  { id: 6, name: 'Beverages', icon: '🥤', color: '#B2DFDB' },
];

// Mock data for promotional banners
const PROMOTIONS = [
  {
    id: 1,
    title: 'Summer Sale',
    description: 'Get up to 30% off on fresh fruits',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
    color: '#FFB74D',
  },
  {
    id: 2,
    title: 'New Arrivals',
    description: 'Check out our organic vegetables',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6',
    color: '#81C784',
  },
  {
    id: 3,
    title: 'Free Delivery',
    description: 'On orders above ₹500',
    image: 'https://images.unsplash.com/photo-1580913428023-02c695666d61',
    color: '#64B5F6',
  },
];

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 48;

export default function HomeScreen() {
  const { selectedCity } = useCity();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(FEATURED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / BANNER_WIDTH);
      setCurrentBannerIndex(index);
    });
    
    return () => {
      scrollX.removeListener(listener);
    };
  }, []);

  const renderPromotionBanner = ({ item, index }: { item: typeof PROMOTIONS[0], index: number }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        style={[styles.bannerContainer, { width: BANNER_WIDTH }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.bannerImage}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={[styles.bannerOverlay, { backgroundColor: item.color + '80' }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerDescription}>{item.description}</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Shop Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
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

        {/* Promotional Banners */}
        <View style={styles.bannersSection}>
          <Animated.FlatList
            data={PROMOTIONS}
            renderItem={renderPromotionBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={BANNER_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.bannersContainer}
            onScroll={handleBannerScroll}
          />
          
          <View style={styles.paginationContainer}>
            {PROMOTIONS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { 
                    backgroundColor: index === currentBannerIndex 
                      ? colors.tint 
                      : colors.tabIconDefault + '50',
                    width: index === currentBannerIndex ? 20 : 8,
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem, 
                  { 
                    backgroundColor: colorScheme === 'dark' 
                      ? colors.cardBackground 
                      : category.color + '30'
                  }
                ]}
                onPress={() => navigateToCategory(category.name)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Featured Products */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Featured Products</ThemedText>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllProducts}
            >
              <ThemedText style={{ color: colors.tint }}>See All</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.tint} />
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
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  bannersSection: {
    marginBottom: 24,
  },
  bannersContainer: {
    paddingRight: 16,
  },
  bannerContainer: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 160,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerOverlay: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  bannerContent: {
    maxWidth: '60%',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
  categoriesContainer: {
    paddingVertical: 8,
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
  },
  productRow: {
    justifyContent: 'space-between',
  },
  loader: {
    marginVertical: 20,
  },
});
