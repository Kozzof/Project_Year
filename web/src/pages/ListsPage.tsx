import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MediaCard } from '../components/MediaCard';

export function ListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [addForms, setAddForms] = useState<Record<string, { tmdbId: string; type: string }>>({});

  async function load() {
    const data = await api<{ lists: any[] }>('/collections/me/lists');
    setLists(data.lists);
  }

  useEffect(() => { load(); }, []);

  async function createList(event: React.FormEvent) {
    event.preventDefault();
    await api('/collections/me/lists', { method: 'POST', body: JSON.stringify({ title, description, isPublic }) });
    setTitle('');
    setDescription('');
    setIsPublic(false);
    load();
  }

  async function updateList(id: string) {
    const form = editing[id];
    await api(`/collections/me/lists/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
    setEditing((current) => ({ ...current, [id]: undefined }));
    load();
  }

  async function deleteList(id: string) {
    if (!confirm('Supprimer cette liste ?')) return;
    await api(`/collections/me/lists/${id}`, { method: 'DELETE' });
    load();
  }

  async function addItem(id: string) {
    const form = addForms[id];
    if (!form?.tmdbId) return;
    await api(`/collections/me/lists/${id}/items`, { method: 'POST', body: JSON.stringify({ tmdbId: Number(form.tmdbId), type: form.type }) });
    setAddForms((current) => ({ ...current, [id]: { tmdbId: '', type: 'MOVIE' } }));
    load();
  }

  async function removeItem(listId: string, mediaId: string) {
    await api(`/collections/me/lists/${listId}/items/${mediaId}`, { method: 'DELETE' });
    load();
  }

  return (
    <main>
      <section className="hero"><h1>Listes personnalisées</h1><p>Créez, modifiez et partagez des sélections publiques ou privées.</p></section>
      <section className="panel">
        <form className="stack" onSubmit={createList}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Halloween, coups de cœur..." />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <label><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Publique</label>
          <button>Créer</button>
        </form>
      </section>
      <section className="stack">
        {lists.map((list) => {
          const form = editing[list.id];
          const addForm = addForms[list.id] ?? { tmdbId: '', type: 'MOVIE' };
          return <article key={list.id} className="panel">
            <div className="row between">
              <div>
                <h2>{list.title}</h2>
                <p>{list.isPublic ? 'Liste publique' : 'Liste privée'} · {list.items.length} œuvre(s)</p>
              </div>
              <div className="actions">
                <button className="secondary" onClick={() => setEditing((current) => ({ ...current, [list.id]: { title: list.title, description: list.description ?? '', isPublic: list.isPublic } }))}>Modifier</button>
                <button className="danger" onClick={() => deleteList(list.id)}>Supprimer</button>
              </div>
            </div>
            {form && <div className="stack">
              <input value={form.title} onChange={(e) => setEditing((current) => ({ ...current, [list.id]: { ...form, title: e.target.value } }))} />
              <input value={form.description ?? ''} onChange={(e) => setEditing((current) => ({ ...current, [list.id]: { ...form, description: e.target.value } }))} />
              <label><input type="checkbox" checked={form.isPublic} onChange={(e) => setEditing((current) => ({ ...current, [list.id]: { ...form, isPublic: e.target.checked } }))} /> Publique</label>
              <button onClick={() => updateList(list.id)}>Enregistrer</button>
            </div>}
            <div className="inline-form">
              <input value={addForm.tmdbId} onChange={(e) => setAddForms((current) => ({ ...current, [list.id]: { ...addForm, tmdbId: e.target.value } }))} placeholder="ID TMDB de l’œuvre" />
              <select value={addForm.type} onChange={(e) => setAddForms((current) => ({ ...current, [list.id]: { ...addForm, type: e.target.value } }))}>
                <option value="MOVIE">Film</option>
                <option value="TV">Série</option>
              </select>
              <button onClick={() => addItem(list.id)}>Ajouter</button>
            </div>
            <div className="grid small">
              {list.items.map((item: any) => <div key={item.id} className="list-item"><MediaCard media={{ ...item.media, tmdbId: item.media.tmdbId, posterUrl: item.media.posterUrl }} /><button className="secondary" onClick={() => removeItem(list.id, item.mediaId)}>Retirer</button></div>)}
            </div>
          </article>;
        })}
      </section>
    </main>
  );
}
