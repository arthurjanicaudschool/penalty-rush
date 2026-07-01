import Phaser from 'phaser';
import { COLORS } from '../game/config/gameConfig';

export const createStadiumBackground = (scene: Phaser.Scene, options: { pitch?: boolean; particles?: boolean } = {}): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0).setDepth(-50);
  const bg = scene.add.graphics();
  bg.fillGradientStyle(0x182f3a, 0x10232d, 0x060a10, 0x05080d, 1).fillRect(0, 0, 390, 844);
  bg.fillStyle(0x020407, 0.66).fillRect(0, 205, 390, 172);
  bg.fillStyle(0x172832, 0.9).fillTriangle(0, 205, 390, 205, 195, 325);
  bg.lineStyle(1, 0x6fffc5, 0.08);
  for (let y = 224; y < 360; y += 17) bg.lineBetween(0, y, 390, y);
  let seed = 17;
  for (let i = 0; i < 105; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const x = (seed / 233280) * 390;
    seed = (seed * 9301 + 49297) % 233280;
    const y = 212 + (seed / 233280) * 138;
    const colors = [0x35e8ff, 0xcaff38, 0xffffff, 0x755cff];
    bg.fillStyle(colors[i % colors.length], i % 5 === 0 ? 0.5 : 0.2).fillCircle(x, y, i % 7 === 0 ? 1.7 : 1);
  }
  bg.fillGradientStyle(0x05080d, 0x05080d, 0x0a201c, 0x0a201c, 1).fillRect(0, 358, 390, 486);
  if (options.pitch) {
    for (let i = 0; i < 7; i += 1) {
      const leftTop = 104 + i * 26;
      const rightTop = leftTop + 26;
      const leftBottom = -80 + i * 92;
      const rightBottom = leftBottom + 92;
      bg.fillStyle(i % 2 === 0 ? 0x123a2a : 0x0e3225, 0.9).fillPoints([
        new Phaser.Geom.Point(leftTop, 358), new Phaser.Geom.Point(rightTop, 358),
        new Phaser.Geom.Point(rightBottom, 844), new Phaser.Geom.Point(leftBottom, 844)
      ], true);
    }
    bg.lineStyle(2, 0xc8f5db, 0.2).lineBetween(0, 494, 390, 494);
    bg.strokeEllipse(195, 650, 330, 250);
  }
  const glow = scene.add.circle(195, 235, 175, COLORS.cyan, 0.035);
  container.add([bg, glow]);
  if (options.particles !== false) {
    for (let i = 0; i < 10; i += 1) {
      const dot = scene.add.circle(Phaser.Math.Between(18, 372), Phaser.Math.Between(90, 790), Phaser.Math.Between(1, 2), i % 2 ? COLORS.lime : COLORS.cyan, 0.22);
      scene.tweens.add({ targets: dot, y: dot.y - Phaser.Math.Between(24, 65), alpha: 0, duration: Phaser.Math.Between(2500, 4400), delay: Phaser.Math.Between(0, 2200), repeat: -1 });
      container.add(dot);
    }
  }
  return container;
};

export const createTopHud = (scene: Phaser.Scene): Phaser.GameObjects.Graphics => {
  const hud = scene.add.graphics();
  hud.fillStyle(COLORS.ink, 0.88).fillRoundedRect(14, 18, 362, 82, 22);
  hud.lineStyle(1, 0xffffff, 0.08).strokeRoundedRect(14, 18, 362, 82, 22);
  hud.lineStyle(2, COLORS.cyan, 0.45).lineBetween(34, 99, 142, 99);
  return hud;
};
