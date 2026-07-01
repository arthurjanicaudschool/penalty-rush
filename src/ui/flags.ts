import Phaser from 'phaser';

export const createFlag = (scene: Phaser.Scene, x: number, y: number, code: string, width = 46): Phaser.GameObjects.Container => {
  const height = Math.round(width * 0.66);
  const left = -width / 2; const top = -height / 2;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff).fillRoundedRect(left, top, width, height, 5);
  if (code === 'FR') {
    g.fillStyle(0x2457d6).fillRect(left, top, width / 3, height).fillStyle(0xef4055).fillRect(left + width * 2 / 3, top, width / 3, height);
  } else if (code === 'BR') {
    g.fillStyle(0x159447).fillRoundedRect(left, top, width, height, 5).fillStyle(0xffd83d).fillPoints([
      new Phaser.Geom.Point(0, top + 3), new Phaser.Geom.Point(left + width - 4, 0), new Phaser.Geom.Point(0, top + height - 3), new Phaser.Geom.Point(left + 4, 0)
    ], true).fillStyle(0x1f4aa8).fillCircle(0, 0, height * 0.2);
  } else if (code === 'AR') {
    g.fillStyle(0x71c5ea).fillRect(left, top, width, height / 3).fillRect(left, top + height * 2 / 3, width, height / 3).fillStyle(0xf6c844).fillCircle(0, 0, 3);
  } else if (code === 'PT') {
    g.fillStyle(0x16714d).fillRect(left, top, width * 0.4, height).fillStyle(0xd63d50).fillRect(left + width * 0.4, top, width * 0.6, height).fillStyle(0xf2cc45).fillCircle(left + width * 0.4, 0, 3);
  } else if (code === 'ES') {
    g.fillStyle(0xd93448).fillRect(left, top, width, height).fillStyle(0xffca43).fillRect(left, top + height * 0.25, width, height * 0.5);
  } else if (code === 'SN') {
    g.fillStyle(0x17944e).fillRect(left, top, width / 3, height).fillStyle(0xf7d63d).fillRect(left + width / 3, top, width / 3, height).fillStyle(0xd93647).fillRect(left + width * 2 / 3, top, width / 3, height).fillStyle(0x17944e).fillPoints([
      new Phaser.Geom.Point(0, -4), new Phaser.Geom.Point(1.3, -1.3), new Phaser.Geom.Point(4, -1.2), new Phaser.Geom.Point(2, 0.8), new Phaser.Geom.Point(2.5, 4), new Phaser.Geom.Point(0, 2.1), new Phaser.Geom.Point(-2.5, 4), new Phaser.Geom.Point(-2, 0.8), new Phaser.Geom.Point(-4, -1.2), new Phaser.Geom.Point(-1.3, -1.3)
    ], true);
  } else if (code === 'MA') {
    g.fillStyle(0xb72f43).fillRoundedRect(left, top, width, height, 5).lineStyle(1.5, 0x15945c).strokeCircle(0, 0, 5);
  } else if (code === 'DZ') {
    g.fillStyle(0x168653).fillRect(left, top, width / 2, height).fillStyle(0xd93647).fillCircle(1, 0, 5).fillStyle(0xffffff).fillCircle(3, -1, 4);
  } else if (code === 'JP') {
    g.fillStyle(0xe3425a).fillCircle(0, 0, height * 0.24);
  } else if (code === 'EN') {
    g.fillStyle(0xcf3349).fillRect(-3, top, 6, height).fillRect(left, -3, width, 6);
  }
  g.lineStyle(1.2, 0xffffff, 0.35).strokeRoundedRect(left, top, width, height, 5);
  const container = scene.add.container(x, y, [g]);
  return container;
};
