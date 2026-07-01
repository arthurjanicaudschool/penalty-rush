import Phaser from 'phaser';
import { COLORS } from '../game/config/gameConfig';
import { BODY_FONT } from './theme';

export const createPanel = (scene: Phaser.Scene, x: number, y: number, width: number, height: number, alpha = 0.96): Phaser.GameObjects.Rectangle =>
  scene.add.rectangle(x, y, width, height, COLORS.surface, alpha).setStrokeStyle(1, 0xffffff, 0.11);

export const addPill = (scene: Phaser.Scene, x: number, y: number, text: string, color: number = COLORS.mint): Phaser.GameObjects.Container => {
  const label = scene.add.text(0, 0, text.toUpperCase(), { fontFamily: BODY_FONT, fontSize: '11px', fontStyle: 'bold', color: '#07110c', letterSpacing: 0.8 }).setOrigin(0.5);
  const bg = scene.add.rectangle(0, 0, label.width + 22, 30, color).setStrokeStyle(0);
  return scene.add.container(x, y, [bg, label]);
};
