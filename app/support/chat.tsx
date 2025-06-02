import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

// Mock chat messages
const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: 'Hello! Welcome to Mini Mart support. How can I help you today?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

// Mock order issues
const ORDER_ISSUES = [
  'Where is my order?',
  'I want to cancel my order',
  'I received the wrong items',
  'Items are damaged',
  'Missing items in my order',
];

// Mock product issues
const PRODUCT_ISSUES = [
  'Product quality issue',
  'Product information inquiry',
  'Product availability',
  'Product recommendations',
];

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

export default function SupportChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setMessages(INITIAL_MESSAGES);
          setIsLoading(false);
          
          // Animate suggestions
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 1000);
      } catch (error) {
        console.error('Error loading chat:', error);
        setIsLoading(false);
      }
    };

    loadChat();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);
    setShowSuggestions(false);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: Date.now(),
        text: getAgentResponse(userMessage.text),
        sender: 'agent',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsSending(false);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(suggestion);
    
    // Hide suggestions with animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSuggestions(false);
    });
  };

  const getAgentResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('where') && lowerMessage.includes('order')) {
      return "I'd be happy to help you track your order. Could you please provide your order number? Alternatively, you can check the status in the 'My Orders' section of your account.";
    }
    
    if (lowerMessage.includes('cancel') && lowerMessage.includes('order')) {
      return "I understand you want to cancel your order. If your order hasn't been dispatched yet, you can cancel it from the order details page. Would you like me to guide you through the process?";
    }
    
    if (lowerMessage.includes('wrong') && lowerMessage.includes('item')) {
      return "I'm sorry to hear you received the wrong items. Please take photos of the items you received and we'll arrange for a return and replacement. Would you like me to create a return request for you?";
    }
    
    if (lowerMessage.includes('damaged')) {
      return "I apologize for the damaged items. Please take photos of the damaged products and we'll process a replacement or refund. Would you like to proceed with a return request?";
    }
    
    if (lowerMessage.includes('missing')) {
      return "I'm sorry to hear about the missing items. Could you please confirm your order number and which items are missing? We'll investigate this immediately.";
    }
    
    if (lowerMessage.includes('quality')) {
      return "I'm sorry about the quality issues you're experiencing. Could you please provide more details about the product and the specific quality concerns? This will help us address the issue properly.";
    }
    
    if (lowerMessage.includes('availability') || lowerMessage.includes('available')) {
      return "I'd be happy to check the availability of any product for you. Could you please specify which product you're interested in?";
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      return "I'd be glad to recommend products based on your preferences. Could you tell me what type of products you're looking for or your specific requirements?";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello there! How can I assist you with your Mini Mart shopping experience today?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with today?";
    }
    
    return "Thank you for your message. I'd be happy to help with your inquiry. Could you please provide more details so I can assist you better?";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.agentMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser 
            ? [styles.userMessageBubble, { backgroundColor: colors.tint }]
            : [styles.agentMessageBubble, { backgroundColor: colors.cardBackground }]
        ]}>
          <ThemedText style={[
            styles.messageText,
            isUser && { color: '#FFFFFF' }
          ]}>
            {item.text}
          </ThemedText>
        </View>
        <ThemedText style={styles.messageTime}>
          {formatTime(item.timestamp)}
        </ThemedText>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Customer Support' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Customer Support',
            headerRight: () => (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/support/faq');
                }}
              >
                <Ionicons name="help-circle-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            )
          }} 
        />
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.chatHeader}>
              <View style={[styles.agentAvatar, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="headset-outline" size={24} color={colors.tint} />
              </View>
              <ThemedText style={styles.agentName}>Mini Mart Support</ThemedText>
              <ThemedText style={styles.agentStatus}>Online | Typically replies in 5 minutes</ThemedText>
            </View>
          }
        />
        
        {showSuggestions && (
          <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
            <ThemedText style={styles.suggestionsTitle}>Common Order Issues</ThemedText>
            <View style={styles.suggestionsList}>
              {ORDER_ISSUES.map((issue, index) => (
                <TouchableOpacity
                  key={`order-${index}`}
                  style={[styles.suggestionButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleSuggestionPress(issue)}
                >
                  <ThemedText style={styles.suggestionText}>{issue}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            <ThemedText style={styles.suggestionsTitle}>Product Inquiries</ThemedText>
            <View style={styles.suggestionsList}>
              {PRODUCT_ISSUES.map((issue, index) => (
                <TouchableOpacity
                  key={`product-${index}`}
                  style={[styles.suggestionButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => handleSuggestionPress(issue)}
                >
                  <ThemedText style={styles.suggestionText}>{issue}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
        
        {isSending && (
          <View style={styles.typingIndicator}>
            <ThemedText style={styles.typingText}>Support agent is typing...</ThemedText>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        )}
        
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.tint : colors.border },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
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
  headerButton: {
    padding: 8,
  },
  chatHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  agentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  agentStatus: {
    fontSize: 14,
    opacity: 0.7,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  agentMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  agentMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    padding: 16,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 8,
  },
});