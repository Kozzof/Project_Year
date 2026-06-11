import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, displayName);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function githubLogin() {
    try {
      const data = await api<{ url: string }>('/auth/oauth/github/url');
      window.location.href = data.url;
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="panel narrow">
        <h1>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
        <form onSubmit={submit} className="stack">
          {mode === 'register' && <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nom public" />}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" type="password" />
          {error && <p className="error">{error}</p>}
          <button>{mode === 'login' ? 'Se connecter' : 'S’inscrire'}</button>
        </form>
        <button className="secondary" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}
        </button>
        <button className="secondary" onClick={githubLogin}>Continuer avec GitHub</button>
      </section>
    </main>
  );
}
