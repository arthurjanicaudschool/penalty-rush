import Phaser from 'phaser';
import type { ShotInput } from '../types';

export class SwipeController {
  private start?: { x: number; y: number; time: number };
  private activePointerId?: number;
  private activeTouchId?: number;
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
    scene.game.canvas.addEventListener('touchstart', this.touchStart, { passive: false, capture: true });
    window.addEventListener('touchmove', this.touchMove, { passive: false, capture: true });
    window.addEventListener('touchend', this.touchEnd, { passive: false, capture: true });
    window.addEventListener('touchcancel', this.touchEnd, { passive: false, capture: true });
  }

  private worldPosition(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    return pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
  }

  private worldPositionFromClient(clientX: number, clientY: number): Phaser.Math.Vector2 {
    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return this.scene.cameras.main.getWorldPoint(x, y);
  }

  private isTouchPointer(pointer: Phaser.Input.Pointer): boolean {
    const event = pointer.event;
    if ('pointerType' in event) return (event as PointerEvent).pointerType === 'touch';
    return 'touches' in event || 'changedTouches' in event;
  }

  private begin(position: Phaser.Math.Vector2): boolean {
    const originDistance = Phaser.Math.Distance.Between(position.x, position.y, this.origin.x, this.origin.y);
    if (!this.enabled || originDistance > 130) return false;
    this.start = { x: position.x, y: position.y, time: this.scene.time.now };
    this.lastPosition.set(position.x, position.y);
    this.path = [new Phaser.Math.Vector2(position.x, position.y)];
    return true;
  }

  private pointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.isTouchPointer(pointer)) return;
    const position = this.worldPosition(pointer);
    if (!this.begin(position)) return;
    this.activePointerId = pointer.id;
    const event = pointer.event as PointerEvent;
    if (event.pointerId !== undefined && event.currentTarget instanceof Element && 'setPointerCapture' in event.currentTarget) {
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Browser may already own capture. */ }
    }
  }

  private pointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isTouchPointer(pointer)) return;
    if (!this.start || (this.activePointerId !== undefined && pointer.id !== this.activePointerId)) return;
    const position = this.worldPosition(pointer);
    this.updatePath(position);
  }

  private updatePath(position: Phaser.Math.Vector2): void {
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
    const fallback = this.path[this.path.length - 1] ?? this.lastPosition;
    const releaseDistance = Phaser.Math.Distance.Between(position.x, position.y, this.start.x, this.start.y);
    const finalPosition = releaseDistance > 8 ? position : fallback;
    this.finish(finalPosition.x, finalPosition.y);
  }

  private nativePointerUp = (): void => {
    if (!this.start || this.activeTouchId !== undefined) return;
    const position = this.path[this.path.length - 1] ?? this.lastPosition;
    this.finish(position.x, position.y);
  };

  private touchStart = (event: TouchEvent): void => {
    if (event.changedTouches.length === 0) return;
    const touch = event.changedTouches[0];
    if (this.start) {
      this.activeTouchId = touch.identifier;
      event.preventDefault();
      return;
    }
    const position = this.worldPositionFromClient(touch.clientX, touch.clientY);
    if (!this.begin(position)) return;
    this.activeTouchId = touch.identifier;
    event.preventDefault();
  };

  private touchMove = (event: TouchEvent): void => {
    if (!this.start) return;
    const touch = this.activeTouchId === undefined ? event.touches.item(0) : this.findTouch(event.touches);
    if (!touch) return;
    const position = this.worldPositionFromClient(touch.clientX, touch.clientY);
    this.updatePath(position);
    event.preventDefault();
  };

  private touchEnd = (event: TouchEvent): void => {
    if (!this.start) return;
    const touch = this.activeTouchId === undefined ? event.changedTouches.item(0) : this.findTouch(event.changedTouches);
    const position = touch ? this.worldPositionFromClient(touch.clientX, touch.clientY) : this.path[this.path.length - 1] ?? this.lastPosition;
    this.finish(position.x, position.y);
    event.preventDefault();
  };

  private findTouch(touches: TouchList): Touch | undefined {
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches.item(i);
      if (touch?.identifier === this.activeTouchId) return touch ?? undefined;
    }
    return undefined;
  }

  private finish(x: number, y: number): void {
    if (!this.start) return;
    const start = this.start;
    let dx = x - start.x;
    let dy = y - start.y;
    if ((Math.hypot(dx, dy) < 42 || dy >= -18) && this.path.length > 1) {
      const best = this.path.reduce((bestPoint, point) => {
        const bestDy = bestPoint.y - start.y;
        const pointDy = point.y - start.y;
        const bestDistance = Phaser.Math.Distance.Between(bestPoint.x, bestPoint.y, start.x, start.y);
        const pointDistance = Phaser.Math.Distance.Between(point.x, point.y, start.x, start.y);
        if (pointDy < bestDy - 4) return point;
        if (pointDy <= bestDy + 4 && pointDistance > bestDistance) return point;
        return bestPoint;
      });
      dx = best.x - start.x;
      dy = best.y - start.y;
    }
    const distance = Math.hypot(dx, dy);
    const duration = Math.max(80, this.scene.time.now - start.time);
    const middle = this.path[Math.floor(this.path.length / 2)] ?? new Phaser.Math.Vector2(start.x + dx / 2, start.y + dy / 2);
    const progress = Phaser.Math.Clamp((start.y - middle.y) / Math.max(1, -dy), 0, 1);
    const expectedX = start.x + dx * progress;
    const curve = Phaser.Math.Clamp((middle.x - expectedX) / 65, -1, 1);
    this.start = undefined; this.activePointerId = undefined; this.activeTouchId = undefined; this.path = []; this.guide.clear();
    if (distance >= 42 && dy < -18) {
      this.onShot({ dx, dy, distance, duration, curve });
      try {
        if (typeof navigator.vibrate === 'function') navigator.vibrate(12);
      } catch { /* Haptics are optional and must never block gameplay. */ }
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.pointerDown, this);
    this.scene.input.off('pointermove', this.pointerMove, this);
    this.scene.input.off('pointerup', this.pointerUp, this);
    this.scene.input.off('pointerupoutside', this.pointerUp, this);
    window.removeEventListener('pointerup', this.nativePointerUp, true);
    window.removeEventListener('pointercancel', this.nativePointerUp, true);
    this.scene.game.canvas.removeEventListener('touchstart', this.touchStart, true);
    window.removeEventListener('touchmove', this.touchMove, true);
    window.removeEventListener('touchend', this.touchEnd, true);
    window.removeEventListener('touchcancel', this.touchEnd, true);
    this.guide.destroy();
  }
}
