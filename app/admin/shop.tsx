import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AdminShopScreen() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  // Safety check - don't render admin content for non-admins
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Shop Management</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Shop Overview</ThemedText>
          
          <View style={[styles.statsContainer, { borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>24</ThemedText>
              <ThemedText style={styles.statLabel}>Products</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Orders</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>5</ThemedText>
              <ThemedText style={styles.statLabel}>Categories</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="add-circle" size={28} color={colors.tint} />
              <ThemedText style={styles.actionText}>Add Product</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="list" size={28} color={colors.tint} />
              <ThemedText style={styles.actionText}>Manage Products</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="cart" size={28} color={colors.tint} />
              <ThemedText style={styles.actionText}>View Orders</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="analytics" size={28} color={colors.tint} />
              <ThemedText style={styles.actionText}>Analytics</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Orders</ThemedText>
          
          <View style={[styles.orderItem, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.orderHeader}>
              <ThemedText style={styles.orderNumber}>#1001</ThemedText>
              <ThemedText style={[styles.orderStatus, { color: colors.tint }]}>Pending</ThemedText>
            </View>
            <ThemedText>Customer: John Doe</ThemedText>
            <ThemedText>Items: 3 × $45.99</ThemedText>
            <ThemedText style={styles.orderDate}>June 10, 2023</ThemedText>
          </View>
          
          <View style={[styles.orderItem, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.orderHeader}>
              <ThemedText style={styles.orderNumber}>#1000</ThemedText>
              <ThemedText style={[styles.orderStatus, { color: 'green' }]}>Completed</ThemedText>
            </View>
            <ThemedText>Customer: Jane Smith</ThemedText>
            <ThemedText>Items: 2 × $29.99</ThemedText>
            <ThemedText style={styles.orderDate}>June 9, 2023</ThemedText>
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
  },
  orderItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontWeight: 'bold',
  },
  orderStatus: {
    fontWeight: 'bold',
  },
  orderDate: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
});