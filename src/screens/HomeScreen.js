import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button, FlatList, RefreshControl, Text, View } from "react-native";
import { clients } from "../services/apiClient";
import { mergeLastSeen } from "../utils/mergeData";

export default function HomeScreen() {

  const [coins, setCoins] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFrom = async (client) => {
    try {
      const { data } = await client.get("/api/coins");
      return data;
    } catch (err) {
      return null;
    }
  };

  const load = async () => {
    setRefreshing(true);

    const [awsRes, gcloudRes, rpiRes] = await Promise.all([
      fetchFrom(clients.aws),
      fetchFrom(clients.gcloud),
      fetchFrom(clients.rpi)
    ]);

    const merged = mergeLastSeen({
      aws: awsRes,
      gcloud: gcloudRes,
      rpi: rpiRes
    });

    setCoins(merged);

    await AsyncStorage.setItem("cacheCoins", JSON.stringify(merged));

    setRefreshing(false);
  };

  // load cached + refresh
  useEffect(() => {
    (async () => {
      const cache = await AsyncStorage.getItem("cacheCoins");
      if (cache) setCoins(JSON.parse(cache));

      await load();
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 26, marginBottom: 12 }}>Coin Monitor</Text>

      <Button title="Refresh" onPress={load} />

      <FlatList
        data={coins}
        keyExtractor={(item) => item.symbol}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ddd" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.symbol}</Text>
            <Text>{item.name}</Text>
            <Text>Last Seen: {new Date(item.lastSeen).toLocaleString()}</Text>
            <Text>Source: {item.source}</Text>
          </View>
        )}
      />
    </View>
  );
}
