import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, posterFallback } from '../api/client';
import { ReviewCard } from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';

export function MediaDetailPage() {
  const { type, tmdbId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState('');

  async function load() {
    try {
      const detail = await api<any>(`/media/${type}/${tmdbId}`);
      setData(detail);
      if (user) {
        const listData = await api<{ lists: any[] }>('/collections/me/lists');
        setLists(listData.lists);
        setSelectedList((current) => current || listData.lists[0]?.id || '');
      }
    } catch (error: any) {
      setError(error.message);
    }
  }

  useEffect(() => { load(); }, [type, tmdbId]);

  async function addToLibrary(status: string) {
    await api('/collections/me/library', {
      method: 'POST',
      body: JSON.stringify({ tmdbId: Number(tmdbId), type: type?.toUpperCase(), status })
    });
    alert('Bibliothèque mise à jour');
  }

  async function addToCustomList() {
    if (!selectedList) return;
    await api(`/collections/me/lists/${selectedList}/items`, {
      method: 'POST',
      body: JSON.stringify({ tmdbId: Number(tmdbId), type: type?.toUpperCase() })
    });
    alert('Œuvre ajoutée à la liste');
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    await api('/reviews', {
      method: 'POST',
      body: JSON.stringify({ tmdbId: Number(tmdbId), type: type?.toUpperCase(), rating, content, spoiler })
    });
    setContent('');
    await load();
  }

  if (error) return <main><p className="error">{error}</p></main>;
  if (!data) return <main><p>Chargement...</p></main>;

  const media = data.media;
  const raw = media.raw ?? {};

  return (
    <main>
      <section className="detail-hero" style={{ backgroundImage: media.backdropUrl ? `linear-gradient(90deg, #0f172a, rgba(15,23,42,.65)), url(${media.backdropUrl})` : undefined }}>
        <img src={media.posterUrl ?? posterFallback} alt={media.title} />
        <div>
          <h1>{media.title}</h1>
          <p>{media.overview}</p>
          <p><strong>Note SUPCONTENT :</strong> {data.community.averageRating?.toFixed(1) ?? 'Aucune'} / 5</p>
          <p><strong>Genres :</strong> {(media.genres ?? []).map((g: any) => g.name).join(', ') || 'Non renseigné'}</p>
          <p><strong>Casting :</strong> {(raw.credits?.cast ?? []).slice(0, 6).map((person: any) => person.name).join(', ')}</p>
          {user && <>
            <div className="actions">
              <button onClick={() => addToLibrary('WATCHLIST')}>À voir</button>
              <button onClick={() => addToLibrary('IN_PROGRESS')}>En cours</button>
              <button onClick={() => addToLibrary('COMPLETED')}>Terminé</button>
              <button onClick={() => addToLibrary('ABANDONED')}>Abandonné</button>
            </div>
            {lists.length > 0 && <div className="inline-form">
              <select value={selectedList} onChange={(event) => setSelectedList(event.target.value)}>
                {lists.map((list) => <option key={list.id} value={list.id}>{list.title}</option>)}
              </select>
              <button onClick={addToCustomList}>Ajouter à une liste</button>
            </div>}
          </>}
        </div>
      </section>

      {user && <section className="panel">
        <h2>Rédiger une critique</h2>
        <form className="stack" onSubmit={submitReview}>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}
          </select>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre avis détaillé..." />
          <label><input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} /> Contient des spoilers</label>
          <button>Publier</button>
        </form>
      </section>}

      <section className="panel">
        <h2>Critiques de la communauté</h2>
        {data.reviews.map((review: any) => <ReviewCard key={review.id} review={review} onChange={load} />)}
      </section>
    </main>
  );
}
