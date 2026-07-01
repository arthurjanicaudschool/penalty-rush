import Phaser from 'phaser';

export class Goal extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.25).fillPoints([
      new Phaser.Geom.Point(40, 397), new Phaser.Geom.Point(350, 397), new Phaser.Geom.Point(320, 425), new Phaser.Geom.Point(70, 425)
    ], true);
    const net = scene.add.graphics();
    net.fillStyle(0x35e8ff, 0.035).fillRect(49, 218, 292, 180).lineStyle(1.2, 0xdff7e9, 0.2);
    for (let x = 54; x <= 340; x += 24) net.lineBetween(x, 220, 195 + (x - 195) * 0.82, 398);
    for (let y = 237; y < 398; y += 20) net.lineBetween(49, y, 341, y);
    const frameGlow = scene.add.graphics().lineStyle(17, 0x35e8ff, 0.09).lineBetween(48, 398, 48, 215).lineBetween(48, 215, 342, 215).lineBetween(342, 215, 342, 398);
    const frame = scene.add.graphics().lineStyle(8, 0xf7fbff, 1).lineBetween(48, 398, 48, 215).lineBetween(48, 215, 342, 215).lineBetween(342, 215, 342, 398);
    frame.lineStyle(2, 0xbdebf2, 0.8).lineBetween(53, 223, 337, 223);
    this.add([shadow, net, frameGlow, frame]);
    scene.add.existing(this);
  }
}
