import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { HomeScene } from '../scenes/HomeScene';
import { CountrySelectScene } from '../scenes/CountrySelectScene';
import { PenaltyScene } from '../scenes/PenaltyScene';
import { ResultScene } from '../scenes/ResultScene';
import { LeaderboardScene } from '../scenes/LeaderboardScene';
import { SquadSelectScene } from '../scenes/SquadSelectScene';
import { RENDER_SCALE } from '../../ui/highDpi';

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH * RENDER_SCALE,
  height: GAME_HEIGHT * RENDER_SCALE,
  backgroundColor: '#05080d',
  render: { antialias: true, antialiasGL: true, pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game',
    expandParent: true
  },
  input: { activePointers: 2 },
  fps: { target: 60, smoothStep: true },
  scene: [BootScene, PreloadScene, HomeScene, CountrySelectScene, SquadSelectScene, PenaltyScene, ResultScene, LeaderboardScene]
};

export const COLORS = {
  ink: 0x05080d,
  surface: 0x0d171f,
  surfaceLight: 0x172832,
  lime: 0xcaff38,
  cyan: 0x35e8ff,
  violet: 0x755cff,
  orange: 0xff6b35,
  white: 0xf7fbff,
  mint: 0x6fffc5,
  red: 0xff4967,
  muted: 0x8aa0ad
} as const;
