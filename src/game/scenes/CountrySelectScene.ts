import Phaser from 'phaser';
import { COUNTRIES } from '../config/countries';
import { COLORS } from '../config/gameConfig';
import { gameState } from '../state';
import { createBackButton } from '../../ui/buttons';
import { createStadiumBackground } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { enableHighDpi } from '../../ui/highDpi';
import { createFlag } from '../../ui/flags';

export class CountrySelectScene extends Phaser.Scene {
  constructor() { super('CountrySelectScene'); }

  create(): void {
    enableHighDpi(this);
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this, { particles: false });
    this.add.rectangle(195, 420, 390, 848, COLORS.ink, 0.56).setDepth(-1);
    createBackButton(this, () => this.scene.start('HomeScene'));
    this.add.text(195, 45, 'TON ÉQUIPE', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#35e8ff', letterSpacing: 1 }).setOrigin(0.5);
    this.add.text(195, 72, 'CHOISIS TES COULEURS', { fontFamily: DISPLAY_FONT, fontSize: '32px', fontStyle: 'bold italic', color: '#f7fbff', letterSpacing: 0.2 }).setOrigin(0.5);
    this.add.text(195, 110, 'Chaque point fait grimper ta nation.', { fontFamily: BODY_FONT, fontSize: '11px', color: '#8aa0ad' }).setOrigin(0.5);

    COUNTRIES.forEach((country, index) => {
      const col = index % 2; const row = Math.floor(index / 2);
      const x = 105 + col * 180; const y = 180 + row * 116;
      const selected = country.code === gameState.country;
      const card = this.add.container(x, y);
      const glow = this.add.graphics().fillStyle(selected ? COLORS.lime : 0x000000, selected ? 0.08 : 0.22).fillRoundedRect(-80, -44, 160, 96, 16);
      const bg = this.add.graphics().fillStyle(selected ? 0x192b30 : 0x0d171f, 0.96).fillRoundedRect(-78, -48, 156, 94, 16).lineStyle(1.5, selected ? COLORS.lime : 0xffffff, selected ? 0.8 : 0.1).strokeRoundedRect(-78, -48, 156, 94, 16);
      const flag = createFlag(this, -49, -12, country.code, 50);
      const name = this.add.text(-14, -29, country.name.toUpperCase(), { fontFamily: DISPLAY_FONT, fontSize: '17px', fontStyle: 'bold', color: '#f7fbff' });
      const rank = this.add.text(-14, -5, `#${index + 1} NATION`, { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: selected ? '#caff38' : '#607681', letterSpacing: 0.45 });
      const points = this.add.text(-14, 15, `${(country.points / 1_000_000).toFixed(1)}M PTS`, { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#9aadb6' });
      const hit = this.add.zone(0, -1, 156, 94).setInteractive({ useHandCursor: true });
      card.add([glow, bg, flag, name, rank, points, hit]);
      hit.on('pointerdown', () => card.setScale(0.965));
      hit.on('pointerup', () => {
        card.setScale(1); gameState.selectCountry(country.code);
        this.tweens.add({ targets: card, scale: 1.06, duration: 100, yoyo: true });
        this.time.delayedCall(150, () => this.scene.start('SquadSelectScene'));
      });
    });
    const footer = this.add.graphics().fillStyle(0x0d171f, 0.88).fillRoundedRect(28, 770, 334, 46, 15).lineStyle(1, 0xffffff, 0.08).strokeRoundedRect(28, 770, 334, 46, 15);
    this.add.circle(50, 793, 5, COLORS.lime);
    this.add.text(65, 783, 'Le pays reste modifiable avant chaque partie', { fontFamily: BODY_FONT, fontSize: '9px', color: '#8aa0ad' });
    footer.setDepth(0);
  }
}
