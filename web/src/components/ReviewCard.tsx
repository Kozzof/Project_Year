import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function ReviewCard({ review, onChange }: { review: any; onChange?: () => void }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(review.content ?? '');
  const [rating, setRating] = useState(review.rating ?? 5);
  const [error, setError] = useState('');

  const isOwner = user?.id === review.userId || user?.id === review.user?.id;

  async function like() {
    try {
      setError('');
      await api(`/reviews/${review.id}/like`, { method: 'POST' });
      onChange?.();
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      setError('');
      await api(`/reviews/${review.id}/comments`, { method: 'POST', body: JSON.stringify({ content: comment }) });
      setComment('');
      onChange?.();
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError('');
      await api(`/reviews/${review.id}`, { method: 'PATCH', body: JSON.stringify({ rating, content }) });
      setEditing(false);
      onChange?.();
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function deleteReview() {
    if (!confirm('Supprimer cette critique ?')) return;
    await api(`/reviews/${review.id}`, { method: 'DELETE' });
    onChange?.();
  }

  async function report() {
    const reason = prompt('Pourquoi signalez-vous cette critique ?');
    if (!reason) return;
    await api(`/reviews/${review.id}/report`, { method: 'POST', body: JSON.stringify({ reason }) });
    alert('Signalement envoyé');
  }

  async function deleteComment(commentId: string) {
    await api(`/reviews/comments/${commentId}`, { method: 'DELETE' });
    onChange?.();
  }

  return (
    <article className="review-card">
      <div className="row between">
        <strong>{review.user?.displayName ?? 'Utilisateur'}</strong>
        <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
      </div>
      {review.highlighted && <span className="tag">Coup de cœur admin</span>}
      {review.spoiler && <span className="tag warning">Spoiler</span>}
      {editing ? (
        <form className="stack" onSubmit={saveEdit}>
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
            {[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}
          </select>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="actions"><button>Enregistrer</button><button className="secondary" type="button" onClick={() => setEditing(false)}>Annuler</button></div>
        </form>
      ) : <p>{review.content}</p>}
      {error && <p className="error">{error}</p>}
      {user && <div className="actions">
        <button onClick={like}>J’aime ({review.likesCount ?? review.likes?.length ?? 0})</button>
        {!isOwner && <button className="secondary" onClick={report}>Signaler</button>}
        {isOwner && <button className="secondary" onClick={() => setEditing(true)}>Modifier</button>}
        {isOwner && <button className="danger" onClick={deleteReview}>Supprimer</button>}
      </div>}
      <div className="comments">
        {(review.comments ?? []).map((item: any) => (
          <p key={item.id}>
            <strong>{item.user?.displayName}</strong> {item.content}
            {(user?.id === item.userId || user?.role === 'ADMIN') && <button className="link-button" onClick={() => deleteComment(item.id)}>Supprimer</button>}
          </p>
        ))}
      </div>
      {user && <form className="inline-form" onSubmit={addComment}>
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Commenter..." />
        <button>Envoyer</button>
      </form>}
    </article>
  );
}
