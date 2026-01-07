import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API } from '../../constants/api'; // constants file for URLs

// ---------------- Types ----------------
interface HealthStatus {
  status: string;
  lastOpenTime: string | null; // UTC string from server
  minutesSinceLast: number | null;
}

interface IntegrityResponse {
  aws: HealthStatus;
  pi: HealthStatus;
}

// ---------------- Component ----------------
export default function IntegrityStatus() {
  const [health, setHealth] = useState<IntegrityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<Date>(new Date());

  // Live client local time
  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch integrity status
  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      setError(null);

      try {
        const token =
          Platform.OS !== 'web'
            ? await SecureStore.getItemAsync('jwtToken')
            : localStorage.getItem('jwtToken');

        if (!token) throw new Error('User token missing.');

        const apiUrl = `${API.BASE_URL}${API.INTEGRITY_STATUS}`;
        console.log('Fetching health from API URL:', apiUrl);
        console.log('Using token:', token);

        const res = await fetch(`${API.BASE_URL}${API.INTEGRITY_STATUS}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

        const data: IntegrityResponse = await res.json();
        setHealth(data);
      } catch (err: any) {
        console.error('Failed to fetch health:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  // ---------------- Helpers ----------------
  const getCardColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return '#4CAF50'; // green
      case 'stale': return '#FF9800'; // orange
      case 'down': return '#F44336'; // red
      default: return '#9E9E9E'; // grey
    }
  };

  const timeAgo = (last: string) => {
    const diffMs = Date.now() - new Date(last + 'Z').getTime(); // treat as UTC
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
  };

  const renderCard = (label: string, status: HealthStatus) => {
    let localTimeStr = '';
    if (status.lastOpenTime) {
      const utcDate = new Date(status.lastOpenTime + 'Z'); // ensure UTC
      localTimeStr = utcDate.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    return (
      <View key={label} style={[styles.healthCard, { borderLeftColor: getCardColor(status.status) }]}>
        <Text style={styles.healthLabel}>{label}</Text>
        <Text>Status: <Text style={{ fontWeight: 'bold', color: getCardColor(status.status) }}>{status.status}</Text></Text>
        {status.lastOpenTime && (
          <>
            <Text>Last Open Time: {localTimeStr}</Text>
            <Text>Time Ago: {timeAgo(status.lastOpenTime)}</Text>
          </>
        )}
      </View>
    );
  };

  // ---------------- Render ----------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>System Integrity Status</Text>

      {/* Live local time */}
      <View style={styles.localTimeContainer}>
        <Text style={styles.localTimeLabel}>Your Local Time:</Text>
        <Text style={styles.localTime}>{localTime.toLocaleString()}</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && health && (
        <View style={styles.healthContainer}>
          {renderCard('AWS', health.aws)}
          {renderCard('Raspberry Pi', health.pi)}
        </View>
      )}
    </ScrollView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7'
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  localTimeContainer: { marginBottom: 20, alignItems: 'center' },
  localTimeLabel: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  localTime: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  healthContainer: { width: '100%' },
  healthCard: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5
  },
  healthLabel: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  errorText: { color: 'red', fontSize: 16, marginTop: 10, textAlign: 'center' }
});
