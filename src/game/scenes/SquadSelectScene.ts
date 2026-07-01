import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { getRoster } from '../config/rosters';
import { gameState } from '../state';
import { createBackButton, createButton } from '../../ui/buttons';
import { createStadiumBackground } from '../../ui/backgrounds';
import { BODY_FONT, DISPLAY_FONT } from '../../ui/theme';
import { createFlag } from '../../ui/flags';
import { enableHighDpi } from '../../ui/highDpi';

export class SquadSelectScene extends Phaser.Scene {
  private selected = new Set<string>();
  private cards = new Map<string, { border: Phaser.GameObjects.Graphics; order: Phaser.GameObjects.Text }>();
  private countText!: Phaser.GameObjects.Text;

  constructor() { super('SquadSelectScene'); }

  create(): void {
    enableHighDpi(this);
    this.selected = new Set(gameState.getSquad()); this.cards.clear();
    this.cameras.main.setBackgroundColor(COLORS.ink);
    createStadiumBackground(this, { particles: false });
    this.add.rectangle(195, 422, 390, 844, COLORS.ink, 0.64).setDepth(-1);
    createBackButton(this, () => this.scene.start('CountrySelectScene'));
    createFlag(this, 334, 56, gameState.country, 44);
    this.add.text(195, 43, 'COMPOSE TON ÉQUIPE', { fontFamily: BODY_FONT, fontSize: '9px', fontStyle: 'bold', color: '#35e8ff', letterSpacing: 1 }).setOrigin(0.5);
    this.add.text(195, 76, 'CHOISIS TES 5 TIREURS', { fontFamily: DISPLAY_FONT, fontSize: '32px', fontStyle: 'bold italic', color: '#f7fbff' }).setOrigin(0.5);
    this.countText = this.add.text(195, 115, '', { fontFamily: BODY_FONT, fontSize: '10px', fontStyle: 'bold', color: '#caff38' }).setOrigin(0.5);

    getRoster(gameState.country).forEach((player, index) => {
      const col = index % 2; const row = Math.floor(index / 2);
      const x = 104 + col * 182; const y = 206 + row * 158;
      const card = this.add.container(x, y);
      const border = this.add.graphics();
      const avatar = this.add.circle(0, -23, 30, index % 2 ? COLORS.violet : COLORS.cyan, 0.2).setStrokeStyle(2, index % 2 ? COLORS.violet : COLORS.cyan, 0.55);
      const number = this.add.text(0, -25, `${player.number}`, { fontFamily: DISPLAY_FONT, fontSize: '29px', fontStyle: 'bold', color: '#f7fbff' }).setOrigin(0.5);
      const name = this.add.text(0, 18, player.name.toUpperCase(), { fontFamily: DISPLAY_FONT, fontSize: '16px', fontStyle: 'bold', color: '#f7fbff' }).setOrigin(0.5);
      const role = this.add.text(0, 40, player.role, { fontFamily: BODY_FONT, fontSize: '7px', fontStyle: 'bold', color: '#78909b', letterSpacing: 0.6 }).setOrigin(0.5);
      const stats = this.add.text(0, 59, `PUI ${player.power}  •  EFF ${player.curve}`, { fontFamily: BODY_FONT, fontSize: '7px', color: '#a6b5bc' }).setOrigin(0.5);
      const order = this.add.text(61, -61, '', { fontFamily: DISPLAY_FONT, fontSize: '13px', fontStyle: 'bold', color: '#07110c' }).setOrigin(0.5);
      const hit = this.add.zone(0, 0, 158, 138).setInteractive({ useHandCursor: true });
      card.add([border, avatar, number, name, role, stats, order, hit]);
      this.cards.set(player.id, { border, order });
      hit.on('pointerdown', () => card.setScale(0.97));
      hit.on('pointerup', () => { card.setScale(1); this.toggle(player.id); });
    });
    createButton(this, 195, 720, 'Entrer sur le terrain', () => {
      if (this.selected.size !== 5) return;
      gameState.selectSquad([...this.selected]); this.scene.start('PenaltyScene');
    }, { width: 338 });
    this.add.text(195, 775, 'L’ordre de sélection définit l’ordre de passage.', { fontFamily: BODY_FONT, fontSize: '9px', color: '#70858f' }).setOrigin(0.5);
    this.refresh();
  }

  private toggle(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else if (this.selected.size < 5) this.selected.add(id);
    this.refresh();
  }

  private refresh(): void {
    const ordered = [...this.selected];
    this.cards.forEach(({ border, order }, id) => {
      const active = this.selected.has(id);
      border.clear().fillStyle(active ? 0x172832 : 0x0d171f, 0.97).fillRoundedRect(-79, -69, 158, 138, 18)
        .lineStyle(active ? 2 : 1, active ? COLORS.lime : 0xffffff, active ? 0.75 : 0.08).strokeRoundedRect(-79, -69, 158, 138, 18);
      if (active) border.fillStyle(COLORS.lime).fillCircle(61, -61, 14);
      order.setText(active ? `${ordered.indexOf(id) + 1}` : '');
    });
    this.countText.setText(`${this.selected.size}/5 SÉLECTIONNÉS`);
  }
}
