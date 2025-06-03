import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import ProductService, { Product } from '@/services/product.service';
import UploadService from '@/services/upload.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  quantity: string;
  category: string;
}

export default function AdminProductsScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    quantity: '',
    category: '',
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, authLoading]);

  const loadProducts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert(
        'Error',
        'Failed to load products. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => loadProducts() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadProducts();
    }
  }, [user, loadProducts]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadProducts(true);
  }, [loadProducts]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      quantity: '',
      category: '',
    });
    setSelectedImages([]);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      quantity: product.quantity.toString(),
      category: product.category,
    });
    setSelectedImages(product.images || []);
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductService.deleteProduct(product.id);
              setProducts(products.filter(p => p.id !== product.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    try {
      setIsUploadingImages(true);
      const result = await UploadService.takePhoto();
      
      if (!result.canceled && result.assets[0]) {
        const uploadResult = await UploadService.uploadImage(result.assets[0].uri);
        setSelectedImages([...selectedImages, uploadResult.url]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', error.message || 'Failed to take photo');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      setIsUploadingImages(true);
      const result = await UploadService.pickImageFromGallery();
      
      if (!result.canceled && result.assets[0]) {
        const uploadResult = await UploadService.uploadImage(result.assets[0].uri);
        setSelectedImages([...selectedImages, uploadResult.url]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', error.message || 'Failed to pick image');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one product image');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        quantity: parseInt(formData.quantity),
        category: formData.category,
        images: selectedImages,
        shopId: 1, // TODO: Get from user's shop
      };

      if (editingProduct) {
        const updatedProduct = await ProductService.updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        const newProduct = await ProductService.createProduct(productData);
        setProducts([newProduct, ...products]);
      }

      setShowAddModal(false);
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.productImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
            <Ionicons name="image-outline" size={40} color={colors.tabIconDefault} />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.productCategory}>{item.category}</ThemedText>
        <ThemedText style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        
        <View style={styles.priceContainer}>
          <ThemedText style={styles.price}>
            {formatCurrency(item.discountedPrice || item.price)}
          </ThemedText>
          {item.discountedPrice && (
            <ThemedText style={styles.originalPrice}>
              {formatCurrency(item.price)}
            </ThemedText>
          )}
        </View>
        
        <ThemedText style={styles.quantity}>Stock: {item.quantity}</ThemedText>
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="pencil" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (authLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Products',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Ionicons name="add" size={24} color={colors.tint} />
            </TouchableOpacity>
          )
        }} 
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
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
              <Ionicons name="storefront-outline" size={80} color={colors.tabIconDefault} />
              <ThemedText style={styles.emptyText}>No products yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Add your first product to get started
              </ThemedText>
              <Button
                title="Add Product"
                onPress={handleAddProduct}
                icon="add-outline"
                style={styles.addFirstButton}
              />
            </View>
          }
        />
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </ThemedText>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.tint} />
              ) : (
                <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>
                  Save
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Product Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter product name"
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter product description"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Category *"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="Enter category"
            />

            <View style={styles.priceRow}>
              <Input
                label="Price *"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
                style={styles.halfInput}
              />

              <Input
                label="Discounted Price"
                value={formData.discountedPrice}
                onChangeText={(text) => setFormData({ ...formData, discountedPrice: text })}
                placeholder="0.00"
                keyboardType="numeric"
                style={styles.halfInput}
              />
            </View>

            <Input
              label="Quantity *"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholder="Enter quantity"
              keyboardType="numeric"
            />

            {/* Image Upload Section */}
            <View style={styles.imageSection}>
              <ThemedText style={styles.sectionTitle}>Product Images *</ThemedText>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagesContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image
                        source={{ uri: image }}
                        style={styles.selectedImage}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity
                    style={[styles.addImageButton, { borderColor: colors.border }]}
                    onPress={handleImagePicker}
                    disabled={isUploadingImages}
                  >
                    {isUploadingImages ? (
                      <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color={colors.tint} />
                        <ThemedText style={styles.addImageText}>Add Image</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  addButton: {
    padding: 8,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  quantity: {
    fontSize: 12,
    opacity: 0.7,
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  addFirstButton: {
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  imageSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});