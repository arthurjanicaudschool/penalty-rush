import type { ShotZone } from '../types';

type KeeperIntent = { x: number; y: number; zone: ShotZone };

export class KeeperAI {
  private history: ShotZone[] = [];

  record(zone: ShotZone): void { this.history.push(zone); }

  decide(strengthBonus = 0): KeeperIntent {
    const left = this.history.filter((zone) => zone.includes('left')).length;
    const right = this.history.filter((zone) => zone.includes('right')).length;
    const repeatBias = Math.min(0.32 + strengthBonus, 0.62);
    let zone: ShotZone;
    if (this.history.length >= 2 && Math.random() < repeatBias && left !== right) {
      zone = left > right ? (Math.random() > 0.45 ? 'top-left' : 'low-left') : (Math.random() > 0.45 ? 'top-right' : 'low-right');
    } else {
      const options: ShotZone[] = ['top-left', 'top-right', 'low-left', 'low-right', 'center'];
      zone = options[Math.floor(Math.random() * options.length)];
    }
    const positions: Record<ShotZone, [number, number]> = {
      'top-left': [112, 285], 'top-right': [278, 285], 'low-left': [112, 345], 'low-right': [278, 345], center: [195, 330]
    };
    return { x: positions[zone][0], y: positions[zone][1], zone };
  }
}
