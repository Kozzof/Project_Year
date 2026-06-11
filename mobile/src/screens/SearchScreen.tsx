import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { MediaResult, MediaRow } from '../components/MediaRow';
import { Screen } from '../components/Screen';

export function SearchScreen({ openMedia }: { openMedia: (type: string, tmdbId: number) => void }) {
  const [q, setQ] = useState('star wars');
  const [type, setType] = useState<'all' | 'movie' | 'tv'>('all');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState<'popularity' | 'date' | 'title'>('popularity');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function search(nextPage = 1) {
    try {
      setError('');
      if (type === 'all' && !year && sort === 'popularity') {
        const data = await api<{ media: MediaResult[]; users: any[]; lists: any[] }>(`/media/global?q=${encodeURIComponent(q)}&page=${nextPage}`);
        setPage(nextPage);
        setResults(nextPage === 1 ? data.media : [...results, ...data.media]);
        setUsers(data.users);
        setLists(data.lists);
        return;
      }
      const data = await api<{ results: MediaResult[] }>(`/media/search?q=${encodeURIComponent(q)}&type=${type}&page=${nextPage}&year=${encodeURIComponent(year)}&sort=${sort}`);
      setPage(nextPage);
      setResults(nextPage === 1 ? data.results : [...results, ...data.results]);
      setUsers([]);
      setLists([]);
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <Screen title="Recherche">
      <View style={styles.searchbar}>
        <TextInput value={q} onChangeText={setQ} placeholder="Film, série, utilisateur..." placeholderTextColor="#94a3b8" style={styles.input} />
        <Pressable style={styles.button} onPress={() => search(1)}><Text style={styles.buttonText}>Chercher</Text></Pressable>
      </View>
      <View style={styles.filters}>
        <Pressable style={styles.chip} onPress={() => setType(type === 'all' ? 'movie' : type === 'movie' ? 'tv' : 'all')}><Text style={styles.chipText}>{type}</Text></Pressable>
        <TextInput value={year} onChangeText={setYear} placeholder="Année" placeholderTextColor="#94a3b8" style={styles.year} />
        <Pressable style={styles.chip} onPress={() => setSort(sort === 'popularity' ? 'date' : sort === 'date' ? 'title' : 'popularity')}><Text style={styles.chipText}>{sort}</Text></Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {users.length > 0 && <Text style={styles.section}>Utilisateurs</Text>}
      {users.map((user) => <Text style={styles.meta} key={user.id}>{user.displayName}</Text>)}
      {lists.length > 0 && <Text style={styles.section}>Listes publiques</Text>}
      {lists.map((list) => <Text style={styles.meta} key={list.id}>{list.title} · {list.items.length} œuvre(s)</Text>)}
      {results.map((item) => <MediaRow key={`${item.type}-${item.tmdbId}`} media={item} onPress={() => openMedia(item.type.toLowerCase(), item.tmdbId)} />)}
      {results.length > 0 && <Pressable style={styles.button} onPress={() => search(page + 1)}><Text style={styles.buttonText}>Charger plus</Text></Pressable>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchbar: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#f8fafc', padding: 12, borderRadius: 14 },
  year: { width: 90, backgroundColor: '#1e293b', color: '#f8fafc', padding: 10, borderRadius: 999 },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#082f49', fontWeight: '900' },
  chip: { backgroundColor: '#334155', padding: 10, borderRadius: 999 },
  chipText: { color: '#e2e8f0', fontWeight: '800' },
  section: { color: '#f8fafc', fontWeight: '900', fontSize: 18, marginVertical: 10 },
  meta: { color: '#cbd5e1', marginBottom: 8 },
  error: { color: '#fca5a5', marginBottom: 12 }
});
