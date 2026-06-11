import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const data = await api<{ notifications: any[]; unreadCount: number }>('/notifications');
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 10000);
    return () => window.clearInterval(interval);
  }, []);

  async function markAll() {
    await api('/notifications/read/all', { method: 'PATCH' });
    load();
  }

  return (
    <main>
      <section className="hero"><h1>Notifications</h1><p>{unreadCount} notification(s) non lue(s).</p></section>
      <section className="panel">
        <button onClick={markAll}>Tout marquer comme lu</button>
        {notifications.map((notification) => (
          <article className={`notification ${notification.readAt ? '' : 'unread'}`} key={notification.id}>
            <strong>{notification.type}</strong>
            <p>{JSON.stringify(notification.payload)}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
