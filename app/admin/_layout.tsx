import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="shop"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}