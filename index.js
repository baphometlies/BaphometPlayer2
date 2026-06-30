// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent(appName, () => App);

// Registra o serviço de background do player
TrackPlayer.registerPlaybackService(() =>
  require('./src/utils/trackPlayerService'),
);
