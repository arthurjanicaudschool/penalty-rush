import Phaser from 'phaser';
import type { ShotInput } from '../types';

export class SwipeController {
  private start?: { x: number; y: number; time: number };
  private lastPosition = new Phaser.Math.Vector2();
  private path: Phaser.Math.Vector2[] = [];
  private guide: Phaser.GameObjects.Graphics;
  enabled = true;

  constructor(private scene: Phaser.Scene, private origin: Phaser.Math.Vector2, private onShot: (shot: ShotInput) => void) {
    this.guide = scene.add.graphics().setDepth(20);
    scene.input.on('pointerdown', this.pointerDown, this);
    scene.input.on('pointermove', this.pointerMove, this);
    scene.input.on('pointerup', this.pointerUp, this);
    scene.input.on('pointerupoutside', this.pointerUp, this);
    window.addEventListener('pointerup', this.nativePointerUp, { passive: true, capture: true });
    window.addEventListener('pointercancel', this.nativePointerUp, { passive: true, capture: true });
    window.addEventListener('touchend', this.nativePointerUp, { passive: true, capture: true });
    window.addEventListener('touchcancel', this.nativePointerUp, { passive: true, capture: true });
  }

  private worldPosition(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    return pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
  }

  private pointerDown(pointer: Phaser.Input.Pointer): void {
    const position = this.worldPosition(pointer);
    if (!this.enabled || Phaser.Math.Distance.Between(position.x, position.y, this.origin.x, this.origin.y) > 130) return;
    this.start = { x: position.x, y: position.y, time: this.scene.time.now };
    this.lastPosition.set(position.x, position.y);
    this.path = [new Phaser.Math.Vector2(position.x, position.y)];
    const event = pointer.event as PointerEvent;
    if (event.pointerId !== undefined && event.currentTarget instanceof Element && 'setPointerCapture' in event.currentTarget) {
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Browser may already own capture. */ }
    }
  }

  private pointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.start) return;
    const position = this.worldPosition(pointer);
    this.lastPosition.set(position.x, position.y);
    if (!this.path.length || Phaser.Math.Distance.BetweenPoints(this.path[this.path.length - 1], position) > 5) {
      this.path.push(new Phaser.Math.Vector2(position.x, position.y));
    }
    const distance = Phaser.Math.Distance.Between(this.origin.x, this.origin.y, position.x, position.y);
    const strength = Phaser.Math.Clamp(distance / 380, 0, 1);
    const color = strength > 0.9 ? 0xff4967 : strength > 0.55 ? 0xcaff38 : 0x35e8ff;
    this.guide.clear().lineStyle(14, color, 0.07);
    this.drawPath();
    this.guide.lineStyle(4, color, 0.92);
    this.drawPath();
    this.guide.fillStyle(color, 0.16).fillCircle(position.x, position.y, 17);
    this.guide.lineStyle(3, color, 0.95).strokeCircle(position.x, position.y, 10);
    const angle = Phaser.Math.Angle.Between(this.path[Math.max(0, this.path.length - 2)].x, this.path[Math.max(0, this.path.length - 2)].y, position.x, position.y);
    this.guide.fillStyle(color, 1).fillTriangle(
      position.x + Math.cos(angle) * 18, position.y + Math.sin(angle) * 18,
      position.x + Math.cos(angle + 2.45) * 12, position.y + Math.sin(angle + 2.45) * 12,
      position.x + Math.cos(angle - 2.45) * 12, position.y + Math.sin(angle - 2.45) * 12
    );
  }

  private drawPath(): void {
    for (let i = 1; i < this.path.length; i += 1) {
      this.guide.lineBetween(this.path[i - 1].x, this.path[i - 1].y, this.path[i].x, this.path[i].y);
    }
  }

  private pointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.start) return;
    const position = this.worldPosition(pointer);
    this.finish(position.x, position.y);
  }

  private nativePointerUp = (): void => {
    if (this.start) this.finish(this.lastPosition.x, this.lastPosition.y);
  };

  private finish(x: number, y: number): void {
    if (!this.start) return;
    const start = this.start;
    const dx = x - start.x;
    const dy = y - start.y;
    const distance = Math.hypot(dx, dy);
    const duration = Math.max(80, this.scene.time.now - start.time);
    const middle = this.path[Math.floor(this.path.length / 2)] ?? new Phaser.Math.Vector2(start.x + dx / 2, start.y + dy / 2);
    const progress = Phaser.Math.Clamp((start.y - middle.y) / Math.max(1, -dy), 0, 1);
    const expectedX = start.x + dx * progress;
    const curve = Phaser.Math.Clamp((middle.x - expectedX) / 65, -1, 1);
    this.start = undefined; this.path = []; this.guide.clear();
    if (distance >= 42 && dy < -18) {
      if ('vibrate' in navigator) navigator.vibrate(12);
      this.onShot({ dx, dy, distance, duration, curve });
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.pointerDown, this);
    this.scene.input.off('pointermove', this.pointerMove, this);
    this.scene.input.off('pointerup', this.pointerUp, this);
    this.scene.input.off('pointerupoutside', this.pointerUp, this);
    window.removeEventListener('pointerup', this.nativePointerUp, true);
    window.removeEventListener('pointercancel', this.nativePointerUp, true);
    window.removeEventListener('touchend', this.nativePointerUp, true);
    window.removeEventListener('touchcancel', this.nativePointerUp, true);
    this.guide.destroy();
  }
}
