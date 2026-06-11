import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { MediaRow } from '../components/MediaRow';
import { Screen } from '../components/Screen';

const statuses = [
  ['WATCHLIST', 'À voir'],
  ['IN_PROGRESS', 'En cours'],
  ['COMPLETED', 'Terminé'],
  ['ABANDONED', 'Abandonné']
];

export function LibraryScreen({ openMedia }: { openMedia: (type: string, tmdbId: number) => void }) {
  const [status, setStatus] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  async function load() {
    const params = status ? `?status=${status}` : '';
    const data = await api<{ entries: any[] }>(`/collections/me/library${params}`);
    setEntries(data.entries);
  }

  useEffect(() => { load().catch(() => setEntries([])); }, [status]);

  return (
    <Screen title="Bibliothèque">
      <View style={styles.tabs}>
        <Pressable style={styles.tab} onPress={() => setStatus('')}><Text style={styles.tabText}>Tous</Text></Pressable>
        {statuses.map(([value, label]) => <Pressable key={value} style={styles.tab} onPress={() => setStatus(value)}><Text style={styles.tabText}>{label}</Text></Pressable>)}
      </View>
      {entries.map((entry) => <MediaRow key={entry.id} media={{ ...entry.media, tmdbId: entry.media.tmdbId, posterUrl: entry.media.posterUrl }} onPress={() => openMedia(entry.media.type.toLowerCase(), entry.media.tmdbId)} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tab: { backgroundColor: '#334155', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  tabText: { color: '#e2e8f0', fontWeight: '700' }
});
