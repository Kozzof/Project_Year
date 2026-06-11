import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function SettingsScreen() {
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [exportPreview, setExportPreview] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<any>('/auth/me').then((data) => {
      setDisplayName(data.user.displayName ?? '');
      setAvatarUrl(data.user.avatarUrl ?? '');
      setBio(data.user.bio ?? '');
      setWebsite(data.user.website ?? '');
      setTheme(data.user.theme ?? 'dark');
      setLanguage(data.user.language ?? 'fr');
    }).catch(() => undefined);
  }, []);

  async function save() {
    await api('/users/me', { method: 'PATCH', body: JSON.stringify({ displayName, avatarUrl: avatarUrl || null, bio: bio || null, website: website || null, theme, language }) });
    setMessage('Profil mis à jour.');
  }

  async function exportData() {
    const data = await api<any>('/users/me/export?format=json');
    setExportPreview(JSON.stringify(data, null, 2).slice(0, 800));
  }

  return (
    <Screen title="Paramètres">
      <View style={styles.card}>
        <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Nom public" placeholderTextColor="#94a3b8" />
        <TextInput style={styles.input} value={avatarUrl} onChangeText={setAvatarUrl} placeholder="Avatar URL" placeholderTextColor="#94a3b8" />
        <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder="Biographie" placeholderTextColor="#94a3b8" multiline />
        <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="Site web" placeholderTextColor="#94a3b8" />
        <View style={styles.row}>
          <Pressable style={styles.secondary} onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Text style={styles.buttonText}>{theme}</Text></Pressable>
          <Pressable style={styles.secondary} onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')}><Text style={styles.buttonText}>{language}</Text></Pressable>
        </View>
        <Pressable style={styles.button} onPress={save}><Text style={styles.darkText}>Enregistrer</Text></Pressable>
        {message ? <Text style={styles.meta}>{message}</Text> : null}
      </View>
      <View style={styles.card}>
        <Pressable style={styles.button} onPress={exportData}><Text style={styles.darkText}>Prévisualiser export JSON</Text></Pressable>
        {exportPreview ? <Text style={styles.preview}>{exportPreview}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 12, gap: 10 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 12 },
  row: { flexDirection: 'row', gap: 8 },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 999, alignItems: 'center' },
  secondary: { backgroundColor: '#334155', padding: 12, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: '#e2e8f0', fontWeight: '800' },
  darkText: { color: '#082f49', fontWeight: '900' },
  meta: { color: '#cbd5e1' },
  preview: { color: '#cbd5e1', fontFamily: 'monospace' }
});
