// src/screens/PlaylistsScreen.js
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../utils/colors';

const STORAGE_KEY = '@baphomet_playlists';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Carrega playlists salvas
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setPlaylists(JSON.parse(data));
    });
  }, []);

  const save = async (list) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const createPlaylist = async () => {
    if (!newName.trim()) return;
    const next = [
      ...playlists,
      { id: Date.now().toString(), name: newName.trim(), songs: [] },
    ];
    setPlaylists(next);
    await save(next);
    setNewName('');
    setCreating(false);
  };

  const deletePlaylist = (id) => {
    Alert.alert('Apagar playlist', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar', style: 'destructive',
        onPress: async () => {
          const next = playlists.filter(p => p.id !== id);
          setPlaylists(next);
          await save(next);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>♪</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.count}>{item.songs.length} músicas</Text>
      </View>
      <TouchableOpacity onPress={() => deletePlaylist(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>⸸ BAPHOMET</Text>
        <TouchableOpacity onPress={() => setCreating(c => !c)} style={styles.addBtn}>
          <Text style={styles.addText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {creating && (
        <View style={styles.createBox}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Nome da playlist..."
            placeholderTextColor={Colors.text2}
            style={styles.input}
            autoFocus
          />
          <View style={styles.createBtns}>
            <TouchableOpacity onPress={createPlaylist} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Criar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreating(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhuma playlist ainda.{'\n'}Crie uma acima.</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.scarlet + '22',
  },
  logo: { color: Colors.scarletG, fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  addBtn: {
    backgroundColor: Colors.scarlet + '22',
    borderWidth: 1,
    borderColor: Colors.scarlet + '66',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  addText: { color: Colors.scarletG, fontSize: 13 },
  createBox: {
    margin: 16,
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.scarlet + '44',
    gap: 10,
  },
  input: {
    backgroundColor: Colors.surface3,
    borderRadius: 6,
    padding: 10,
    color: Colors.text1,
    fontSize: 14,
  },
  createBtns: { flexDirection: 'row', gap: 8 },
  confirmBtn: {
    flex: 1, backgroundColor: Colors.scarlet, borderRadius: 6,
    padding: 10, alignItems: 'center',
  },
  confirmText: { color: Colors.text1, fontWeight: '600' },
  cancelBtn: {
    flex: 1, backgroundColor: Colors.surface3, borderRadius: 6,
    padding: 10, alignItems: 'center',
  },
  cancelText: { color: Colors.text2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.text2, textAlign: 'center', fontSize: 15, lineHeight: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  icon: {
    width: 46, height: 46, borderRadius: 8,
    backgroundColor: Colors.scarlet,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { color: Colors.text1, fontSize: 22 },
  info: { flex: 1 },
  name: { color: Colors.text1, fontSize: 15, fontWeight: '700' },
  count: { color: Colors.text2, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteText: { color: Colors.text2, fontSize: 16 },
});
