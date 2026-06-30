// src/components/MiniPlayer.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import TrackPlayer, { usePlaybackState, State, useProgress } from 'react-native-track-player';
import { Colors } from '../utils/colors';
import AlbumArt from './AlbumArt';

export default function MiniPlayer({ currentTrack, onPress }) {
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const isPlaying = playbackState.state === State.Playing;
  const progress = duration > 0 ? position / duration : 0;

  if (!currentTrack) return null;

  return (
    <View style={styles.wrapper}>
      {/* Thin progress bar on top */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Pressable style={styles.container} onPress={onPress}>
        <AlbumArt song={currentTrack} size={46} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()} style={styles.btn}>
            <Text style={styles.icon}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => isPlaying ? TrackPlayer.pause() : TrackPlayer.play()}
            style={styles.playBtn}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => TrackPlayer.skipToNext()} style={styles.btn}>
            <Text style={styles.icon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface + 'F5',
    borderTopWidth: 1,
    borderTopColor: Colors.scarlet + '44',
  },
  progressBg: {
    height: 2,
    backgroundColor: Colors.surface3,
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.scarletG,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.text1,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: Colors.text2,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    padding: 8,
  },
  icon: {
    color: Colors.text1,
    fontSize: 18,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.scarlet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: Colors.text1,
    fontSize: 18,
  },
});
