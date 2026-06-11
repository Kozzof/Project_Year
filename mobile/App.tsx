import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, getToken, setToken } from './src/api/client';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { ListsScreen } from './src/screens/ListsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MediaDetailScreen } from './src/screens/MediaDetailScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Tab = 'home' | 'search' | 'library' | 'lists' | 'profiles' | 'messages' | 'notifications' | 'settings' | 'login';

export default function App() {
  const [tab, setTab] = useState<Tab>('search');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [media, setMedia] = useState<{ type: string; tmdbId: number } | null>(null);

  async function checkSession() {
    const token = await getToken();
    if (!token) {
      setLoggedIn(false);
      setUser(null);
      return;
    }
    try {
      const data = await api<{ user: any }>('/auth/me');
      setLoggedIn(true);
      setUser(data.user);
    } catch {
      await setToken(null);
      setLoggedIn(false);
      setUser(null);
    }
  }

  useEffect(() => { checkSession(); }, []);

  function openMedia(type: string, tmdbId: number) {
    setMedia({ type, tmdbId });
  }

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    await setToken(null);
    setLoggedIn(false);
    setUser(null);
    setMedia(null);
    setTab('search');
  }

  const requireLogin = (next: JSX.Element) => loggedIn ? next : <LoginScreen onLoggedIn={() => { checkSession(); setTab('search'); }} />;

  let screen = <SearchScreen openMedia={openMedia} />;
  if (media) screen = <MediaDetailScreen type={media.type} tmdbId={media.tmdbId} currentUser={user} />;
  else if (tab === 'home') screen = requireLogin(<HomeScreen />);
  else if (tab === 'library') screen = requireLogin(<LibraryScreen openMedia={openMedia} />);
  else if (tab === 'lists') screen = requireLogin(<ListsScreen />);
  else if (tab === 'profiles') screen = <ProfileScreen />;
  else if (tab === 'messages') screen = requireLogin(<MessagesScreen />);
  else if (tab === 'notifications') screen = requireLogin(<NotificationsScreen />);
  else if (tab === 'settings') screen = requireLogin(<SettingsScreen />);
  else if (tab === 'login') screen = <LoginScreen onLoggedIn={() => { checkSession(); setTab('search'); }} />;

  return (
    <View style={styles.app}>
      {screen}
      <View style={styles.tabbar}>
        {media && <Pressable style={styles.tab} onPress={() => setMedia(null)}><Text style={styles.tabText}>Retour</Text></Pressable>}
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('home'); }}><Text style={styles.tabText}>Accueil</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('search'); }}><Text style={styles.tabText}>Recherche</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('library'); }}><Text style={styles.tabText}>Biblio</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('lists'); }}><Text style={styles.tabText}>Listes</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('profiles'); }}><Text style={styles.tabText}>Profils</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('messages'); }}><Text style={styles.tabText}>Msg</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('notifications'); }}><Text style={styles.tabText}>Notif</Text></Pressable>
        <Pressable style={styles.tab} onPress={() => { setMedia(null); setTab('settings'); }}><Text style={styles.tabText}>Compte</Text></Pressable>
        <Pressable style={styles.tab} onPress={loggedIn ? logout : () => { setMedia(null); setTab('login'); }}><Text style={styles.tabText}>{loggedIn ? 'Quitter' : 'Login'}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#0f172a' },
  tabbar: { position: 'absolute', left: 8, right: 8, bottom: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#020617', borderRadius: 24, padding: 6, gap: 2 },
  tab: { paddingVertical: 8, paddingHorizontal: 6 },
  tabText: { color: '#e2e8f0', fontWeight: '800', fontSize: 11 }
});
