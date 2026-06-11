import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { MediaCard } from '../components/MediaCard';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  async function load() {
    const data = await api<any>(`/users/${id}`);
    setProfile(data);
  }

  useEffect(() => { load(); }, [id]);

  async function follow() {
    await api(`/users/${id}/follow`, { method: 'POST' });
    load();
  }

  async function searchUsers() {
    const data = await api<{ users: any[] }>(`/users/search?q=${encodeURIComponent(q)}`);
    setUsers(data.users);
  }

  if (!profile) return <main><p>Chargement...</p></main>;

  return (
    <main>
      <section className="hero profile">
        {profile.user.avatarUrl && <img className="avatar" src={profile.user.avatarUrl} alt={profile.user.displayName} />}
        <div>
          <h1>{profile.user.displayName}</h1>
          <p>{profile.user.bio ?? 'Aucune biographie.'}</p>
          {profile.user.website && <a href={profile.user.website}>Site web</a>}
          <p>{profile.stats.followersCount} abonné(s) · {profile.stats.followingCount} abonnement(s)</p>
          {user && user.id !== profile.user.id && <button onClick={follow}>Suivre / Ne plus suivre</button>}
        </div>
      </section>

      <section className="panel">
        <h2>Rechercher des utilisateurs</h2>
        <div className="inline-form">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou email" />
          <button onClick={searchUsers}>Chercher</button>
        </div>
        <div className="chips">{users.map((user) => <a key={user.id} href={`/users/${user.id}`}>{user.displayName}</a>)}</div>
      </section>

      <section className="panel">
        <h2>Abonnés / abonnements</h2>
        <h3>Abonnés</h3>
        <div className="chips">{(profile.followers ?? []).map((item: any) => <a key={item.id} href={`/users/${item.id}`}>{item.displayName}</a>)}</div>
        <h3>Abonnements</h3>
        <div className="chips">{(profile.following ?? []).map((item: any) => <a key={item.id} href={`/users/${item.id}`}>{item.displayName}</a>)}</div>
      </section>

      <section className="panel">
        <h2>Critiques récentes</h2>
        {profile.reviews.map((review: any) => (
          <article className="review-card" key={review.id}>
            <strong>{review.media.title}</strong> · {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            <p>{review.content}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Listes publiques</h2>
        {profile.publicLists.map((list: any) => (
          <div key={list.id}>
            <h3>{list.title}</h3>
            <div className="grid small">
              {list.items.map((item: any) => <MediaCard key={item.id} media={{ ...item.media, tmdbId: item.media.tmdbId, posterUrl: item.media.posterUrl }} />)}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
