import Phaser from 'phaser';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource/barlow-condensed/latin-900.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import './style.css';
import { gameConfig } from './game/config/gameConfig';
import { setupInstallPrompt } from './pwa/installPrompt';
import { setupAppViewport } from './ui/appViewport';

setupAppViewport();
registerSW({ immediate: true });
setupInstallPrompt();
void Promise.race([
  Promise.all([
    document.fonts.load('900 48px "Barlow Condensed"'),
    document.fonts.load('700 16px "Manrope"')
  ]),
  new Promise((resolve) => window.setTimeout(resolve, 900))
]).then(() => new Phaser.Game(gameConfig));
