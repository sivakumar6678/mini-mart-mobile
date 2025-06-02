import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// FAQ categories
const FAQ_CATEGORIES = [
  { id: 'orders', title: 'Orders', icon: 'receipt-outline' },
  { id: 'delivery', title: 'Delivery', icon: 'bicycle-outline' },
  { id: 'payment', title: 'Payment', icon: 'card-outline' },
  { id: 'returns', title: 'Returns', icon: 'return-down-back-outline' },
  { id: 'account', title: 'Account', icon: 'person-outline' },
  { id: 'products', title: 'Products', icon: 'basket-outline' },
];

// FAQ items
const FAQ_ITEMS = [
  {
    id: 1,
    question: 'How do I track my order?',
    answer: 'You can track your order by going to "My Orders" in your profile. Select the order you want to track and tap on "Track Order". You\'ll see real-time updates on your order status.',
    category: 'orders',
  },
  {
    id: 2,
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order as long as it hasn\'t been dispatched. Go to "My Orders", select the order you want to cancel, and tap on "Cancel Order". Once an order is dispatched, it cannot be cancelled.',
    category: 'orders',
  },
  {
    id: 3,
    question: 'What should I do if I receive damaged items?',
    answer: 'If you receive damaged items, please take photos of the damaged products and contact our customer support within 24 hours of delivery. We\'ll arrange for a return and replacement or refund.',
    category: 'orders',
  },
  {
    id: 4,
    question: 'How long does delivery take?',
    answer: 'Standard delivery typically takes 1-3 business days, depending on your location. Express delivery is available in select areas and can deliver your order within 2 hours.',
    category: 'delivery',
  },
  {
    id: 5,
    question: 'Is there a minimum order value for free delivery?',
    answer: 'Yes, orders above ₹500 qualify for free delivery. For orders below this amount, a delivery fee of ₹40 is applicable.',
    category: 'delivery',
  },
  {
    id: 6,
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, digital wallets, UPI, and cash on delivery. All online payments are secure and encrypted.',
    category: 'payment',
  },
  {
    id: 7,
    question: 'Is cash on delivery available?',
    answer: 'Yes, cash on delivery is available for orders up to ₹10,000. Please keep the exact amount ready to ensure a smooth delivery experience.',
    category: 'payment',
  },
  {
    id: 8,
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for most products. Perishable items must be reported within 24 hours. To initiate a return, go to "My Orders" and select "Return" on the relevant order.',
    category: 'returns',
  },
  {
    id: 9,
    question: 'How do I return a product?',
    answer: 'To return a product, go to "My Orders", select the order containing the item you want to return, and tap on "Return Items". Follow the instructions to complete the return process.',
    category: 'returns',
  },
  {
    id: 10,
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login screen and tap on "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link.',
    category: 'account',
  },
  {
    id: 11,
    question: 'How can I update my delivery address?',
    answer: 'You can update your delivery address by going to "My Profile" > "Addresses". Here you can edit existing addresses or add new ones.',
    category: 'account',
  },
  {
    id: 12,
    question: 'How do I check product quality and freshness?',
    answer: 'All our products, especially fresh produce, undergo strict quality checks. Each product has a freshness indicator on the packaging. If you\'re not satisfied with the quality, you can return it within 24 hours.',
    category: 'products',
  },
  {
    id: 13,
    question: 'Are your products organic?',
    answer: 'We offer both organic and conventional products. Organic products are clearly labeled with an "Organic" tag and certification details. You can filter for organic products in our search.',
    category: 'products',
  },
];

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQScreen() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
    setExpandedId(null);
  };

  const handleFAQPress = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/support/chat');
  };

  const filteredFAQs = searchQuery
    ? FAQ_ITEMS.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQ_ITEMS.filter(item => item.category === activeCategory);

  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.faqItem,
          { backgroundColor: colors.cardBackground },
          isExpanded && styles.expandedFaqItem
        ]}
        onPress={() => handleFAQPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.faqHeader}>
          <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text}
          />
        </View>
        
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Frequently Asked Questions' }} />
      
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="search-outline" size={20} color={colors.tabIconDefault} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search FAQs..."
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
      
      {!searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {FAQ_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && { 
                  backgroundColor: colors.tint,
                  borderColor: colors.tint,
                }
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={activeCategory === category.id ? '#FFFFFF' : colors.text}
              />
              <ThemedText
                style={[
                  styles.categoryText,
                  activeCategory === category.id && { color: '#FFFFFF' }
                ]}
              >
                {category.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {searchQuery && filteredFAQs.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={60} color={colors.tabIconDefault} />
          <ThemedText style={styles.noResultsText}>No results found</ThemedText>
          <ThemedText style={styles.noResultsSubtext}>
            Try different keywords or contact our support team
          </ThemedText>
          <TouchableOpacity
            style={[styles.contactSupportButton, { backgroundColor: colors.tint }]}
            onPress={handleContactSupport}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.contactSupportText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredFAQs}
          renderItem={renderFAQItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.faqList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.contactSupportButton, { backgroundColor: colors.tint }]}
              onPress={handleContactSupport}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.contactSupportText}>Still have questions? Chat with us</ThemedText>
            </TouchableOpacity>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  faqList: {
    paddingBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedFaqItem: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  faqAnswerContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  contactSupportText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});