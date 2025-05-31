import { Colors } from '@/constants/Colors';
import { useCity } from '@/context/CityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '../ThemedView';

interface CitySelectorProps {
  compact?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ compact = false }) => {
  const { selectedCity, cities, setCity } = useCity();
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCitySelect = async (city: string) => {
    await setCity(city);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, compact && styles.compactContainer]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="location" size={compact ? 16 : 20} color={colors.tint} />
        <Text style={[
          styles.cityText,
          compact && styles.compactText,
          { color: colors.text }
        ]}>
          {selectedCity}
        </Text>
        <Ionicons name="chevron-down" size={compact ? 16 : 20} color={colors.tabIconDefault} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select City</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={cities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    selectedCity === item && { backgroundColor: colors.tint + '20' }
                  ]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={[styles.cityItemText, { color: colors.text }]}>{item}</Text>
                  {selectedCity === item && (
                    <Ionicons name="checkmark" size={20} color={colors.tint} />
                  )}
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  compactContainer: {
    padding: 4,
    borderWidth: 0,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  compactText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cityItemText: {
    fontSize: 16,
  },
});