import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function AdminPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api<{ reports: any[] }>('/admin/reports');
      setReports(data.reports);
    } catch (error: any) {
      setError(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await api(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  async function highlight(reviewId: string, highlighted: boolean) {
    await api(`/admin/reviews/${reviewId}/highlight`, { method: 'PATCH', body: JSON.stringify({ highlighted }) });
    load();
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Supprimer cette critique ?')) return;
    await api(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
    load();
  }

  async function banUser(userId: string) {
    if (!confirm('Bannir cet utilisateur ?')) return;
    await api(`/admin/users/${userId}/ban`, { method: 'PATCH', body: JSON.stringify({ banned: true }) });
    load();
  }

  return (
    <main>
      <section className="hero"><h1>Modération</h1><p>Gestion des signalements, coups de cœur et contenus inappropriés.</p></section>
      {error && <p className="error">{error}</p>}
      <section className="stack">
        {reports.map((report) => (
          <article key={report.id} className="panel">
            <h2>{report.review.media.title}</h2>
            <p><strong>Signalé par :</strong> {report.reporter.displayName}</p>
            <p><strong>Raison :</strong> {report.reason}</p>
            <p>{report.review.content}</p>
            <div className="actions">
              <button onClick={() => highlight(report.reviewId, true)}>Mettre en avant</button>
              <button className="danger" onClick={() => deleteReview(report.reviewId)}>Supprimer la critique</button>
              <button className="danger" onClick={() => banUser(report.review.user.id)}>Bannir l’auteur</button>
              <button onClick={() => setStatus(report.id, 'RESOLVED')}>Résolu</button>
              <button onClick={() => setStatus(report.id, 'REJECTED')}>Rejeter</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
