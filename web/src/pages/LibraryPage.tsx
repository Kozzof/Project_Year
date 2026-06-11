import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MediaCard } from '../components/MediaCard';

const statuses = [
  ['WATCHLIST', 'À voir'],
  ['IN_PROGRESS', 'En cours'],
  ['COMPLETED', 'Terminé'],
  ['ABANDONED', 'Abandonné']
];

export function LibraryPage() {
  const [status, setStatus] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  async function load() {
    const params = status ? `?status=${status}` : '';
    const data = await api<{ entries: any[] }>(`/collections/me/library${params}`);
    const statData = await api<any>('/collections/me/stats');
    setEntries(data.entries);
    setStats(statData.stats);
  }

  useEffect(() => { load(); }, [status]);

  async function remove(mediaId: string) {
    await api(`/collections/me/library/${mediaId}`, { method: 'DELETE' });
    load();
  }

  return (
    <main>
      <section className="hero"><h1>Ma bibliothèque</h1><p>Suivi des films et séries par statut.</p></section>
      <section className="panel">
        <div className="tabs">
          <button onClick={() => setStatus('')} className={!status ? 'active' : ''}>Tous</button>
          {statuses.map(([value, label]) => <button key={value} onClick={() => setStatus(value)} className={status === value ? 'active' : ''}>{label}</button>)}
        </div>
        {stats && <p>{stats.totalReviews} critique(s) publiée(s)</p>}
      </section>
      <section className="grid">
        {entries.map((entry) => <div key={entry.id} className="list-item"><MediaCard media={{ ...entry.media, type: entry.media.type, tmdbId: entry.media.tmdbId, posterUrl: entry.media.posterUrl }} /><button className="secondary" onClick={() => remove(entry.mediaId)}>Retirer</button></div>)}
      </section>
    </main>
  );
}
