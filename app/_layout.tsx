import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Home from './screens/Home';
import IntegrityStatus from './screens/IntegrityStatus';
import Login from './screens/Login';

const Stack = createStackNavigator();

// ----------------------
// Safe cross-platform token functions
// ----------------------
const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('jwtToken');
  } else if (SecureStore.getItemAsync) {
    return await SecureStore.getItemAsync('jwtToken');
  } else {
    console.warn('SecureStore not available');
    return null;
  }
};

export default function AppLayout() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) setInitialRoute('Home');
      else setInitialRoute('Login');
    };
    checkToken();
  }, []);

  if (!initialRoute) return null; // Wait until we know initial route

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen
        name="IntegrityStatus"
        component={IntegrityStatus}
        options={{ title: 'System Status' }}
      />
    </Stack.Navigator>
  );
}
