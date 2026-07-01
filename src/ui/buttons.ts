import Phaser from 'phaser';
import { COLORS } from '../game/config/gameConfig';
import { BODY_FONT, DISPLAY_FONT } from './theme';

export const createButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: { width?: number; primary?: boolean } = {}
): Phaser.GameObjects.Container => {
  const width = options.width ?? 310;
  const primary = options.primary ?? true;
  const shadow = scene.add.graphics().fillStyle(0x000000, 0.36).fillRoundedRect(-width / 2 + 3, -24, width, 58, 16);
  const bg = scene.add.graphics();
  bg.fillStyle(primary ? COLORS.lime : COLORS.surfaceLight, 1).fillRoundedRect(-width / 2, -29, width, 58, 16);
  bg.lineStyle(1.5, primary ? 0xffffff : COLORS.cyan, primary ? 0.18 : 0.35).strokeRoundedRect(-width / 2, -29, width, 58, 16);
  if (primary) bg.fillStyle(0xffffff, 0.22).fillRoundedRect(-width / 2 + 9, -22, width - 18, 2, 1);
  const hit = scene.add.zone(0, 0, width, 58).setInteractive({ useHandCursor: true });
  const text = scene.add.text(0, 0, label.toUpperCase(), {
    fontFamily: DISPLAY_FONT, fontSize: '21px', fontStyle: 'bold', color: primary ? '#07110c' : '#f7fbff', letterSpacing: 1.1
  }).setOrigin(0.5);
  const arrow = scene.add.text(width / 2 - 28, -1, '›', { fontFamily: BODY_FONT, fontSize: '28px', fontStyle: 'bold', color: primary ? '#07110c' : '#35e8ff' }).setOrigin(0.5);
  const container = scene.add.container(x, y, [shadow, bg, text, arrow, hit]);
  hit.on('pointerdown', () => container.setScale(0.975));
  hit.on('pointerout', () => container.setScale(1));
  hit.on('pointerup', () => { container.setScale(1); scene.tweens.add({ targets: container, scale: 1.025, yoyo: true, duration: 70, onComplete: onClick }); });
  return container;
};

export const createBackButton = (scene: Phaser.Scene, onClick: () => void): Phaser.GameObjects.Container => {
  const bg = scene.add.circle(0, 0, 24, COLORS.surfaceLight).setStrokeStyle(1, 0xffffff, 0.15).setInteractive({ useHandCursor: true });
  const arrow = scene.add.text(0, -2, '‹', { fontFamily: BODY_FONT, fontSize: '40px', color: '#f7fbff' }).setOrigin(0.5);
  const button = scene.add.container(36, 54, [bg, arrow]);
  bg.on('pointerup', onClick);
  return button;
};
