import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API } from '../../constants/api';
import { GOOGLE_CLIENT_ID } from '../../constants/env';

WebBrowser.maybeCompleteAuthSession();

// ----------------------
// Safe cross-platform storage
// ----------------------
const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem('jwtToken');
  if (SecureStore.getItemAsync) return await SecureStore.getItemAsync('jwtToken');
  console.warn('SecureStore not available');
  return null;
};

const storeToken = async (token: string) => {
  if (Platform.OS === 'web') return localStorage.setItem('jwtToken', token);
  if (SecureStore.setItemAsync) return await SecureStore.setItemAsync('jwtToken', token);
  console.warn('SecureStore not available');
};

// ----------------------
// Login Component
// ----------------------
export default function Login({ navigation }: any) {
  const [redirectUriDisplay, setRedirectUriDisplay] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  const redirectUri = makeRedirectUri({ useProxy: false } as any);
  const authUrl = `${API.BASE_URL}${API.GOOGLE_AUTH}`;

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  // Show redirect URI
  useEffect(() => setRedirectUriDisplay(redirectUri), []);

  // Auto-login if token exists
  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      console.log('Checking token on app start:', token);
      if (token) {
        console.log('Token found. Navigating to Home...');
        navigation.replace('Home');
      }
    };
    checkToken();
  }, []);

  // Debug: log response
  useEffect(() => {
    if (response) console.log('Google Auth Response:', response);
  }, [response]);

  // Handle Google Sign-In
  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;
        console.log('Authorization code received:', code);

        if (!code) {
          Alert.alert('Login failed', 'No authorization code received.');
          return;
        }

        try {
          console.log('Sending code to backend...');
          const res = await fetch(authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              redirectUri,
              codeVerifier: request?.codeVerifier,
            }),
          });

          const data = await res.json();
          console.log('Backend response:', data);

          if (!res.ok) throw new Error(data.error || 'Backend login failed');

          await storeToken(data.token);
          setUserName(data.name || 'User'); // Save name from backend response

          console.log('Token stored, navigating to Home...');
          Alert.alert('Logged in!', `Welcome, ${data.name || 'User'}!`);
          navigation.replace('Home', { userName: data.name || 'User' });
        } catch (err) {
          console.error('Login error:', err);
          Alert.alert('Login failed', 'Cannot reach backend.');
        }
      }

      if (response?.type === 'error') {
        console.error('Google Sign-In error:', response.error);
        Alert.alert('Login failed', 'Google Sign-In error.');
      }
    };

    handleGoogleLogin();
  }, [response]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CLOUDCOIN Login</Text>

      <Text style={styles.label}>Redirect URI (must match Google):</Text>
      <Text selectable style={styles.uri}>{redirectUriDisplay}</Text>

      <View style={{ marginVertical: 20 }}>
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => {
            console.log('Prompting Google Sign-In...');
            promptAsync();
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  uri: { fontSize: 14, color: '#333', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 6 },
});
