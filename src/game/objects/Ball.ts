import Phaser from 'phaser';

export class Ball extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const glow = scene.add.circle(0, 0, 33, 0x35e8ff, 0.1);
    const shadow = scene.add.ellipse(3, 29, 58, 15, 0x000000, 0.4);
    const ball = scene.add.circle(0, 0, 24, 0xf7fbff).setStrokeStyle(3, 0xb9d1d8);
    const seams = scene.add.graphics();
    seams.fillStyle(0x0b151c).fillPoints([
      new Phaser.Geom.Point(0, -10), new Phaser.Geom.Point(10, -3), new Phaser.Geom.Point(7, 9),
      new Phaser.Geom.Point(-7, 9), new Phaser.Geom.Point(-10, -3)
    ], true);
    seams.lineStyle(2, 0x627984, 0.75);
    seams.lineBetween(0, -10, 0, -23).lineBetween(10, -3, 22, -8).lineBetween(7, 9, 15, 20).lineBetween(-7, 9, -15, 20).lineBetween(-10, -3, -22, -8);
    const shine = scene.add.ellipse(-8, -10, 8, 5, 0xffffff, 0.85).setRotation(-0.5);
    this.add([glow, shadow, ball, seams, shine]);
    scene.add.existing(this);
    scene.tweens.add({ targets: glow, scale: 1.18, alpha: 0.03, yoyo: true, repeat: -1, duration: 850, ease: 'Sine.InOut' });
  }
}
