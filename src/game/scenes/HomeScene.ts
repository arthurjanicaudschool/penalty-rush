import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { ChallengeSystem } from '../systems/ChallengeSystem';
import { gameState } from '../state';
import { createButton } from '../../ui/buttons';
import { createPanel } from '../../ui/cards';
import { formatScore } from '../../ui/responsive';
import { getCountry } from '../config/countries';
import { createStadiumBackground } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { enableHighDpi } from '../../ui/highDpi';
import { createFlag } from '../../ui/flags';
import { getSafeArea } from '../../ui/safeArea';
import { requestAppFullscreen } from '../../ui/fullscreen';

export class HomeScene extends Phaser.Scene {
  private safeTop = 0;
  private safeBottom = 0;

  constructor() { super('HomeScene'); }

  create(): void {
    enableHighDpi(this);
    const safeArea = getSafeArea();
    this.safeTop = Math.min(44, safeArea.top);
    this.safeBottom = Math.min(36, safeArea.bottom);
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this);
    this.createTopBar();
    this.createHero();
    this.createStats();
    this.createActions();
    this.createLeaderboardPreview();
  }

  private createTopBar(): void {
    const yOffset = this.safeTop;
    const live = this.add.container(28, 42 + yOffset);
    const bg = this.add.graphics().fillStyle(0x0d171f, 0.92).fillRoundedRect(0, 0, 138, 34, 17).lineStyle(1, 0xffffff, 0.11).strokeRoundedRect(0, 0, 138, 34, 17);
    const dot = this.add.circle(17, 17, 5, COLORS.lime);
    const text = this.add.text(30, 9, 'SAISON MONDIALE', { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#dce8ed', letterSpacing: 0.6 });
    live.add([bg, dot, text]);
    this.tweens.add({ targets: dot, alpha: 0.25, yoyo: true, repeat: -1, duration: 720 });
    const country = getCountry(gameState.country);
    createFlag(this, 333, 59 + yOffset, country.code, 46);
  }

  private createHero(): void {
    const yOffset = Math.min(18, this.safeTop * 0.45);
    const halo = this.add.circle(195, 188 + yOffset, 104, COLORS.cyan, 0.035).setStrokeStyle(1, COLORS.cyan, 0.08);
    const ring = this.add.graphics().lineStyle(2, COLORS.lime, 0.3).arc(195, 188 + yOffset, 82, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(338));
    this.tweens.add({ targets: halo, scale: 1.12, alpha: 0.015, yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.InOut' });
    this.add.text(195, 120 + yOffset, 'PENALTY', { fontFamily: DISPLAY_FONT, fontSize: '60px', fontStyle: 'bold italic', color: '#f7fbff', letterSpacing: -1.5 }).setOrigin(0.5);
    const rush = this.add.text(195, 174 + yOffset, 'RUSH', { fontFamily: DISPLAY_FONT, fontSize: '76px', fontStyle: 'bold italic', color: '#caff38', stroke: '#07110c', strokeThickness: 3, letterSpacing: -1 }).setOrigin(0.5);
    this.add.text(195, 224 + yOffset, '5 TIRS  •  30 SECONDES  •  UN RANG', { fontFamily: BODY_FONT, fontSize: '11px', fontStyle: 'bold', color: '#9bb0ba', letterSpacing: 0.8 }).setOrigin(0.5);
    this.tweens.add({ targets: rush, y: 171 + yOffset, yoyo: true, repeat: -1, duration: 1300, ease: 'Sine.InOut' });
    ring.setAlpha(0.8);
  }

  private createStats(): void {
    createPanel(this, 195, 315, 338, 98, 0.9);
    this.add.text(45, 284, 'MEILLEUR SCORE', { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#78909c', letterSpacing: 0.7 });
    this.add.text(45, 305, formatScore(gameState.bestScore), { fontFamily: DISPLAY_FONT, fontSize: '36px', fontStyle: 'bold', color: '#f7fbff' });
    this.add.rectangle(218, 315, 1, 54, 0xffffff, 0.11);
    this.add.text(244, 284, 'RANG DU JOUR', { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#78909c', letterSpacing: 0.7 });
    this.add.text(244, 307, gameState.bestScore ? 'TOP 18%' : '—', { fontFamily: DISPLAY_FONT, fontSize: '27px', fontStyle: 'bold', color: '#35e8ff' });
    const mini = this.add.graphics().lineStyle(3, COLORS.lime, 0.9);
    mini.lineBetween(46, 349, 125, 349).lineStyle(3, COLORS.cyan, 0.9).lineBetween(125, 349, 178, 349);
  }

  private createActions(): void {
    createButton(this, 195, 414, 'Jouer maintenant', () => {
      requestAppFullscreen();
      gameState.challengeMode = false;
      this.scene.start('CountrySelectScene');
    }, { width: 338, immediate: true });
    const challenge = ChallengeSystem.getToday();
    const card = this.add.container(195, 498);
    const bg = this.add.graphics().fillStyle(0x111f29, 0.94).fillRoundedRect(-169, -31, 338, 72, 17).lineStyle(1, COLORS.violet, 0.65).strokeRoundedRect(-169, -31, 338, 72, 17);
    const bolt = this.add.graphics().fillStyle(COLORS.violet).fillPoints([new Phaser.Geom.Point(-143, -14), new Phaser.Geom.Point(-127, -14), new Phaser.Geom.Point(-135, 0), new Phaser.Geom.Point(-123, 0), new Phaser.Geom.Point(-143, 25), new Phaser.Geom.Point(-137, 7), new Phaser.Geom.Point(-149, 7)], true);
    const title = this.add.text(-110, -18, 'DÉFI DU JOUR', { fontFamily: DISPLAY_FONT, fontSize: '18px', fontStyle: 'bold', color: '#f7fbff', letterSpacing: 0.6 });
    const desc = this.add.text(-110, 6, challenge.description, { fontFamily: BODY_FONT, fontSize: '10px', color: '#9bb0ba', wordWrap: { width: 210 } });
    const arrow = this.add.text(143, 3, '›', { fontFamily: BODY_FONT, fontSize: '28px', color: '#9f8dff' }).setOrigin(0.5);
    const hit = this.add.zone(0, 5, 338, 72).setInteractive({ useHandCursor: true });
    card.add([bg, bolt, title, desc, arrow, hit]);
    hit.on('pointerdown', () => card.setScale(0.98));
    hit.on('pointerup', () => { gameState.challengeMode = true; this.scene.start('CountrySelectScene'); });
  }

  private createLeaderboardPreview(): void {
    const yOffset = -Math.min(28, this.safeBottom * 0.75);
    this.add.text(28, 573 + yOffset, 'CLASSEMENT EXPRESS', { fontFamily: DISPLAY_FONT, fontSize: '18px', fontStyle: 'bold', color: '#f7fbff', letterSpacing: 0.7 });
    this.add.text(362, 578 + yOffset, 'VOIR TOUT', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#35e8ff' }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('LeaderboardScene'));
    const entries = [
      ['01', 'Striker94', 'BR', '11 980'], ['02', 'LeMur', 'FR', '10 650'], ['03', 'AtlasKick', 'MA', '9 720']
    ];
    entries.forEach((entry, index) => {
      const y = 626 + yOffset + index * 58;
      const bg = this.add.graphics().fillStyle(index === 0 ? 0x172832 : 0x0d171f, 0.92).fillRoundedRect(28, y - 23, 334, 48, 13);
      if (index === 0) bg.lineStyle(1, COLORS.lime, 0.25).strokeRoundedRect(28, y - 23, 334, 48, 13);
      this.add.text(44, y - 10, entry[0], { fontFamily: DISPLAY_FONT, fontSize: '18px', fontStyle: 'bold', color: index === 0 ? '#caff38' : '#657a85' });
      this.add.text(80, y - 11, entry[1], { fontFamily: BODY_FONT, fontSize: '12px', fontStyle: 'bold', color: '#f7fbff' });
      this.add.text(80, y + 7, entry[2], { fontFamily: BODY_FONT, fontSize: '9px', color: '#78909c' });
      this.add.text(346, y - 9, entry[3], { fontFamily: DISPLAY_FONT, fontSize: '20px', fontStyle: 'bold', color: index === 0 ? '#caff38' : '#f7fbff' }).setOrigin(1, 0);
    });
    this.add.text(195, 815 - Math.max(12, this.safeBottom), 'AUCUN COMPTE REQUIS  •  JOUE INSTANTANÉMENT', { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: '#536771', letterSpacing: 0.6 }).setOrigin(0.5);
  }
}
