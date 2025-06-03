import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/order.service';
import { Order } from '../../types';

export default function TrackOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<{
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
    history: {
      status: string;
      timestamp: string;
      location?: string;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        
        const trackingData = await orderService.trackOrder(orderId);
        setTrackingInfo(trackingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#4CAF50';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order || !trackingInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Track Order</Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
        <Text style={styles.orderDate}>
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.trackingContainer}>
        <Text style={styles.sectionTitle}>Tracking Information</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { color: getStatusColor(trackingInfo.status) }]}>
            {trackingInfo.status}
          </Text>
          {trackingInfo.estimatedDelivery && (
            <Text style={styles.estimatedDelivery}>
              Estimated Delivery: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
            </Text>
          )}
        </View>

        {trackingInfo.trackingNumber && (
          <View style={styles.trackingNumberContainer}>
            <Text style={styles.trackingLabel}>Tracking Number:</Text>
            <Text style={styles.trackingNumber}>{trackingInfo.trackingNumber}</Text>
          </View>
        )}

        {trackingInfo.currentLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Current Location:</Text>
            <Text style={styles.locationText}>{trackingInfo.currentLocation}</Text>
          </View>
        )}
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Order History</Text>
        {trackingInfo.history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text style={styles.historyStatusText}>{item.status}</Text>
            </View>
            <Text style={styles.historyTimestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            {item.location && (
              <Text style={styles.historyLocation}>{item.location}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#757575',
  },
  trackingContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: '#757575',
  },
  trackingNumberContainer: {
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
  },
  historyContainer: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  historyStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTimestamp: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 14,
    color: '#757575',
  },
}); 