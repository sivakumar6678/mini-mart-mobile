import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const FAQ_ITEMS = [
  {
    question: 'How do I place an order?',
    answer: 'To place an order, browse products, add them to your cart, and proceed to checkout. Select your delivery address and payment method, then confirm your order.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We currently accept cash on delivery (COD). More payment options will be added soon.'
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 1-2 days depending on your location and the availability of products.'
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order if it has not been dispatched yet. Go to your order details and select "Cancel Order".'
  },
  {
    question: 'How do I track my order?',
    answer: 'You can track your order in the "My Orders" section of your profile. Each order will show its current status.'
  },
  {
    question: 'What if I receive damaged products?',
    answer: 'If you receive damaged products, please contact our customer support within 24 hours of delivery with photos of the damaged items.'
  },
];

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@minimart.com');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+919876543210');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Contact Us</ThemedText>
          
          <View style={[styles.contactCard, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity style={styles.contactItem} onPress={handleContactEmail}>
              <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="mail" size={24} color={colors.tint} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactTitle}>Email Support</ThemedText>
                <ThemedText style={styles.contactValue}>support@minimart.com</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.contactItem} onPress={handleContactPhone}>
              <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="call" size={24} color={colors.tint} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactTitle}>Phone Support</ThemedText>
                <ThemedText style={styles.contactValue}>+91 9876543210</ThemedText>
                <ThemedText style={styles.contactHours}>Mon-Sat, 9:00 AM - 6:00 PM</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* FAQ Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
          
          {FAQ_ITEMS.map((item, index) => (
            <Collapsible key={index} title={item.question}>
              <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
            </Collapsible>
          ))}
        </View>
        
        {/* Quick Links */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Links</ThemedText>
          
          <TouchableOpacity
            style={[styles.quickLink, { backgroundColor: colors.cardBackground }]}
            onPress={() => router.push('/profile/orders')}
          >
            <Ionicons name="bag-outline" size={24} color={colors.text} />
            <ThemedText style={styles.quickLinkText}>My Orders</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickLink, { backgroundColor: colors.cardBackground }]}
            onPress={() => router.push('/profile/addresses')}
          >
            <Ionicons name="location-outline" size={24} color={colors.text} />
            <ThemedText style={styles.quickLinkText}>My Addresses</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickLink, { backgroundColor: colors.cardBackground }]}
            onPress={() => Alert.alert('Terms & Conditions', 'These are the terms and conditions for using the Mini Mart app.')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.text} />
            <ThemedText style={styles.quickLinkText}>Terms & Conditions</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  contactCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  faqAnswer: {
    lineHeight: 22,
    marginBottom: 8,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLinkText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
});