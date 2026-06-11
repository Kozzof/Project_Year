import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { MediaCard, MediaSearchResult } from '../components/MediaCard';

export function SearchPage() {
  const [q, setQ] = useState('star wars');
  const [type, setType] = useState('all');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function search(nextPage = 1) {
    if (q.trim().length < 2) return;
    setError('');
    try {
      if (type === 'all' && !year && sort === 'popularity') {
        const data = await api<{ media: MediaSearchResult[]; users: any[]; lists: any[] }>(`/media/global?q=${encodeURIComponent(q)}&page=${nextPage}`);
        setPage(nextPage);
        setResults(nextPage === 1 ? data.media : [...results, ...data.media]);
        setUsers(data.users);
        setLists(data.lists);
        return;
      }
      const params = new URLSearchParams({ q, page: String(nextPage), type, sort });
      if (year) params.set('year', year);
      const data = await api<{ results: MediaSearchResult[] }>(`/media/search?${params.toString()}`);
      setPage(nextPage);
      setResults(nextPage === 1 ? data.results : [...results, ...data.results]);
      setUsers([]);
      setLists([]);
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <main>
      <section className="hero">
        <h1>Découvrir des films et séries</h1>
        <p>Recherche unifiée : œuvres TMDB, utilisateurs SUPCONTENT et listes publiques.</p>
      </section>
      <section className="panel">
        <div className="searchbar extended">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titre, utilisateur, liste..." />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Films + séries</option>
            <option value="movie">Films</option>
            <option value="tv">Séries</option>
          </select>
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Année" />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popularity">Popularité</option>
            <option value="date">Date</option>
            <option value="title">Titre</option>
          </select>
          <button onClick={() => search(1)}>Rechercher</button>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      {users.length > 0 && <section className="panel">
        <h2>Utilisateurs</h2>
        <div className="chips">{users.map((item) => <Link key={item.id} to={`/users/${item.id}`}>{item.displayName}</Link>)}</div>
      </section>}

      {lists.length > 0 && <section className="panel">
        <h2>Listes publiques</h2>
        {lists.map((list) => <article className="activity" key={list.id}><strong>{list.title}</strong><small>par {list.user.displayName} · {list.items.length} œuvre(s)</small></article>)}
      </section>}

      <section className="grid">
        {results.map((item) => <MediaCard key={`${item.type}-${item.tmdbId}`} media={item} />)}
      </section>
      {results.length > 0 && <button className="load-more" onClick={() => search(page + 1)}>Charger plus</button>}
    </main>
  );
}
