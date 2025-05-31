import { ProductCard } from '@/components/product/ProductCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/services/product.service';
import { Shop } from '@/services/shop.service';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock data for shops (same as in explore screen)
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

// Mock data for products
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
];

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadShopAndProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const foundShop = SHOPS.find(s => s.id === Number(id));
          setShop(foundShop || null);
          
          if (foundShop) {
            const shopProducts = PRODUCTS.filter(p => p.shopId === foundShop.id);
            setProducts(shopProducts);
          }
          
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading shop details:', error);
        setIsLoading(false);
      }
    };

    loadShopAndProducts();
  }, [id]);

  const handleCall = () => {
    if (shop) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const handleEmail = () => {
    if (shop) {
      Linking.openURL(`mailto:${shop.email}`);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Shop Details' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!shop) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <Stack.Screen options={{ title: 'Shop Not Found' }} />
        <Ionicons name="alert-circle-outline" size={60} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.notFoundText}>
          Shop not found
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: shop.name }} />
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} horizontal />}
        ListHeaderComponent={
          <>
            <Image
              source={{ uri: shop.image }}
              style={styles.shopImage}
              contentFit="cover"
            />
            
            <View style={styles.shopInfo}>
              <ThemedText type="title">{shop.name}</ThemedText>
              <ThemedText style={styles.description}>{shop.description}</ThemedText>
              
              <View style={styles.contactInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={20} color={colors.tabIconDefault} />
                  <ThemedText style={styles.infoText}>{shop.address}, {shop.city}</ThemedText>
                </View>
                
                <TouchableOpacity style={styles.infoItem} onPress={handleCall}>
                  <Ionicons name="call-outline" size={20} color={colors.tint} />
                  <ThemedText style={[styles.infoText, { color: colors.tint }]}>{shop.phone}</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.infoItem} onPress={handleEmail}>
                  <Ionicons name="mail-outline" size={20} color={colors.tint} />
                  <ThemedText style={[styles.infoText, { color: colors.tint }]}>{shop.email}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.productsHeader}>
              <ThemedText type="subtitle">Products</ThemedText>
              <ThemedText>{products.length} items</ThemedText>
            </View>
          </>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={60} color={colors.tabIconDefault} />
            <ThemedText style={styles.emptyText}>
              No products available from this shop
            </ThemedText>
          </ThemedView>
        }
        contentContainerStyle={styles.productsList}
      />
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    marginTop: 16,
  },
  shopImage: {
    width: width,
    height: 200,
  },
  shopInfo: {
    padding: 16,
  },
  description: {
    marginTop: 8,
    marginBottom: 16,
  },
  contactInfo: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
});