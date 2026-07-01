import Phaser from 'phaser';

export const RENDER_SCALE = Math.min(2.5, Math.max(2, window.devicePixelRatio || 1));

export const enableHighDpi = (scene: Phaser.Scene): void => {
  const camera = scene.cameras.main;
  camera.setViewport(0, 0, 390 * RENDER_SCALE, 844 * RENDER_SCALE);
  camera.setZoom(RENDER_SCALE);
  camera.centerOn(195, 422);
  const createText = scene.add.text.bind(scene.add);
  scene.add.text = ((x, y, text, style = {}) => createText(x, y, text, {
    ...style,
    resolution: RENDER_SCALE
  })) as typeof scene.add.text;
};
