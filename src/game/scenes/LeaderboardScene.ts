import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { gameState } from '../state';
import { createBackButton } from '../../ui/buttons';
import { formatScore } from '../../ui/responsive';
import { leaderboardService, type LeaderboardEntry } from '../../services/leaderboardService';
import { getCountry } from '../config/countries';
import { createStadiumBackground } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { enableHighDpi } from '../../ui/highDpi';

export class LeaderboardScene extends Phaser.Scene {
  private countryOnly = false;
  private liveObjects: Phaser.GameObjects.GameObject[] = [];
  private unsubscribe?: () => void;
  constructor() { super('LeaderboardScene'); }

  create(): void {
    enableHighDpi(this);
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this, { particles: false });
    this.add.rectangle(195, 422, 390, 844, COLORS.ink, 0.57).setDepth(-1);
    createBackButton(this, () => this.scene.start('HomeScene'));
    this.add.text(195, 45, 'LIVE • AUJOURD’HUI', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#caff38', letterSpacing: 1 }).setOrigin(0.5);
    this.add.text(195, 76, 'LES MEILLEURS', { fontFamily: DISPLAY_FONT, fontSize: '34px', fontStyle: 'bold italic', color: '#f7fbff' }).setOrigin(0.5);
    this.createTabs();
    void this.loadEntries();
    this.events.once('shutdown', () => { this.unsubscribe?.(); });
  }

  private createTabs(): void {
    const makeTab = (x: number, label: string, countryOnly: boolean) => {
      const active = this.countryOnly === countryOnly;
      const card = this.add.container(x, 137);
      const bg = this.add.graphics().fillStyle(active ? COLORS.lime : 0x172832, 1).fillRoundedRect(-80, -22, 160, 44, 13).lineStyle(1, active ? COLORS.lime : 0xffffff, active ? 1 : 0.1).strokeRoundedRect(-80, -22, 160, 44, 13);
      const text = this.add.text(0, 0, label, { fontFamily: DISPLAY_FONT, fontSize: '16px', fontStyle: 'bold', color: active ? '#07110c' : '#f7fbff', letterSpacing: 0.5 }).setOrigin(0.5);
      const hit = this.add.zone(0, 0, 160, 44).setInteractive({ useHandCursor: true });
      card.add([bg, text, hit]);
      hit.on('pointerup', () => { if (this.countryOnly !== countryOnly) { this.countryOnly = countryOnly; this.scene.restart(); } });
    };
    makeTab(105, 'MONDIAL', false); makeTab(285, getCountry(gameState.country).name.toUpperCase(), true);
  }

  private async loadEntries(): Promise<void> {
    const loading = this.add.text(195, 260, 'CHARGEMENT…', { fontFamily: BODY_FONT, fontSize: '11px', fontStyle: 'bold', color: '#8aa0ad' }).setOrigin(0.5);
    try {
      const country = this.countryOnly ? gameState.country : undefined;
      const entries = await leaderboardService.getDaily(country); loading.destroy(); this.renderEntries(entries);
      this.unsubscribe = leaderboardService.subscribe(country, (next) => this.renderEntries(next));
    }
    catch { loading.setText('CLASSEMENT INDISPONIBLE'); }
  }

  private renderEntries(entries: LeaderboardEntry[]): void {
    this.liveObjects.forEach((object) => object.destroy()); this.liveObjects = [];
    const track = <T extends Phaser.GameObjects.GameObject>(object: T): T => { this.liveObjects.push(object); return object; };
    entries.slice(0, 8).forEach((entry, index) => {
      const y = 204 + index * 66;
      const highlighted = entry.isPlayer || index === 0;
      const card = track(this.add.graphics().fillStyle(highlighted ? 0x172832 : 0x0d171f, 0.94).fillRoundedRect(26, y - 25, 338, 54, 15).lineStyle(1, entry.isPlayer ? COLORS.cyan : index === 0 ? COLORS.lime : 0xffffff, highlighted ? 0.4 : 0.07).strokeRoundedRect(26, y - 25, 338, 54, 15));
      if (index < 3) track(this.add.circle(48, y + 1, 15, index === 0 ? COLORS.lime : index === 1 ? 0xb9c8ce : 0xbd7650, 0.95));
      track(this.add.text(48, y + 1, `${index + 1}`, { fontFamily: DISPLAY_FONT, fontSize: '17px', fontStyle: 'bold', color: index < 3 ? '#07110c' : '#6e838d' }).setOrigin(0.5));
      track(this.add.text(76, y - 13, entry.username, { fontFamily: BODY_FONT, fontSize: '12px', fontStyle: 'bold', color: '#f7fbff' }));
      track(this.add.text(76, y + 7, `${entry.country}  •  ${entry.goals}/5 BUTS`, { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: '#6f8490', letterSpacing: 0.4 }));
      track(this.add.text(346, y - 11, formatScore(entry.score), { fontFamily: DISPLAY_FONT, fontSize: '22px', fontStyle: 'bold', color: highlighted ? '#caff38' : '#f7fbff' }).setOrigin(1, 0));
      card.setDepth(0);
    });
    if (!entries.length) track(this.add.text(195, 280, 'SOIS LE PREMIER À MARQUER.', { fontFamily: BODY_FONT, fontSize: '11px', fontStyle: 'bold', color: '#8aa0ad' }).setOrigin(0.5));
    const footer = track(this.add.graphics().fillStyle(0x111f29, 0.94).fillRoundedRect(28, 759, 334, 58, 17).lineStyle(1, COLORS.cyan, 0.18).strokeRoundedRect(28, 759, 334, 58, 17));
    track(this.add.text(46, 773, 'TON RECORD', { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: '#718691', letterSpacing: 0.65 }));
    track(this.add.text(46, 789, formatScore(gameState.bestScore), { fontFamily: DISPLAY_FONT, fontSize: '21px', fontStyle: 'bold', color: '#f7fbff' }));
    track(this.add.text(344, 782, gameState.bestScore ? 'CONTINUE DE GRIMPER  ↑' : 'JOUE TA PREMIÈRE PARTIE', { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: '#35e8ff' }).setOrigin(1, 0.5));
    footer.setDepth(0);
  }
}
