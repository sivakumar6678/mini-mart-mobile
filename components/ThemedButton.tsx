import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  iconColor = '#fff',
  disabled = false,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && (
            <MaterialIcons
              name={icon}
              size={20}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <ThemedText style={[styles.text, textStyle]}>
            {title}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    minHeight: 48,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 