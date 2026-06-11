import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function MediaDetailScreen({ type, tmdbId, currentUser }: { type: string; tmdbId: number; currentUser: any | null }) {
  const [data, setData] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [commentByReview, setCommentByReview] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [error, setError] = useState('');

  async function load() {
    try {
      const result = await api<any>(`/media/${type}/${tmdbId}`);
      setData(result);
      if (currentUser) {
        const listData = await api<{ lists: any[] }>('/collections/me/lists');
        setLists(listData.lists);
        setSelectedList((current) => current || listData.lists[0]?.id || '');
      }
    } catch (error: any) {
      setError(error.message);
    }
  }

  useEffect(() => { load(); }, [type, tmdbId, currentUser?.id]);

  async function add(status: string) {
    await api('/collections/me/library', { method: 'POST', body: JSON.stringify({ tmdbId, type: type.toUpperCase(), status }) });
  }

  async function addToList() {
    if (!selectedList) return;
    await api(`/collections/me/lists/${selectedList}/items`, { method: 'POST', body: JSON.stringify({ tmdbId, type: type.toUpperCase() }) });
  }

  async function review() {
    await api('/reviews', { method: 'POST', body: JSON.stringify({ tmdbId, type: type.toUpperCase(), rating, content, spoiler: false }) });
    setContent('');
    load();
  }

  async function like(reviewId: string) {
    await api(`/reviews/${reviewId}/like`, { method: 'POST' });
    load();
  }

  async function comment(reviewId: string) {
    const text = commentByReview[reviewId];
    if (!text) return;
    await api(`/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ content: text }) });
    setCommentByReview((current) => ({ ...current, [reviewId]: '' }));
    load();
  }

  async function saveEdit() {
    await api(`/reviews/${editingId}`, { method: 'PATCH', body: JSON.stringify({ content: editContent, rating: editRating }) });
    setEditingId('');
    load();
  }

  async function deleteReview(reviewId: string) {
    await api(`/reviews/${reviewId}`, { method: 'DELETE' });
    load();
  }

  async function report(reviewId: string) {
    await api(`/reviews/${reviewId}/report`, { method: 'POST', body: JSON.stringify({ reason: 'Signalement depuis mobile' }) });
  }

  if (error) return <Screen title="Erreur"><Text style={styles.error}>{error}</Text></Screen>;
  if (!data) return <Screen title="Chargement"><Text style={styles.text}>Chargement...</Text></Screen>;

  const media = data.media;
  return (
    <Screen title={media.title}>
      <Image source={{ uri: media.posterUrl ?? 'https://placehold.co/300x450/101828/ffffff?text=SUP' }} style={styles.poster} />
      <Text style={styles.text}>{media.overview}</Text>
      <Text style={styles.meta}>Note SUPCONTENT : {data.community.averageRating?.toFixed(1) ?? 'Aucune'} / 5</Text>
      <Text style={styles.meta}>Genres : {(media.genres ?? []).map((g: any) => g.name).join(', ') || 'Non renseigné'}</Text>
      <Text style={styles.meta}>Casting : {(media.raw?.credits?.cast ?? []).slice(0, 5).map((p: any) => p.name).join(', ')}</Text>
      {currentUser && <>
        <View style={styles.actions}>
          {[['WATCHLIST','À voir'], ['IN_PROGRESS','En cours'], ['COMPLETED','Terminé'], ['ABANDONED','Abandonné']].map(([status,label]) => <Pressable key={status} style={styles.smallButton} onPress={() => add(status)}><Text style={styles.buttonText}>{label}</Text></Pressable>)}
        </View>
        {lists.length > 0 && <View style={styles.actions}>
          <Pressable style={styles.smallButton} onPress={() => {
            const index = lists.findIndex((list) => list.id === selectedList);
            setSelectedList(lists[(index + 1) % lists.length]?.id ?? '');
          }}><Text style={styles.buttonText}>{lists.find((list) => list.id === selectedList)?.title ?? 'Liste'}</Text></Pressable>
          <Pressable style={styles.button} onPress={addToList}><Text style={styles.darkText}>Ajouter à la liste</Text></Pressable>
        </View>}
        <Text style={styles.subtitle}>Rédiger une critique</Text>
        <View style={styles.actions}>{[1,2,3,4,5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={rating === value ? styles.starActive : styles.star}>★</Text></Pressable>)}</View>
        <TextInput style={styles.input} value={content} onChangeText={setContent} placeholder="Votre critique..." placeholderTextColor="#94a3b8" multiline />
        <Pressable style={styles.button} onPress={review}><Text style={styles.darkText}>Publier</Text></Pressable>
      </>}
      <Text style={styles.subtitle}>Critiques</Text>
      {data.reviews.map((r: any) => {
        const isOwner = currentUser?.id === r.userId;
        return <View key={r.id} style={styles.review}>
          <Text style={styles.text}>{r.user.displayName} · {r.rating}/5 · {r.likesCount ?? 0} j’aime</Text>
          {editingId === r.id ? <>
            <View style={styles.actions}>{[1,2,3,4,5].map((value) => <Pressable key={value} onPress={() => setEditRating(value)}><Text style={editRating === value ? styles.starActive : styles.star}>★</Text></Pressable>)}</View>
            <TextInput style={styles.input} value={editContent} onChangeText={setEditContent} multiline />
            <Pressable style={styles.button} onPress={saveEdit}><Text style={styles.darkText}>Enregistrer</Text></Pressable>
          </> : <Text style={styles.meta}>{r.content}</Text>}
          {currentUser && <View style={styles.actions}>
            {!isOwner && <Pressable style={styles.smallButton} onPress={() => like(r.id)}><Text style={styles.buttonText}>J’aime</Text></Pressable>}
            {!isOwner && <Pressable style={styles.smallButton} onPress={() => report(r.id)}><Text style={styles.buttonText}>Signaler</Text></Pressable>}
            {isOwner && <Pressable style={styles.smallButton} onPress={() => { setEditingId(r.id); setEditContent(r.content); setEditRating(r.rating); }}><Text style={styles.buttonText}>Modifier</Text></Pressable>}
            {isOwner && <Pressable style={styles.danger} onPress={() => deleteReview(r.id)}><Text style={styles.buttonText}>Supprimer</Text></Pressable>}
          </View>}
          {(r.comments ?? []).map((c: any) => <Text style={styles.meta} key={c.id}>{c.user?.displayName} : {c.content}</Text>)}
          {currentUser && <View style={styles.actions}>
            <TextInput style={[styles.input, styles.commentInput]} value={commentByReview[r.id] ?? ''} onChangeText={(value) => setCommentByReview((current) => ({ ...current, [r.id]: value }))} placeholder="Commenter" placeholderTextColor="#94a3b8" />
            <Pressable style={styles.button} onPress={() => comment(r.id)}><Text style={styles.darkText}>Envoyer</Text></Pressable>
          </View>}
        </View>;
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  poster: { width: 180, height: 270, borderRadius: 18, alignSelf: 'center', marginBottom: 18 },
  text: { color: '#f8fafc', lineHeight: 22 },
  meta: { color: '#cbd5e1', marginTop: 8, lineHeight: 20 },
  subtitle: { color: '#f8fafc', fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 999, alignItems: 'center' },
  smallButton: { backgroundColor: '#334155', padding: 10, borderRadius: 999 },
  danger: { backgroundColor: '#ef4444', padding: 10, borderRadius: 999 },
  buttonText: { color: '#e2e8f0', fontWeight: '800' },
  darkText: { color: '#082f49', fontWeight: '900' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 14, minHeight: 80, textAlignVertical: 'top' },
  commentInput: { flex: 1, minHeight: 44 },
  star: { color: '#64748b', fontSize: 28 },
  starActive: { color: '#facc15', fontSize: 28 },
  review: { backgroundColor: '#1e293b', padding: 12, borderRadius: 14, marginBottom: 10 },
  error: { color: '#fca5a5' }
});
