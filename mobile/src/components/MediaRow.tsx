import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type MediaResult = {
  tmdbId: number;
  type: 'MOVIE' | 'TV';
  title: string;
  overview?: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
};

export function MediaRow({ media, onPress }: { media: MediaResult; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: media.posterUrl ?? 'https://placehold.co/300x450/101828/ffffff?text=SUP' }} style={styles.poster} />
      <View style={styles.content}>
        <Text style={styles.title}>{media.title}</Text>
        <Text style={styles.meta}>{media.type === 'MOVIE' ? 'Film' : 'Série'} · {media.releaseDate?.slice(0, 4) ?? 'N/A'}</Text>
        <Text style={styles.overview} numberOfLines={3}>{media.overview || 'Aucun résumé disponible.'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 18, backgroundColor: '#1e293b', marginBottom: 12 },
  poster: { width: 88, height: 132, borderRadius: 12, backgroundColor: '#334155' },
  content: { flex: 1 },
  title: { color: '#f8fafc', fontWeight: '800', fontSize: 16 },
  meta: { color: '#94a3b8', marginVertical: 6 },
  overview: { color: '#cbd5e1', lineHeight: 19 }
});
