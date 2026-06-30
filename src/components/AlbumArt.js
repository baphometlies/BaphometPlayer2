// src/components/AlbumArt.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../utils/colors';
import { getInitials } from '../utils/helpers';

export default function AlbumArt({ song, size = 56, style }) {
  const letters = getInitials(song?.title || 'BA');

  if (song?.artwork) {
    return (
      <Image
        source={{ uri: song.artwork }}
        style={[styles.art, { width: size, height: size, borderRadius: size * 0.1 }, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.art, { width: size, height: size, borderRadius: size * 0.1 }, style]}>
      {/* Pentagram SVG-like decoration via borders */}
      <View style={styles.pentaBg} />
      <Text style={[styles.letters, { fontSize: size / 3.5 }]}>{letters}</Text>
      {song?.genre ? (
        <Text style={[styles.genre, { fontSize: size / 7 }]}>{song.genre}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.scarlet + '44',
    overflow: 'hidden',
  },
  pentaBg: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderWidth: 1,
    borderColor: Colors.scarlet + '15',
    transform: [{ rotate: '36deg' }],
  },
  letters: {
    color: Colors.scarletL,
    fontWeight: '900',
    letterSpacing: 3,
  },
  genre: {
    color: Colors.text2,
    marginTop: 2,
    letterSpacing: 1,
  },
});
