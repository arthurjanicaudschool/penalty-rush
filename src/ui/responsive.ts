import Phaser from 'phaser';

export const fadeIn = (scene: Phaser.Scene, targets: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[], delay = 0): void => {
  const list = Array.isArray(targets) ? targets : [targets];
  list.forEach((target) => (target as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0));
  scene.tweens.add({ targets: list, alpha: 1, y: '+=8', duration: 260, delay, ease: 'Cubic.Out' });
};

export const formatScore = (score: number): string => new Intl.NumberFormat('fr-FR').format(score);
