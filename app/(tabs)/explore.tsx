import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Shop } from '@/services/shop.service';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for shops
const SHOPS: Shop[] = [
  {
    id: 1,
    name: 'Fresh Grocery Store',
    description: 'Your one-stop shop for fresh fruits, vegetables, and daily essentials',
    address: '123 Main Street',
    city: 'Mumbai',
    phone: '9876543210',
    email: 'contact@freshgrocery.com',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
    userId: 1,
  },
  {
    id: 2,
    name: 'Bakery Delights',
    description: 'Freshly baked bread, cakes, and pastries',
    address: '456 Baker Avenue',
    city: 'Mumbai',
    phone: '9876543211',
    email: 'info@bakerydelights.com',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f',
    userId: 2,
  },
  {
    id: 3,
    name: 'Organic Farm Fresh',
    description: 'Organic produce directly from farms',
    address: '789 Green Road',
    city: 'Delhi',
    phone: '9876543212',
    email: 'hello@organicfarmfresh.com',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9',
    userId: 3,
  },
  {
    id: 4,
    name: 'Daily Needs Mart',
    description: 'All your daily needs under one roof',
    address: '101 Market Street',
    city: 'Bangalore',
    phone: '9876543213',
    email: 'support@dailyneedsmart.com',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58',
    userId: 4,
  },
];

export default function ExploreScreen() {
  const { selectedCity } = useCity();
  const [isLoading, setIsLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadShops = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          // Filter shops by selected city
          const filteredShops = SHOPS.filter(shop => shop.city === selectedCity);
          setShops(filteredShops);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading shops:', error);
        setIsLoading(false);
      }
    };

    loadShops();
  }, [selectedCity]);

  const handleShopPress = (shopId: number) => {
    router.push(`/shop/${shopId}`);
  };

  const filteredShops = searchQuery
    ? shops.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shops;

  const renderShopItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={[styles.shopCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleShopPress(item.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.shopImage}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.shopInfo}>
        <ThemedText style={styles.shopName}>{item.name}</ThemedText>
        <ThemedText style={styles.shopDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.shopAddress}>
          <Ionicons name="location-outline" size={16} color={colors.tabIconDefault} />
          <ThemedText style={styles.addressText}>{item.address}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Ionicons
          name="search"
          size={200}
          color="#808080"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Explore Shops</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover shops in {selectedCity}
        </ThemedText>

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search shops..."
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

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
        ) : filteredShops.length > 0 ? (
          <FlatList
            data={filteredShops}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.shopsList}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={60} color={colors.tabIconDefault} />
            <ThemedText style={styles.emptyText}>
              No shops found in {selectedCity}
            </ThemedText>
          </ThemedView>
        )}
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
    opacity: 0.3,
    bottom: -50,
    right: -50,
    position: 'absolute',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
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
  shopsList: {
    paddingBottom: 16,
  },
  shopCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shopImage: {
    width: '100%',
    height: 150,
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  shopDescription: {
    marginBottom: 12,
  },
  shopAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginLeft: 4,
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
});
