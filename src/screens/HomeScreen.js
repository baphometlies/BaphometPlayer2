// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import * as MediaLibrary from 'react-native-media-library';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import { Colors } from '../utils/colors';
import { formatTime } from '../utils/helpers';
import AlbumArt from '../components/AlbumArt';
import MiniPlayer from '../components/MiniPlayer';

export default function HomeScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(new Set());
  const currentTrack = useActiveTrack();

  // ── Pede permissão e carrega músicas do celular ───────────────
  const loadSongs = useCallback(async () => {
    try {
      // Android 13+ usa READ_MEDIA_AUDIO; abaixo usa READ_EXTERNAL_STORAGE
      const perm = parseInt(Platform?.Version, 10) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await request(perm);
      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Permissão necessária',
          'O BAPHOMET precisa acessar suas músicas.',
          [{ text: 'OK' }],
        );
        setLoading(false);
        return;
      }

      // Busca todos os arquivos de áudio
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 2000,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const mapped = assets.map(a => ({
        id: a.id,
        url: a.uri,              // URI local — react-native-track-player suporta
        title: a.filename.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
        artist: a.albumId || 'Artista desconhecido',
        album: a.albumId || 'Álbum desconhecido',
        duration: a.duration,
        artwork: undefined,     // MediaLibrary não retorna capa; pode expandir com getAssetInfoAsync
        genre: 'Áudio',
      }));

      setSongs(mapped);
      setFiltered(mapped);
    } catch (e) {
      console.error('Erro ao carregar músicas:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSongs(); }, [loadSongs]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(songs);
    } else {
      const q = search.toLowerCase();
      setFiltered(songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q),
      ));
    }
  }, [search, songs]);

  // ── Toca uma música (adiciona toda a lista à fila) ────────────
  const playSong = async (song) => {
    try {
      await TrackPlayer.reset();
      // Coloca a música escolhida primeiro, depois o resto
      const idx = filtered.findIndex(s => s.id === song.id);
      const queue = [
        ...filtered.slice(idx),
        ...filtered.slice(0, idx),
      ];
      await TrackPlayer.add(queue);
      await TrackPlayer.play();
    } catch (e) {
      console.error('Erro ao tocar:', e);
    }
  };

  const toggleLike = (id) => {
    setLiked(l => {
      const n = new Set(l);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const shuffleAll = async () => {
    if (!songs.length) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    await TrackPlayer.reset();
    await TrackPlayer.add(shuffled);
    await TrackPlayer.play();
  };

  const renderItem = ({ item, index }) => {
    const isActive = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.songRow, isActive && styles.songRowActive]}
        onPress={() => playSong(item)}
        activeOpacity={0.7}>
        <View style={[styles.indexBox, isActive && styles.indexBoxActive]}>
          {isActive
            ? <Text style={styles.activeIcon}>♪</Text>
            : <Text style={styles.indexText}>{index + 1}</Text>}
        </View>
        <AlbumArt song={item} size={42} />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isActive && { color: Colors.scarletG }]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <View style={styles.songRight}>
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeBtn}>
            <Text style={[styles.likeIcon, liked.has(item.id) && { color: Colors.scarletG }]}>
              {liked.has(item.id) ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.duration}>{formatTime(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>⸸ BAPHOMET</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar músicas, artistas..."
          placeholderTextColor={Colors.text2}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats + Shuffle */}
      {!loading && (
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{filtered.length} MÚSICAS</Text>
          <TouchableOpacity onPress={shuffleAll} style={styles.shuffleBtn}>
            <Text style={styles.shuffleBtnText}>⤮  Embaralhar tudo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.scarletG} />
          <Text style={styles.loadingText}>Carregando músicas...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyText}>
            {search ? 'Nenhuma música encontrada.' : 'Nenhuma música no dispositivo.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Mini Player */}
      <MiniPlayer
        currentTrack={currentTrack}
        onPress={() => navigation.navigate('Player', { track: currentTrack })}
      />
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
  logo: {
    color: Colors.scarletG,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  settingsIcon: { color: Colors.text2, fontSize: 22 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 24,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: Colors.text1,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearIcon: { color: Colors.text2, fontSize: 16 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statsText: { color: Colors.text2, fontSize: 11, letterSpacing: 3 },
  shuffleBtn: {
    backgroundColor: Colors.scarlet + '22',
    borderWidth: 1,
    borderColor: Colors.scarlet + '66',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  shuffleBtnText: { color: Colors.scarletG, fontSize: 12 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.text2, fontSize: 14 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.text2, fontSize: 15, textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface2,
  },
  songRowActive: {
    backgroundColor: Colors.scarlet + '11',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  indexBox: {
    width: 30,
    alignItems: 'center',
  },
  indexBoxActive: {},
  indexText: { color: Colors.text2, fontSize: 13 },
  activeIcon: { color: Colors.scarletG, fontSize: 16 },
  songInfo: { flex: 1 },
  songTitle: { color: Colors.text1, fontSize: 14, fontWeight: '600' },
  songArtist: { color: Colors.text2, fontSize: 12, marginTop: 2 },
  songRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  likeBtn: { padding: 4 },
  likeIcon: { color: Colors.text2, fontSize: 20 },
  duration: { color: Colors.text2, fontSize: 12 },
});
