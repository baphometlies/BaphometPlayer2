// src/screens/PlayerScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import TrackPlayer, {
  usePlaybackState, useProgress, State,
  RepeatMode,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../utils/colors';
import { formatTime } from '../utils/helpers';
import AlbumArt from '../components/AlbumArt';

const EQ_PRESETS = {
  Flat:  [0, 0, 0, 0, 0, 0],
  Rock:  [2, 4, 1, -1, 2, 3],
  Metal: [3, 5, 2, -2, 3, 4],
  Bass:  [5, 6, 3, 0, -1, -1],
  Vocal: [-2, -1, 2, 4, 3, 2],
};
const EQ_LABELS = ['SUB', 'BASS', 'LOW', 'MID', 'HIGH', 'AIR'];

export default function PlayerScreen({ route, navigation }) {
  const { track } = route.params || {};
  const { state } = usePlaybackState();
  const { position, duration } = useProgress();
  const isPlaying = state === State.Playing;
  const [repeat, setRepeat] = useState(0); // 0=off 1=all 2=one
  const [shuffle, setShuffle] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [eqBands, setEqBands] = useState([0, 0, 0, 0, 0, 0]);
  const [liked, setLiked] = useState(false);

  const progress = duration > 0 ? position / duration : 0;

  const cycleRepeat = async () => {
    const next = (repeat + 1) % 3;
    setRepeat(next);
    if (next === 0) await TrackPlayer.setRepeatMode(RepeatMode.Off);
    else if (next === 1) await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    else await TrackPlayer.setRepeatMode(RepeatMode.Track);
  };

  const toggleShuffle = async () => {
    const next = !shuffle;
    setShuffle(next);
    // react-native-track-player v4 shuffle via queue reorder
  };

  const seekTo = async (val) => {
    await TrackPlayer.seekTo(val * duration);
  };

  const REPEAT_ICONS = ['🔁', '🔁', '🔂'];
  const REPEAT_COLORS = [Colors.text2, Colors.scarletG, Colors.scarletG];

  return (
    <LinearGradient
      colors={[Colors.scarlet + '33', Colors.black, Colors.black]}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerLabel}>TOCANDO AGORA</Text>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.moreIcon}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Album Art */}
          <View style={styles.artContainer}>
            <AlbumArt song={track} size={260} style={styles.art} />
          </View>

          {/* Waveform bars (decorative) */}
          <View style={styles.waveform}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={[
                styles.waveBar,
                {
                  height: isPlaying ? (6 + Math.abs(Math.sin(i * 0.7)) * 20) : 4,
                  opacity: isPlaying ? 0.9 : 0.3,
                },
              ]} />
            ))}
          </View>

          {/* Song Info + Like */}
          <View style={styles.infoRow}>
            <View style={styles.infoText}>
              <Text style={styles.title} numberOfLines={1}>
                {track?.title || 'Desconhecido'}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {track?.artist || 'Artista desconhecido'} · {track?.album || ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setLiked(l => !l)} style={styles.iconBtn}>
              <Text style={[styles.likeIcon, liked && { color: Colors.scarletG }]}>
                {liked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressBlock}>
            <Slider
              style={styles.slider}
              value={progress}
              onSlidingComplete={seekTo}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor={Colors.scarletG}
              maximumTrackTintColor={Colors.surface3}
              thumbTintColor={Colors.scarletG}
            />
            <View style={styles.timeRow}>
              <Text style={styles.time}>{formatTime(position)}</Text>
              <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleShuffle} style={styles.iconBtn}>
              <Text style={[styles.ctrlIcon, shuffle && { color: Colors.scarletG }]}>⤮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => TrackPlayer.skipToPrevious()}
              style={styles.iconBtn}>
              <Text style={styles.ctrlIconLg}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => isPlaying ? TrackPlayer.pause() : TrackPlayer.play()}
              style={styles.playBtn}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => TrackPlayer.skipToNext()}
              style={styles.iconBtn}>
              <Text style={styles.ctrlIconLg}>⏭</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cycleRepeat} style={styles.iconBtn}>
              <Text style={[styles.ctrlIcon, { color: REPEAT_COLORS[repeat] }]}>
                {REPEAT_ICONS[repeat]}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Volume */}
          <View style={styles.volumeRow}>
            <Text style={styles.volIcon}>🔈</Text>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={0.8}
              onValueChange={v => TrackPlayer.setVolume(v)}
              minimumTrackTintColor={Colors.scarlet}
              maximumTrackTintColor={Colors.surface3}
              thumbTintColor={Colors.scarlet}
            />
            <Text style={styles.volIcon}>🔊</Text>
          </View>

          {/* EQ Toggle */}
          <TouchableOpacity
            onPress={() => setShowEQ(e => !e)}
            style={[styles.eqToggle, showEQ && styles.eqToggleActive]}>
            <Text style={[styles.eqToggleText, showEQ && { color: Colors.scarletG }]}>
              🎛 Equalizador
            </Text>
          </TouchableOpacity>

          {/* EQ Bands */}
          {showEQ && (
            <View style={styles.eqContainer}>
              <View style={styles.eqBands}>
                {eqBands.map((val, i) => (
                  <View key={i} style={styles.eqBand}>
                    <Text style={styles.eqVal}>
                      {val > 0 ? '+' : ''}{Math.round(val)}
                    </Text>
                    <Slider
                      style={styles.eqSlider}
                      value={val}
                      minimumValue={-12}
                      maximumValue={12}
                      onValueChange={v => {
                        const next = [...eqBands];
                        next[i] = v;
                        setEqBands(next);
                      }}
                      minimumTrackTintColor={Colors.scarletG}
                      maximumTrackTintColor={Colors.surface3}
                      thumbTintColor={Colors.scarletG}
                      vertical
                    />
                    <Text style={styles.eqLabel}>{EQ_LABELS[i]}</Text>
                  </View>
                ))}
              </View>
              {/* Presets */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
                {Object.entries(EQ_PRESETS).map(([name, vals]) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setEqBands(vals)}
                    style={styles.presetBtn}>
                    <Text style={styles.presetText}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLabel: {
    color: Colors.text2,
    fontSize: 11,
    letterSpacing: 4,
  },
  backIcon: { color: Colors.text1, fontSize: 36, lineHeight: 36 },
  moreIcon: { color: Colors.text1, fontSize: 22 },
  artContainer: { alignItems: 'center', marginBottom: 16 },
  art: {
    shadowColor: Colors.scarlet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    height: 28,
    marginBottom: 16,
  },
  waveBar: {
    width: 3,
    backgroundColor: Colors.scarletG,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: { flex: 1 },
  title: {
    color: Colors.text1,
    fontSize: 22,
    fontWeight: '700',
  },
  artist: {
    color: Colors.text2,
    fontSize: 14,
    marginTop: 4,
  },
  likeIcon: { color: Colors.text2, fontSize: 28 },
  progressBlock: { marginBottom: 20 },
  slider: { width: '100%', height: 36 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  time: { color: Colors.text2, fontSize: 11 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: { padding: 8 },
  ctrlIcon: { color: Colors.text2, fontSize: 22 },
  ctrlIconLg: { color: Colors.text1, fontSize: 28 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.scarlet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.scarlet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
  },
  playIcon: { color: Colors.text1, fontSize: 28 },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  volumeSlider: { flex: 1, height: 36 },
  volIcon: { fontSize: 16 },
  eqToggle: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.surface3,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  eqToggleActive: { borderColor: Colors.scarlet },
  eqToggleText: { color: Colors.text2, fontSize: 14 },
  eqContainer: {
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.scarlet + '33',
  },
  eqBands: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 12,
  },
  eqBand: { alignItems: 'center', gap: 4 },
  eqSlider: { width: 80, height: 100, transform: [{ rotate: '-90deg' }] },
  eqVal: { color: Colors.text2, fontSize: 10 },
  eqLabel: { color: Colors.text2, fontSize: 10 },
  presets: { flexDirection: 'row' },
  presetBtn: {
    backgroundColor: Colors.scarlet + '22',
    borderWidth: 1,
    borderColor: Colors.scarlet + '44',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  presetText: { color: Colors.text2, fontSize: 12 },
});
