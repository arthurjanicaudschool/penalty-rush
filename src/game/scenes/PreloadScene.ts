import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { DISPLAY_FONT } from '../../ui/theme';
import { enableHighDpi } from '../../ui/highDpi';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }
  create(): void {
    enableHighDpi(this);
    this.cameras.main.setBackgroundColor(COLORS.ink);
    const halo = this.add.circle(195, 422, 86, COLORS.cyan, 0.04).setStrokeStyle(1, COLORS.cyan, 0.12);
    this.add.text(195, 385, 'PENALTY', { fontFamily: DISPLAY_FONT, fontSize: '46px', fontStyle: 'bold italic', color: '#f7fbff' }).setOrigin(0.5);
    this.add.text(195, 433, 'RUSH', { fontFamily: DISPLAY_FONT, fontSize: '61px', fontStyle: 'bold italic', color: '#caff38' }).setOrigin(0.5);
    this.tweens.add({ targets: halo, scale: 1.15, alpha: 0, duration: 420 });
    this.time.delayedCall(380, () => this.scene.start('HomeScene'));
  }
}
