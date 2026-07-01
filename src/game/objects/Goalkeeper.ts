import Phaser from 'phaser';

export class Goalkeeper extends Phaser.GameObjects.Container {
  private leftArm: Phaser.GameObjects.Container;
  private rightArm: Phaser.GameObjects.Container;

  private jerseyColor: number;
  private accentColor: number;

  constructor(scene: Phaser.Scene, x: number, y: number, jerseyColor = 0xff4967, accentColor = 0xffffff) {
    super(scene, x, y);
    this.jerseyColor = jerseyColor; this.accentColor = accentColor;
    const shadow = scene.add.ellipse(0, 59, 74, 17, 0x000000, 0.35);
    const leftLeg = this.makeLimb(-10, 34, 13, 40, 0x101b24);
    const rightLeg = this.makeLimb(10, 34, 13, 40, 0x101b24);
    const leftBoot = scene.add.ellipse(-14, 55, 22, 10, 0x05080d);
    const rightBoot = scene.add.ellipse(14, 55, 22, 10, 0x05080d);
    const torso = scene.add.graphics();
    torso.fillStyle(this.jerseyColor).fillPoints([
      new Phaser.Geom.Point(-24, -12), new Phaser.Geom.Point(24, -12), new Phaser.Geom.Point(19, 31), new Phaser.Geom.Point(-19, 31)
    ], true);
    torso.lineStyle(2, this.accentColor, 0.7).lineBetween(-17, -6, 17, -6);
    torso.fillStyle(this.accentColor, 0.9).fillRect(-3, 0, 6, 18);
    const neck = scene.add.rectangle(0, -18, 10, 12, 0xb97852);
    const head = scene.add.circle(0, -33, 13, 0xc98c61).setStrokeStyle(2, 0x4d2b25);
    const hair = scene.add.arc(0, -38, 12, 195, 345, false, 0x151116);
    const eyes = scene.add.graphics().fillStyle(0x1b1720).fillCircle(-4, -32, 1.2).fillCircle(4, -32, 1.2);
    this.leftArm = this.makeArm(-22, -6, -1);
    this.rightArm = this.makeArm(22, -6, 1);
    this.add([shadow, leftLeg, rightLeg, leftBoot, rightBoot, this.leftArm, this.rightArm, torso, neck, head, hair, eyes]);
    scene.add.existing(this);
    scene.tweens.add({ targets: [this.leftArm, this.rightArm], angle: '+=3', yoyo: true, repeat: -1, duration: 650, ease: 'Sine.InOut' });
  }

  private makeLimb(x: number, y: number, width: number, height: number, color: number): Phaser.GameObjects.Rectangle {
    return this.scene.add.rectangle(x, y, width, height, color).setStrokeStyle(1, 0x3b5360);
  }

  private makeArm(x: number, y: number, direction: -1 | 1): Phaser.GameObjects.Container {
    const sleeve = this.scene.add.rectangle(direction * 13, 0, 27, 13, this.jerseyColor).setStrokeStyle(1, this.accentColor).setRotation(direction * 0.1);
    const forearm = this.scene.add.rectangle(direction * 34, direction * -1, 20, 9, 0xc98c61).setRotation(direction * -0.08);
    const glove = this.scene.add.circle(direction * 48, -2, 8, 0xcaff38).setStrokeStyle(2, 0x07110c);
    return this.scene.add.container(x, y, [sleeve, forearm, glove]);
  }

  dive(x: number, y: number): Phaser.Tweens.Tween {
    const rotation = x < 195 ? -0.42 : x > 195 ? 0.42 : 0;
    return this.scene.tweens.add({ targets: this, x, y, rotation, scaleX: x === 195 ? 1.08 : 1, duration: 310, ease: 'Cubic.Out' });
  }
}
