import { useState } from 'react';
import { API_URL, api, getToken } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [bio, setBio] = useState((user as any)?.bio ?? '');
  const [website, setWebsite] = useState((user as any)?.website ?? '');
  const [theme, setTheme] = useState((user as any)?.theme ?? 'dark');
  const [language, setLanguage] = useState((user as any)?.language ?? 'fr');
  const [message, setMessage] = useState('');

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await api('/users/me', { method: 'PATCH', body: JSON.stringify({ displayName, avatarUrl: avatarUrl || null, bio: bio || null, website: website || null, theme, language }) });
    await refresh();
    setMessage('Profil mis à jour.');
  }

  async function downloadExport(format: 'json' | 'csv') {
    const response = await fetch(`${API_URL}/users/me/export?format=${format}`, { headers: { authorization: `Bearer ${getToken()}` } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supcontent-export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <section className="hero"><h1>Paramètres</h1><p>Profil public, préférences et export RGPD.</p></section>
      <section className="panel">
        <form className="stack" onSubmit={save}>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nom public" />
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="URL avatar" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Biographie" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Site web" />
          <select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="dark">Sombre</option><option value="light">Clair</option></select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="fr">Français</option><option value="en">Anglais</option></select>
          {message && <p>{message}</p>}
          <button>Enregistrer</button>
        </form>
      </section>
      <section className="panel">
        <h2>Exporter mes données</h2>
        <p>L’export contient vos œuvres notées et critiques, au format JSON ou CSV.</p>
        <div className="actions">
          <button onClick={() => downloadExport('json')}>Export JSON</button>
          <button className="secondary" onClick={() => downloadExport('csv')}>Export CSV</button>
        </div>
      </section>
    </main>
  );
}
