// App.js
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TrackPlayer, { Capability } from 'react-native-track-player';

import HomeScreen      from './src/screens/HomeScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import PlayerScreen    from './src/screens/PlayerScreen';
import SettingsScreen  from './src/screens/SettingsScreen';
import { Colors }      from './src/utils/colors';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Inicializa o TrackPlayer ──────────────────────────────────────
async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      minBuffer: 5,
      maxBuffer: 50,
      playBuffer: 2.5,
    });
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      color: 0x8B0000, // Escarlate na notificação
    });
  } catch (e) {
    // Já configurado
    console.log('TrackPlayer já configurado');
  }
}

// ── Tema de navegação ─────────────────────────────────────────────
const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:   Colors.black,
    card:         Colors.surface,
    text:         Colors.text1,
    border:       Colors.scarlet + '33',
    primary:      Colors.scarletG,
    notification: Colors.scarletG,
  },
};

// ── Tab icons (emoji simples, sem biblioteca extra) ───────────────
const TAB_ICONS = {
  Músicas:   '🎵',
  Playlists: '📋',
};

// ── Stack que envolve Home (para abrir PlayerScreen) ──────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"     component={HomeScreen} />
      <Stack.Screen name="Player"   component={PlayerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <NavigationContainer theme={NavTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor:  Colors.scarlet + '44',
            borderTopWidth:  1,
            height: 56,
          },
          tabBarActiveTintColor:   Colors.scarletG,
          tabBarInactiveTintColor: Colors.text2,
          tabBarLabel: route.name,
          tabBarIcon: ({ focused }) => (
            <React.Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
              {TAB_ICONS[route.name]}
            </React.Text>
          ),
        })}>
        <Tab.Screen name="Músicas"   component={HomeStack} />
        <Tab.Screen name="Playlists" component={PlaylistsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
