import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const data = await api<{ notifications: any[]; unreadCount: number }>('/notifications');
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  useEffect(() => {
    load().catch(() => undefined);
    const interval = setInterval(() => load().catch(() => undefined), 10000);
    return () => clearInterval(interval);
  }, []);

  async function markAll() {
    await api('/notifications/read/all', { method: 'PATCH' });
    load();
  }

  return (
    <Screen title="Notifications">
      <Text style={styles.meta}>{unreadCount} non lue(s)</Text>
      <Pressable style={styles.button} onPress={markAll}><Text style={styles.buttonText}>Tout lire</Text></Pressable>
      {notifications.map((notification) => (
        <View key={notification.id} style={[styles.card, !notification.readAt && styles.unread]}>
          <Text style={styles.title}>{notification.type}</Text>
          <Text style={styles.meta}>{JSON.stringify(notification.payload)}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: '#cbd5e1', marginBottom: 10 },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 999, alignItems: 'center', marginBottom: 14 },
  buttonText: { color: '#082f49', fontWeight: '900' },
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  unread: { borderColor: '#38bdf8' },
  title: { color: '#f8fafc', fontWeight: '900' }
});
