import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
  fullScreen?: boolean;
}

/**
 * Professional Loading Spinner Component
 * Features: Smooth animations, customizable, accessible
 */
export function LoadingSpinner({ 
  size = 'medium', 
  text, 
  color, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const spinnerColor = color || colors.tint;
  
  const sizeConfig = {
    small: { width: 20, height: 20, borderWidth: 2 },
    medium: { width: 40, height: 40, borderWidth: 3 },
    large: { width: 60, height: 60, borderWidth: 4 },
  };

  useEffect(() => {
    // Spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Pulse animation for text
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    if (text) {
      pulseAnimation.start();
    }

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, text]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const Container = fullScreen ? ThemedView : View;
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.inlineContainer;

  return (
    <Container style={containerStyle}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.spinner,
            sizeConfig[size],
            {
              borderColor: `${spinnerColor}20`,
              borderTopColor: spinnerColor,
              transform: [{ rotate: spin }],
            },
          ]}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading"
        />
        
        {text && (
          <Animated.View style={{ opacity: pulseValue }}>
            <ThemedText 
              style={[styles.loadingText, { color: colors.text }]}
              accessibilityLiveRegion="polite"
            >
              {text}
            </ThemedText>
          </Animated.View>
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
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinnerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    borderRadius: 50,
    borderStyle: 'solid',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});