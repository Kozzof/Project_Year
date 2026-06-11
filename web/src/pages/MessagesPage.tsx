import { useState } from 'react';
import { api } from '../api/client';

export function MessagesPage() {
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  async function load() {
    if (!userId) return;
    try {
      setError('');
      const data = await api<{ messages: any[] }>(`/messages/${userId}`);
      setMessages(data.messages);
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    await api(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) });
    setContent('');
    load();
  }

  return (
    <main>
      <section className="hero"><h1>Messagerie privée</h1><p>Chat simple entre deux utilisateurs qui se suivent mutuellement.</p></section>
      <section className="panel">
        <div className="inline-form">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ID de l’utilisateur" />
          <button onClick={load}>Ouvrir</button>
        </div>
        {error && <p className="error">{error}</p>}
      </section>
      <section className="panel">
        {messages.map((message) => <article className="activity" key={message.id}><strong>{message.sender.displayName}</strong><p>{message.content}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article>)}
        <form className="inline-form" onSubmit={send}>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message" />
          <button>Envoyer</button>
        </form>
      </section>
    </main>
  );
}
