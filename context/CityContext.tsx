import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CityContextType {
  selectedCity: string;
  cities: string[];
  setCity: (city: string) => Promise<void>;
}

const CITY_STORAGE_KEY = 'selectedCity';
const DEFAULT_CITY = 'Mumbai';
const AVAILABLE_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'];

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const savedCity = await AsyncStorage.getItem(CITY_STORAGE_KEY);
        if (savedCity) {
          setSelectedCity(savedCity);
        }
      } catch (error) {
        console.error('Error loading city:', error);
      }
    };

    loadCity();
  }, []);

  const setCity = async (city: string) => {
    try {
      await AsyncStorage.setItem(CITY_STORAGE_KEY, city);
      setSelectedCity(city);
    } catch (error) {
      console.error('Error saving city:', error);
      throw error;
    }
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        cities: AVAILABLE_CITIES,
        setCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};