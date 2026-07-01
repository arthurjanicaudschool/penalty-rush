import Phaser from 'phaser';
import type { ShotInput, ShotResult, ShotZone } from '../types';

const zoneFromTarget = (x: number, y: number): ShotZone => {
  if (x < 155) return y < 315 ? 'top-left' : 'low-left';
  if (x > 235) return y < 315 ? 'top-right' : 'low-right';
  return 'center';
};

export class ShotSystem {
  resolve(input: ShotInput, keeper: { x: number; y: number }, perfectZone: { x: number; y: number }): ShotResult {
    const normalizedX = Phaser.Math.Clamp(input.dx / 155, -1, 1);
    const upward = Phaser.Math.Clamp(-input.dy / 225, 0, 1.15);
    const speed = input.distance / Math.max(input.duration, 80);
    const power = Phaser.Math.Clamp(input.distance / 420 * 0.85 + Phaser.Math.Clamp(speed, 0, 1.2) * 0.15, 0, 1.25);
    const targetX = 195 + normalizedX * 142 + input.curve * 38;
    const targetY = 390 - upward * 135 - Math.max(0, power - 0.85) * 135;
    const framed = targetX >= 58 && targetX <= 332 && targetY >= 225 && targetY <= 388;
    const weak = power < 0.31;
    const over = power > 1.12 || targetY < 218;
    const accuracy = Phaser.Math.Clamp(1 - Math.abs(input.dx) / 250 - Math.abs(input.dy + 175) / 420, 0.25, 1);
    const zone = zoneFromTarget(targetX, targetY);
    const isCorner = zone !== 'center' && (targetX < 120 || targetX > 270) && targetY < 330;
    const isPerfect = Phaser.Math.Distance.Between(targetX, targetY, perfectZone.x, perfectZone.y) < 32;
    const saveRadius = weak ? 92 : 64 - Math.min(power, 0.9) * 18;
    const saved = Phaser.Math.Distance.Between(targetX, targetY, keeper.x, keeper.y) < saveRadius;
    const outcome = !framed || over ? 'miss' : saved ? 'saved' : 'goal';
    let points = outcome === 'goal' ? 1000 : 0;
    if (outcome === 'goal' && isCorner) points += 500;
    if (outcome === 'goal' && isPerfect) points += 750;
    if (outcome === 'goal' && power >= 0.72 && power <= 1) points += 200;
    return { outcome, zone, points, power, accuracy, isCorner, isPerfect, targetX, targetY, keeperX: keeper.x, keeperY: keeper.y, curve: input.curve };
  }
}
