import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { Ball } from '../objects/Ball';
import { Goal } from '../objects/Goal';
import { Goalkeeper } from '../objects/Goalkeeper';
import { SwipeController } from '../objects/SwipeController';
import { ChallengeSystem } from '../systems/ChallengeSystem';
import { KeeperAI } from '../systems/KeeperAI';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ShotSystem } from '../systems/ShotSystem';
import { gameState } from '../state';
import type { GameResult, ShotResult, ShotZone } from '../types';
import { formatScore } from '../../ui/responsive';
import { getCountry } from '../config/countries';
import { createStadiumBackground, createTopHud } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { FeedbackSystem } from '../systems/FeedbackSystem';
import { enableHighDpi } from '../../ui/highDpi';
import { createFlag } from '../../ui/flags';
import { getRoster, type SquadPlayer } from '../config/rosters';
import { MusicSystem } from '../systems/MusicSystem';
import { COUNTRIES } from '../config/countries';

export class PenaltyScene extends Phaser.Scene {
  private ball!: Ball;
  private keeper!: Goalkeeper;
  private swipe!: SwipeController;
  private scoreSystem = new ScoreSystem();
  private keeperAI = new KeeperAI();
  private shotSystem = new ShotSystem();
  private shotCount = 0;
  private accuracyTotal = 0;
  private zones: ShotZone[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private perfectZone!: Phaser.GameObjects.Arc;
  private shotDots: Phaser.GameObjects.Arc[] = [];
  private shooterText!: Phaser.GameObjects.Text;
  private squad: SquadPlayer[] = [];
  private pauseOverlay?: Phaser.GameObjects.Container;
  private debugText?: Phaser.GameObjects.Text;

  constructor() { super('PenaltyScene'); }

  create(): void {
    enableHighDpi(this);
    this.scoreSystem = new ScoreSystem();
    this.keeperAI = new KeeperAI();
    this.shotCount = 0; this.accuracyTotal = 0; this.zones = []; this.shotDots = [];
    const roster = getRoster(gameState.country);
    this.squad = gameState.getSquad().map((id) => roster.find((player) => player.id === id)).filter((player): player is SquadPlayer => Boolean(player));
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this, { pitch: true, particles: false });
    this.createFloodlights();
    createTopHud(this);
    this.createHud();
    this.createPauseControl();
    this.createChallengeBadge();
    new Goal(this);
    this.createPerfectZone();
    const countryIndex = Math.max(0, COUNTRIES.findIndex((country) => country.code === gameState.country));
    const opponent = COUNTRIES[(countryIndex + 3 + new Date().getDate()) % COUNTRIES.length];
    this.keeper = new Goalkeeper(this, 195, 342, opponent.colors[0], opponent.colors[1]);
    createFlag(this, 195, 175, opponent.code, 34);
    this.add.text(220, 170, `GARDIEN ${opponent.name.toUpperCase()}`, { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#8297a1' }).setOrigin(0, 0.5);
    this.ball = new Ball(this, 195, 683);
    this.createShotPrompt();
    this.createDebugPanel();
    this.swipe = new SwipeController(this, new Phaser.Math.Vector2(195, 683), (input) => this.shoot(input));
    this.events.once('shutdown', () => this.swipe.destroy());
    this.introMotion();
  }

  private createFloodlights(): void {
    const lights = this.add.graphics().setDepth(-40);
    lights.fillStyle(0xffffff, 0.06).fillTriangle(12, 110, 115, 420, 0, 420).fillTriangle(378, 110, 390, 420, 275, 420);
    for (let side = 0; side < 2; side += 1) {
      const startX = side === 0 ? 28 : 314;
      for (let i = 0; i < 4; i += 1) lights.fillStyle(0xeaffff, 0.9).fillRoundedRect(startX + i * 13, 132, 9, 5, 2);
    }
  }

  private createHud(): void {
    this.add.text(34, 35, 'SCORE', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#6f8590', letterSpacing: 0.8 });
    this.scoreText = this.add.text(34, 49, '0', { fontFamily: DISPLAY_FONT, fontSize: '34px', fontStyle: 'bold', color: '#f7fbff' });
    const country = getCountry(gameState.country);
    createFlag(this, 334, 51, country.code, 42);
    this.shooterText = this.add.text(306, 36, this.squad[0]?.name.toUpperCase() ?? 'LE FINISSEUR', { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#8aa0ad' }).setOrigin(1, 0);
    this.add.text(306, 53, country.name.toUpperCase(), { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#5e737e' }).setOrigin(1, 0);
    for (let i = 0; i < 5; i += 1) {
      const dot = this.add.circle(236 + i * 17, 79, 5, 0x283b44).setStrokeStyle(1, 0xffffff, 0.12);
      this.shotDots.push(dot);
    }
  }

  private createPauseControl(): void {
    const control = this.add.container(195, 57).setDepth(40);
    const bg = this.add.circle(0, 0, 18, 0x172832, 0.95).setStrokeStyle(1, 0xffffff, 0.14);
    const bars = this.add.graphics().fillStyle(0xf7fbff).fillRoundedRect(-6, -7, 4, 14, 2).fillRoundedRect(2, -7, 4, 14, 2);
    const hit = this.add.zone(0, 0, 48, 48).setInteractive({ useHandCursor: true });
    control.add([bg, bars, hit]);
    hit.on('pointerup', () => this.openPause());
  }

  private createChallengeBadge(): void {
    const challenge = ChallengeSystem.getToday();
    const bg = this.add.graphics().fillStyle(0x0d171f, 0.92).fillRoundedRect(94, 110, 202, 30, 15).lineStyle(1, COLORS.violet, 0.45).strokeRoundedRect(94, 110, 202, 30, 15);
    this.add.text(195, 125, `DÉFI • ${challenge.title.toUpperCase()}`, { fontFamily: BODY_FONT, fontSize: '8px', fontStyle: 'bold', color: '#b9adff', letterSpacing: 0.45 }).setOrigin(0.5);
    bg.setDepth(1);
  }

  private openPause(): void {
    if (this.pauseOverlay || !this.swipe.enabled) return;
    this.swipe.enabled = false;
    const overlay = this.add.container(0, 0).setDepth(100);
    const scrim = this.add.rectangle(195, 422, 390, 844, 0x020407, 0.86).setInteractive();
    const panel = this.add.graphics().fillStyle(0x0d171f, 0.99).fillRoundedRect(28, 214, 334, 420, 28).lineStyle(1.5, COLORS.cyan, 0.3).strokeRoundedRect(28, 214, 334, 420, 28);
    const title = this.add.text(195, 258, 'MATCH EN PAUSE', { fontFamily: DISPLAY_FONT, fontSize: '34px', fontStyle: 'bold italic', color: '#f7fbff' }).setOrigin(0.5);
    const subtitle = this.add.text(195, 298, 'Reprends quand tu veux. Le stade attend.', { fontFamily: BODY_FONT, fontSize: '10px', color: '#8aa0ad' }).setOrigin(0.5);
    overlay.add([scrim, panel, title, subtitle]);
    const music = this.pauseAction(overlay, 360, MusicSystem.isEnabled() ? 'MUSIQUE : ON' : 'MUSIQUE : OFF', false, () => {
      const enabled = MusicSystem.toggle(); music.setText(`MUSIQUE : ${enabled ? 'ON' : 'OFF'}`);
    });
    this.pauseAction(overlay, 430, 'REPRENDRE', true, () => { overlay.destroy(true); this.pauseOverlay = undefined; this.swipe.enabled = true; });
    this.pauseAction(overlay, 500, 'RECOMMENCER', false, () => this.scene.restart());
    this.pauseAction(overlay, 570, 'RETOUR À L’ACCUEIL', false, () => this.scene.start('HomeScene'));
    this.pauseOverlay = overlay;
  }

  private pauseAction(parent: Phaser.GameObjects.Container, y: number, label: string, primary: boolean, action: () => void): Phaser.GameObjects.Text {
    const bg = this.add.graphics().fillStyle(primary ? COLORS.lime : 0x172832, 1).fillRoundedRect(54, y - 27, 282, 54, 15).lineStyle(1, primary ? COLORS.lime : 0xffffff, primary ? 1 : 0.1).strokeRoundedRect(54, y - 27, 282, 54, 15);
    const text = this.add.text(195, y, label, { fontFamily: DISPLAY_FONT, fontSize: '19px', fontStyle: 'bold', color: primary ? '#07110c' : '#f7fbff' }).setOrigin(0.5);
    const hit = this.add.zone(195, y, 282, 54).setInteractive({ useHandCursor: true });
    hit.on('pointerup', action); parent.add([bg, text, hit]); return text;
  }

  private createPerfectZone(): void {
    this.perfectZone = this.add.circle(105, 260, 25, COLORS.lime, 0.045).setStrokeStyle(2, COLORS.lime, 0.8);
    const cross = this.add.graphics().setDepth(this.perfectZone.depth + 1);
    cross.lineStyle(1, COLORS.lime, 0.55).lineBetween(105, 228, 105, 292).lineBetween(73, 260, 137, 260);
    this.tweens.add({ targets: [this.perfectZone, cross], alpha: { from: 0.38, to: 0.95 }, scale: { from: 0.86, to: 1.08 }, yoyo: true, repeat: -1, duration: 660, ease: 'Sine.InOut' });
    this.perfectZone.setData('cross', cross);
  }

  private createShotPrompt(): void {
    const panel = this.add.graphics().fillStyle(0x071017, 0.84).fillRoundedRect(64, 738, 262, 66, 22).lineStyle(1, 0x35e8ff, 0.2).strokeRoundedRect(64, 738, 262, 66, 22);
    this.hintText = this.add.text(195, 750, 'GLISSE POUR FRAPPER', { fontFamily: DISPLAY_FONT, fontSize: '19px', fontStyle: 'bold', color: '#f7fbff', letterSpacing: 0.7 }).setOrigin(0.5, 0);
    this.add.text(195, 778, 'COURBE TON GESTE = EFFET  •  LONGUEUR = PUISSANCE', { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#79909a', letterSpacing: 0.35 }).setOrigin(0.5, 0);
    const arrow = this.add.graphics().lineStyle(2, COLORS.cyan, 0.9).lineBetween(195, 721, 195, 700).fillStyle(COLORS.cyan).fillTriangle(195, 692, 189, 701, 201, 701);
    this.tweens.add({ targets: arrow, y: -9, alpha: 0.25, yoyo: true, repeat: -1, duration: 620 });
    panel.setDepth(2); this.hintText.setDepth(3);
  }

  private introMotion(): void {
    this.ball.setScale(0).setAlpha(0);
    this.tweens.add({ targets: this.ball, scale: 1, alpha: 1, duration: 320, delay: 180, ease: 'Back.Out' });
    this.keeper.setAlpha(0).setY(330);
    this.tweens.add({ targets: this.keeper, alpha: 1, y: 342, duration: 280, ease: 'Cubic.Out' });
  }

  private createDebugPanel(): void {
    this.debugText = this.add.text(12, 232, 'SCENE DEBUG: ready', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#35e8ff',
      backgroundColor: '#05080dcc',
      padding: { x: 6, y: 5 }
    }).setDepth(201);
  }

  private debug(label: string, extra = ''): void {
    this.debugText?.setText([
      'SCENE DEBUG',
      `event: ${label}`,
      `swipe enabled: ${this.swipe?.enabled ? 'yes' : 'no'}`,
      `shotCount: ${this.shotCount}`,
      `ball: ${Math.round(this.ball?.x ?? -1)},${Math.round(this.ball?.y ?? -1)}`,
      extra
    ].filter(Boolean).join('\n'));
  }

  private safeVibrate(pattern: VibratePattern): void {
    try {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
    } catch { /* Haptics are optional and must never block gameplay. */ }
  }

  private shoot(input: { dx: number; dy: number; distance: number; duration: number; curve: number }): void {
    this.debug('shoot called', `dx:${Math.round(input.dx)} dy:${Math.round(input.dy)} dist:${Math.round(input.distance)}`);
    if (!this.swipe.enabled) {
      this.debug('shoot blocked: swipe disabled', `dx:${Math.round(input.dx)} dy:${Math.round(input.dy)} dist:${Math.round(input.distance)}`);
      return;
    }
    this.swipe.enabled = false;
    const challenge = ChallengeSystem.getToday();
    const intent = this.keeperAI.decide(gameState.challengeMode ? challenge.keeperBonus ?? 0 : 0);
    const result = this.shotSystem.resolve(input, intent, this.perfectZone);
    this.debug('shot resolved', `target:${Math.round(result.targetX)},${Math.round(result.targetY)} outcome:${result.outcome} power:${result.power.toFixed(2)}`);
    this.keeperAI.record(result.zone); this.zones.push(result.zone); this.accuracyTotal += result.accuracy;
    const awarded = this.scoreSystem.addShot(result);
    FeedbackSystem.shot(result.power);
    this.shotCount += 1;
    this.keeper.dive(result.keeperX, result.keeperY);
    this.animateBall(result);
    this.time.delayedCall(360, () => this.showFeedback(result, awarded));
  }

  private animateBall(result: ShotResult): void {
    this.ball.setDepth(24);
    this.debug('animate ball start', `from:${Math.round(this.ball.x)},${Math.round(this.ball.y)} to:${Math.round(result.targetX)},${Math.round(result.targetY)}`);
    const trailColor = result.outcome === 'goal' ? COLORS.lime : COLORS.cyan;
    for (let i = 0; i < 6; i += 1) {
      const t = i / 6;
      const trail = this.add.circle(195 + (result.targetX - 195) * t, 683 + (result.targetY - 683) * t, 12 - i, trailColor, 0.13 + i * 0.025).setDepth(8);
      this.tweens.add({ targets: trail, alpha: 0, scale: 0.2, delay: i * 35, duration: 300, onComplete: () => trail.destroy() });
    }
    const progress = { value: 0 };
    const controlX = (195 + result.targetX) / 2 + result.curve * 105;
    const controlY = (683 + result.targetY) / 2 - 35;
    this.tweens.add({ targets: progress, value: 1, duration: 390, ease: 'Quad.In', onUpdate: () => {
      this.ball.x = Phaser.Math.Interpolation.QuadraticBezier(progress.value, 195, controlX, result.targetX);
      this.ball.y = Phaser.Math.Interpolation.QuadraticBezier(progress.value, 683, controlY, result.targetY);
      this.ball.setScale(1 - progress.value * 0.66).setAngle(progress.value * (420 + result.curve * 160));
      this.debug('animate ball update', `p:${progress.value.toFixed(2)} ball:${Math.round(this.ball.x)},${Math.round(this.ball.y)}`);
    }, onComplete: () => {
      this.debug('animate ball complete', `ball:${Math.round(this.ball.x)},${Math.round(this.ball.y)} outcome:${result.outcome}`);
      if (result.outcome === 'goal') { this.cameras.main.shake(85, 0.005); this.burst(result.targetX, result.targetY, COLORS.lime); }
    }});
  }

  private showFeedback(result: ShotResult, awarded: number): void {
    const labels = { goal: result.isPerfect ? 'PLEINE LUCARNE' : result.isCorner ? 'LUCARNE' : 'GOOOAL', saved: 'STOPPÉ', miss: 'TROP HAUT' };
    const color = result.outcome === 'goal' ? '#caff38' : '#ff4967';
    this.shotDots[this.shotCount - 1].setFillStyle(result.outcome === 'goal' ? COLORS.lime : COLORS.red).setStrokeStyle(2, result.outcome === 'goal' ? 0xeaffad : 0xff9bad);
    const banner = this.add.graphics().setDepth(29).fillStyle(0x05080d, 0.88).fillRoundedRect(54, 480, 282, 92, 22).lineStyle(1, result.outcome === 'goal' ? COLORS.lime : COLORS.red, 0.35).strokeRoundedRect(54, 480, 282, 92, 22);
    const feedback = this.add.text(195, 491, labels[result.outcome], { fontFamily: DISPLAY_FONT, fontSize: '41px', fontStyle: 'bold italic', color, stroke: '#05080d', strokeThickness: 4 }).setOrigin(0.5, 0).setDepth(30).setScale(0.6);
    const detail = this.add.text(195, 538, result.outcome === 'goal' ? `+${formatScore(awarded)}  •  SÉRIE x${this.scoreSystem.streak}` : result.outcome === 'saved' ? 'LE GARDIEN T’AVAIT LU' : 'DOSE UN PEU MOINS', { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#d6e2e7', letterSpacing: 0.55 }).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(760, () => {
      banner.destroy(); feedback.destroy(); detail.destroy();
      if (this.shotCount >= 5) this.finishGame(); else this.resetShot();
    });
    this.tweens.add({ targets: feedback, scale: 1, duration: 210, ease: 'Back.Out' });
    if (result.outcome === 'goal') FeedbackSystem.goal(); else FeedbackSystem.fail();
    this.scoreText.setText(formatScore(this.scoreSystem.score));
    this.tweens.add({ targets: this.scoreText, scale: 1.18, color: '#caff38', yoyo: true, duration: 110 });
    this.safeVibrate(result.outcome === 'goal' ? [18, 35, 28] : 25);
  }

  private burst(x: number, y: number, color: number): void {
    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18;
      const spark = this.add.rectangle(x, y, i % 3 === 0 ? 8 : 4, i % 3 === 0 ? 3 : 4, i % 4 === 0 ? COLORS.cyan : color).setRotation(angle).setDepth(25);
      this.tweens.add({ targets: spark, x: x + Math.cos(angle) * Phaser.Math.Between(45, 92), y: y + Math.sin(angle) * Phaser.Math.Between(35, 75), alpha: 0, rotation: angle + 2, duration: 460, ease: 'Cubic.Out', onComplete: () => spark.destroy() });
    }
  }

  private resetShot(): void {
    this.ball.setPosition(195, 683).setScale(1).setAngle(0).setAlpha(1);
    this.keeper.setPosition(195, 342).setRotation(0).setScale(1);
    const x = Phaser.Math.Between(82, 308); const y = Phaser.Math.Between(248, 350);
    this.perfectZone.setPosition(x, y);
    const cross = this.perfectZone.getData('cross') as Phaser.GameObjects.Graphics;
    cross.setPosition(x - 105, y - 260);
    this.hintText.setText(this.shotCount >= 3 ? 'IL FAUT LA METTRE' : 'À TOI DE JOUER');
    this.shooterText.setText(this.squad[this.shotCount]?.name.toUpperCase() ?? 'DERNIER TIREUR');
    this.swipe.enabled = true;
  }

  private finishGame(): void {
    const bonus = this.scoreSystem.addPerfectGameBonus();
    if (bonus) this.scoreText.setText(formatScore(this.scoreSystem.score));
    const challenge = ChallengeSystem.getToday();
    const base = { score: this.scoreSystem.score, goals: this.scoreSystem.goals, accuracy: Math.round(this.accuracyTotal / 5 * 100), corners: this.scoreSystem.corners, streak: this.scoreSystem.bestStreak, country: gameState.country, challengeId: challenge.id, zones: this.zones };
    const result: GameResult = { ...base, challengeComplete: ChallengeSystem.isComplete(challenge, base) };
    gameState.saveResult(result);
    this.cameras.main.fade(260, 5, 8, 13);
    this.time.delayedCall(280, () => this.scene.start('ResultScene', result));
  }
}
