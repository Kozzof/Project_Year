import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function HomeScreen() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    api<{ activities: any[] }>('/feed').then((data) => setActivities(data.activities)).catch(() => setActivities([]));
  }, []);

  return (
    <Screen title="Fil d’actualité">
      {activities.length === 0 && <Text style={styles.meta}>Suivez des utilisateurs pour voir leurs activités.</Text>}
      {activities.map((activity) => (
        <View key={activity.id} style={styles.card}>
          <Text style={styles.title}>{activity.actor.displayName}</Text>
          <Text style={styles.meta}>{activity.type} {activity.media?.title ?? ''}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 10 },
  title: { color: '#f8fafc', fontWeight: '900' },
  meta: { color: '#cbd5e1' }
});
