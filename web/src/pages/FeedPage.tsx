import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function label(activity: any) {
  if (activity.type === 'REVIEW_CREATED') return `a publié une critique de ${activity.media?.title ?? 'une œuvre'}`;
  if (activity.type === 'MEDIA_ADDED_TO_COLLECTION') return `a ajouté ${activity.media?.title ?? 'une œuvre'} à sa bibliothèque`;
  if (activity.type === 'LIST_CREATED') return 'a créé une liste';
  if (activity.type === 'FOLLOW_CREATED') return 'suit un nouveau profil';
  return 'a publié une activité';
}

export function FeedPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) api<{ activities: any[] }>('/feed').then((data) => setActivities(data.activities)).catch(() => setActivities([]));
  }, [user]);

  return (
    <main>
      <section className="hero">
        <h1>Le réseau social des cinéphiles</h1>
        <p>Découvrez, notez, organisez et échangez autour de vos films et séries.</p>
        {!user && <Link className="button" to="/login">Créer un compte</Link>}
      </section>
      <section className="panel">
        <h2>Fil d’actualité</h2>
        {!user && <p>Connectez-vous pour voir les activités des personnes suivies. La recherche reste accessible sans compte.</p>}
        {user && activities.length === 0 && <p>Suivez d’autres utilisateurs pour alimenter votre fil.</p>}
        {activities.map((activity) => (
          <article key={activity.id} className="activity">
            <strong>{activity.actor.displayName}</strong> {label(activity)}
            <small>{new Date(activity.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
