import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';

export default function Home({ navigation, route }: any) {
  const [userName, setUserName] = useState<string | null>(null);

  // Get user name from route params
  useEffect(() => {
    if (route?.params?.userName) {
      setUserName(route.params.userName);
      console.log('User name received:', route.params.userName);
    }
  }, [route]);

  const handleLogout = async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('jwtToken');
      } else {
        localStorage.removeItem('jwtToken');
      }
      Alert.alert('Logged out');
      navigation.replace('Login');
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Logout failed');
    }
  };

  const goToIntegrityStatus = () => {
    navigation.navigate('IntegrityStatus');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CLOUDCOIN!</Text>
      <Text style={styles.subtitle}>
        {userName ? `Logged in as ${userName}` : 'You are now logged in.'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="View System Status" onPress={goToIntegrityStatus} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Logout" color="#FF3B30" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10
  }
});
