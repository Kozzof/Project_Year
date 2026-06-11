import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, setToken } from '../api/client';
import { Screen } from '../components/Screen';

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    try {
      setError('');
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, displayName };
      const data = await api<{ token: string }>(path, { method: 'POST', body: JSON.stringify(payload) });
      await setToken(data.token);
      onLoggedIn();
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <Screen title={mode === 'login' ? 'Connexion' : 'Inscription'}>
      <View style={styles.form}>
        {mode === 'register' && <TextInput style={styles.input} placeholderTextColor="#94a3b8" value={displayName} onChangeText={setDisplayName} placeholder="Nom public" />}
        <TextInput style={styles.input} placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Valider</Text></Pressable>
        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}><Text style={styles.link}>{mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}</Text></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 14 },
  button: { backgroundColor: '#38bdf8', padding: 14, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: '#082f49', fontWeight: '900' },
  link: { color: '#38bdf8', textAlign: 'center', padding: 8 },
  error: { color: '#fca5a5' }
});
