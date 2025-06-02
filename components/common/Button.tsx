import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.disabledBackground : colors.tint,
          borderColor: colors.tint,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.disabledBackground : colors.secondaryBackground,
          borderColor: colors.secondaryBackground,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.tint,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? colors.disabledBackground : '#FF3B30',
          borderColor: '#FF3B30',
        };
      default:
        return {
          backgroundColor: disabled ? colors.disabledBackground : colors.tint,
          borderColor: colors.tint,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          color: disabled ? colors.disabledText : colors.tint,
        };
      default:
        return {
          color: disabled ? colors.disabledText : '#FFFFFF',
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.tint : '#FFFFFF'} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? colors.tint : '#FFFFFF'}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});