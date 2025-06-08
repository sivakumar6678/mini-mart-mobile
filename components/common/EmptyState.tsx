import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

/**
 * Professional Empty State Component
 * Features: Customizable, accessible, consistent design
 */
export function EmptyState({
  icon = 'search-outline',
  title,
  description,
  actionText,
  onAction,
  fullScreen = true,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const Container = fullScreen ? ThemedView : View;
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.inlineContainer;

  return (
    <Container style={containerStyle}>
      <View style={styles.content}>
        <Ionicons 
          name={icon} 
          size={64} 
          color={colors.tabIconDefault}
          accessibilityHidden
        />
        
        <ThemedText 
          style={[styles.title, { color: colors.text }]}
          accessibilityRole="header"
        >
          {title}
        </ThemedText>
        
        {description && (
          <ThemedText style={[styles.description, { color: colors.tabIconDefault }]}>
            {description}
          </ThemedText>
        )}
        
        {actionText && onAction && (
          <Button
            title={actionText}
            onPress={onAction}
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            accessibilityHint="Tap to perform the suggested action"
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 8,
    minWidth: 120,
  },
});