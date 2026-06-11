import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { Screen } from '../components/Screen';

export function MessagesScreen() {
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  async function load() {
    if (!userId.trim()) return;
    try {
      setError('');
      const data = await api<{ messages: any[] }>(`/messages/${userId}`);
      setMessages(data.messages);
    } catch (error: any) {
      setError(error.message);
    }
  }

  async function send() {
    if (!content.trim() || !userId.trim()) return;
    await api(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) });
    setContent('');
    load();
  }

  return (
    <Screen title="Messages">
      <View style={styles.card}>
        <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="ID utilisateur" placeholderTextColor="#94a3b8" />
        <Pressable style={styles.button} onPress={load}><Text style={styles.darkText}>Ouvrir</Text></Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.card}>
        {messages.map((message) => <View key={message.id} style={styles.message}><Text style={styles.title}>{message.sender.displayName}</Text><Text style={styles.meta}>{message.content}</Text></View>)}
        <TextInput style={styles.input} value={content} onChangeText={setContent} placeholder="Message" placeholderTextColor="#94a3b8" />
        <Pressable style={styles.button} onPress={send}><Text style={styles.darkText}>Envoyer</Text></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', padding: 14, borderRadius: 16, marginBottom: 12, gap: 10 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 12 },
  button: { backgroundColor: '#38bdf8', padding: 12, borderRadius: 999, alignItems: 'center' },
  darkText: { color: '#082f49', fontWeight: '900' },
  title: { color: '#f8fafc', fontWeight: '900' },
  meta: { color: '#cbd5e1' },
  message: { borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8 },
  error: { color: '#fca5a5' }
});
