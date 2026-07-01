import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import type { GameResult } from '../types';
import { gameState } from '../state';
import { createButton } from '../../ui/buttons';
import { formatScore } from '../../ui/responsive';
import { leaderboardService } from '../../services/leaderboardService';
import { shareResult } from '../../services/shareService';
import { createStadiumBackground } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { enableHighDpi } from '../../ui/highDpi';
import { createFlag } from '../../ui/flags';

export class ResultScene extends Phaser.Scene {
  private result!: GameResult;
  constructor() { super('ResultScene'); }
  init(data: GameResult): void { this.result = data.score !== undefined ? data : gameState.getLastResult()!; }

  create(): void {
    enableHighDpi(this);
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this);
    this.add.rectangle(195, 422, 390, 844, COLORS.ink, 0.5).setDepth(-1);
    this.createConfetti();
    this.createHeader();
    this.createScoreCard();
    createButton(this, 195, 630, 'Rejouer tout de suite', () => this.scene.start('PenaltyScene'), { width: 338 });
    createButton(this, 195, 700, 'Partager mon score', () => void this.handleShare(), { width: 338, primary: false });
    const rank = this.add.text(195, 758, 'VOIR MON RANG DU JOUR  ›', { fontFamily: BODY_FONT, fontSize: '11px', fontStyle: 'bold', color: '#35e8ff', letterSpacing: 0.65 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    rank.on('pointerup', () => this.scene.start('LeaderboardScene'));
    const home = this.add.text(195, 808, 'RETOUR À L’ACCUEIL', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#647984', letterSpacing: 0.7 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    home.on('pointerup', () => this.scene.start('HomeScene'));
    void leaderboardService.submit(this.result).catch(() => undefined);
  }

  private createHeader(): void {
    const success = this.result.goals >= 4;
    const badgeBg = this.add.graphics().fillStyle(success ? COLORS.lime : COLORS.red, 1).fillRoundedRect(130, 42, 130, 28, 14);
    this.add.text(195, 56, this.result.challengeComplete ? 'DÉFI VALIDÉ' : 'SÉRIE TERMINÉE', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#07110c', letterSpacing: 0.8 }).setOrigin(0.5);
    this.add.text(195, 91, this.result.goals === 5 ? 'INJOUABLE.' : this.result.goals >= 3 ? 'ÇA FRAPPE FORT.' : 'IL FAUT REVENIR.', { fontFamily: DISPLAY_FONT, fontSize: '35px', fontStyle: 'bold italic', color: '#f7fbff' }).setOrigin(0.5);
    this.add.text(195, 130, this.getPhrase(), { fontFamily: BODY_FONT, fontSize: '10px', color: '#91a5af', align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5);
    badgeBg.setDepth(0);
  }

  private createScoreCard(): void {
    const card = this.add.graphics();
    card.fillStyle(0x0b151c, 0.96).fillRoundedRect(26, 170, 338, 404, 27);
    card.lineStyle(1.5, this.result.goals >= 4 ? COLORS.lime : COLORS.cyan, 0.42).strokeRoundedRect(26, 170, 338, 404, 27);
    card.fillStyle(this.result.goals >= 4 ? COLORS.lime : COLORS.cyan, 0.05).fillCircle(195, 296, 112);
    card.lineStyle(2, this.result.goals >= 4 ? COLORS.lime : COLORS.cyan, 0.16).strokeCircle(195, 296, 102).strokeCircle(195, 296, 84);
    createFlag(this, 195, 207, this.result.country, 46);
    this.add.text(195, 260, formatScore(this.result.score), { fontFamily: DISPLAY_FONT, fontSize: '70px', fontStyle: 'bold italic', color: this.result.goals >= 4 ? '#caff38' : '#f7fbff' }).setOrigin(0.5);
    this.add.text(195, 311, 'POINTS', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#718792', letterSpacing: 1.8 }).setOrigin(0.5);
    this.add.text(195, 352, `${this.result.goals}/5 PENALTIES`, { fontFamily: DISPLAY_FONT, fontSize: '27px', fontStyle: 'bold', color: '#f7fbff' }).setOrigin(0.5);
    this.add.rectangle(195, 394, 286, 1, 0xffffff, 0.09);
    const stats = [[`${this.result.accuracy}%`, 'PRÉCISION'], [`x${this.result.streak}`, 'MEILLEURE SÉRIE'], [`${this.result.corners}`, 'LUCARNES']];
    stats.forEach(([value, label], index) => {
      const x = 86 + index * 109;
      this.add.text(x, 431, value, { fontFamily: DISPLAY_FONT, fontSize: '27px', fontStyle: 'bold', color: index === 1 ? '#35e8ff' : '#f7fbff' }).setOrigin(0.5);
      this.add.text(x, 458, label, { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#657a85', align: 'center', wordWrap: { width: 90 }, letterSpacing: 0.35 }).setOrigin(0.5);
    });
    const callout = this.add.graphics().fillStyle(0x172832, 0.9).fillRoundedRect(48, 499, 294, 51, 14);
    this.add.text(195, 516, this.result.goals >= 4 ? 'TU ES DANS LE TOP 12% AUJOURD’HUI' : 'ENCORE UN ESSAI. TU SAIS QUE TU PEUX.', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: this.result.goals >= 4 ? '#caff38' : '#a9bbc3', align: 'center', wordWrap: { width: 260 }, letterSpacing: 0.3 }).setOrigin(0.5);
    callout.setDepth(0);
  }

  private createConfetti(): void {
    const colors = [COLORS.lime, COLORS.cyan, COLORS.violet, COLORS.white];
    for (let i = 0; i < 22; i += 1) {
      const particle = this.add.rectangle(Phaser.Math.Between(20, 370), Phaser.Math.Between(-100, 130), i % 3 === 0 ? 8 : 4, i % 4 === 0 ? 3 : 7, colors[i % colors.length], 0.7).setRotation(Math.random() * 3).setDepth(-0.5);
      this.tweens.add({ targets: particle, y: 620, x: particle.x + Phaser.Math.Between(-45, 45), rotation: particle.rotation + 5, alpha: 0, duration: Phaser.Math.Between(2600, 4300), delay: Phaser.Math.Between(0, 600), repeat: -1 });
    }
  }

  private getPhrase(): string {
    if (this.result.goals === 5) return 'Ton pays peut respirer. Pour aujourd’hui.';
    if (this.result.goals >= 4) return 'Propre. Mais pas encore légendaire.';
    if (this.result.goals >= 2) return `${this.result.goals} buts… ton pays attendait mieux.`;
    return 'Tu viens de sortir ton pays aux tirs au but.';
  }

  private async handleShare(): Promise<void> {
    try {
      const mode = await shareResult(this.result);
      this.toast(mode === 'copied' ? 'RÉSULTAT COPIÉ' : mode === 'downloaded' ? 'CARTE ENREGISTRÉE' : 'DÉFI ENVOYÉ');
    } catch (error) { if ((error as Error).name !== 'AbortError') this.toast('PARTAGE INDISPONIBLE'); }
  }

  private toast(message: string): void {
    const toast = this.add.text(195, 790, message, { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#07110c', backgroundColor: '#caff38', padding: { x: 18, y: 10 } }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: toast, alpha: 0, delay: 1700, duration: 180, onComplete: () => toast.destroy() });
  }
}
