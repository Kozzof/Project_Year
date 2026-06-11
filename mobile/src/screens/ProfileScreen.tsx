import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function ProfileScreen() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  async function searchUsers() {
    try {
      setError('');
      const data = await api<{ users: any[] }>(`/users/search?q=${encodeURIComponent(q)}`);
      setUsers(data.users);
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function open(id: string) {
    const data = await api<any>(`/users/${id}`);
    setProfile(data);
  }

  async function follow(id: string) {
    await api(`/users/${id}/follow`, { method: 'POST' });
    open(id);
  }

  return (
    <Screen title="Profils">
      <View style={styles.row}>
        <TextInput style={styles.input} value={q} onChangeText={setQ} placeholder="Rechercher un utilisateur" placeholderTextColor="#94a3b8" />
        <Pressable style={styles.button} onPress={searchUsers}><Text style={styles.darkText}>OK</Text></Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {users.map((user) => <Pressable key={user.id} style={styles.card} onPress={() => open(user.id)}><Text style={styles.title}>{user.displayName}</Text><Text style={styles.meta}>{user.bio ?? 'Profil public'}</Text></Pressable>)}
      {profile && <View style={styles.card}>
        <Text style={styles.title}>{profile.user.displayName}</Text>
        <Text style={styles.meta}>{profile.user.bio ?? 'Aucune biographie.'}</Text>
        <Text style={styles.meta}>{profile.stats.followersCount} abonné(s) · {profile.stats.followingCount} abonnement(s)</Text>
        <Pressable style={styles.button} onPress={() => follow(profile.user.id)}><Text style={styles.darkText}>Suivre / ne plus suivre</Text></Pressable>
        <Text style={styles.subtitle}>Abonnés</Text>
        {(profile.followers ?? []).map((item: any) => <Text key={item.id} style={styles.meta}>{item.displayName}</Text>)}
        <Text style={styles.subtitle}>Abonnements</Text>
        {(profile.following ?? []).map((item: any) => <Text key={item.id} style={styles.meta}>{item.displayName}</Text>)}
        <Text style={styles.subtitle}>Critiques récentes</Text>
        {profile.reviews.map((review: any) => <Text key={review.id} style={styles.meta}>{review.media.title} · {review.rating}/5</Text>)}
      </View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#f8fafc', padding: 12, borderRadius: 14 },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 999, alignItems: 'center' },
  darkText: { color: '#082f49', fontWeight: '900' },
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 12, gap: 8 },
  title: { color: '#f8fafc', fontWeight: '900', fontSize: 18 },
  subtitle: { color: '#f8fafc', fontWeight: '900', marginTop: 10 },
  meta: { color: '#cbd5e1' },
  error: { color: '#fca5a5' }
});
