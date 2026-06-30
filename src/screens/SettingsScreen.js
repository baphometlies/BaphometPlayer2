// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../utils/colors';

export default function SettingsScreen({ navigation }) {
  const [shuffle, setShuffle] = useState(false);
  const [crossfade, setCrossfade] = useState(false);
  const [stopOnCall, setStopOnCall] = useState(true);
  const [showNotif, setShowNotif] = useState(true);

  const Row = ({ label, value, onToggle }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surface3, true: Colors.scarlet }}
        thumbColor={value ? Colors.scarletG : Colors.text2}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>REPRODUÇÃO</Text>
        <Row label="Sempre embaralhar" value={shuffle} onToggle={setShuffle} />
        <Row label="Crossfade entre músicas" value={crossfade} onToggle={setCrossfade} />
        <Row label="Pausar durante chamadas" value={stopOnCall} onToggle={setStopOnCall} />
        <Row label="Notificação de reprodução" value={showNotif} onToggle={setShowNotif} />

        <View style={styles.about}>
          <Text style={styles.aboutLogo}>⸸ BAPHOMET PLAYER</Text>
          <Text style={styles.aboutSub}>Baseado no Muzio MP3 Player</Text>
          <Text style={styles.aboutVersion}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.scarlet + '22',
  },
  back: { width: 40 },
  backText: { color: Colors.text1, fontSize: 36, lineHeight: 36 },
  title: { color: Colors.text1, fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  content: { padding: 20, gap: 0 },
  section: { color: Colors.text2, fontSize: 11, letterSpacing: 3, marginBottom: 12, marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface2,
  },
  rowLabel: { color: Colors.text1, fontSize: 15 },
  about: { alignItems: 'center', marginTop: 48, gap: 8 },
  aboutLogo: {
    color: Colors.scarletG, fontSize: 20, fontWeight: '900',
    letterSpacing: 4,
  },
  aboutSub: { color: Colors.text2, fontSize: 13 },
  aboutVersion: { color: Colors.surface3, fontSize: 12 },
});
