import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function ListsScreen() {
  const [lists, setLists] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tmdbIdByList, setTmdbIdByList] = useState<Record<string, string>>({});
  const [titleByList, setTitleByList] = useState<Record<string, string>>({});
  const [typeByList, setTypeByList] = useState<Record<string, 'MOVIE' | 'TV'>>({});

  async function load() {
    const data = await api<{ lists: any[] }>('/collections/me/lists');
    setLists(data.lists);
  }

  useEffect(() => { load().catch(() => setLists([])); }, []);

  async function createList() {
    if (!title.trim()) return;
    await api('/collections/me/lists', { method: 'POST', body: JSON.stringify({ title, isPublic }) });
    setTitle('');
    setIsPublic(false);
    load();
  }

  async function togglePublic(list: any) {
    await api(`/collections/me/lists/${list.id}`, { method: 'PATCH', body: JSON.stringify({ isPublic: !list.isPublic }) });
    load();
  }

  async function rename(list: any) {
    const nextTitle = titleByList[list.id]?.trim();
    if (!nextTitle) return;
    await api(`/collections/me/lists/${list.id}`, { method: 'PATCH', body: JSON.stringify({ title: nextTitle }) });
    setTitleByList((current) => ({ ...current, [list.id]: '' }));
    load();
  }

  async function deleteList(id: string) {
    await api(`/collections/me/lists/${id}`, { method: 'DELETE' });
    load();
  }

  async function addItem(id: string) {
    const tmdbId = Number(tmdbIdByList[id]);
    if (!tmdbId) return;
    await api(`/collections/me/lists/${id}/items`, { method: 'POST', body: JSON.stringify({ tmdbId, type: typeByList[id] ?? 'MOVIE' }) });
    setTmdbIdByList((current) => ({ ...current, [id]: '' }));
    load();
  }

  async function removeItem(listId: string, mediaId: string) {
    await api(`/collections/me/lists/${listId}/items/${mediaId}`, { method: 'DELETE' });
    load();
  }

  return (
    <Screen title="Listes">
      <View style={styles.card}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Nom de liste" placeholderTextColor="#94a3b8" />
        <Pressable style={styles.secondary} onPress={() => setIsPublic(!isPublic)}><Text style={styles.buttonText}>{isPublic ? 'Publique' : 'Privée'}</Text></Pressable>
        <Pressable style={styles.button} onPress={createList}><Text style={styles.darkText}>Créer</Text></Pressable>
      </View>
      {lists.map((list) => (
        <View style={styles.card} key={list.id}>
          <Text style={styles.title}>{list.title}</Text>
          <Text style={styles.meta}>{list.isPublic ? 'Publique' : 'Privée'} · {list.items.length} œuvre(s)</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.flex]} value={titleByList[list.id] ?? ''} onChangeText={(value) => setTitleByList((current) => ({ ...current, [list.id]: value }))} placeholder="Nouveau nom" placeholderTextColor="#94a3b8" />
            <Pressable style={styles.secondary} onPress={() => rename(list)}><Text style={styles.buttonText}>Renommer</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => togglePublic(list)}><Text style={styles.buttonText}>Public/privé</Text></Pressable>
            <Pressable style={styles.danger} onPress={() => deleteList(list.id)}><Text style={styles.buttonText}>Supprimer</Text></Pressable>
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.flex]} value={tmdbIdByList[list.id] ?? ''} onChangeText={(value) => setTmdbIdByList((current) => ({ ...current, [list.id]: value }))} placeholder="ID TMDB" placeholderTextColor="#94a3b8" keyboardType="number-pad" />
            <Pressable style={styles.secondary} onPress={() => setTypeByList((current) => ({ ...current, [list.id]: current[list.id] === 'TV' ? 'MOVIE' : 'TV' }))}><Text style={styles.buttonText}>{typeByList[list.id] ?? 'MOVIE'}</Text></Pressable>
            <Pressable style={styles.button} onPress={() => addItem(list.id)}><Text style={styles.darkText}>Ajouter</Text></Pressable>
          </View>
          {list.items.map((item: any) => <View key={item.id} style={styles.item}><Text style={styles.meta}>{item.media.title}</Text><Pressable onPress={() => removeItem(list.id, item.mediaId)}><Text style={styles.link}>Retirer</Text></Pressable></View>)}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 12, gap: 10 },
  title: { color: '#f8fafc', fontWeight: '900', fontSize: 18 },
  meta: { color: '#cbd5e1' },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  flex: { flex: 1, minWidth: 100 },
  button: { backgroundColor: '#38bdf8', padding: 10, borderRadius: 999, alignItems: 'center' },
  secondary: { backgroundColor: '#334155', padding: 10, borderRadius: 999, alignItems: 'center' },
  danger: { backgroundColor: '#ef4444', padding: 10, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: '#e2e8f0', fontWeight: '800' },
  darkText: { color: '#082f49', fontWeight: '900' },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  link: { color: '#38bdf8' }
});
