import type { GameResult } from '../game/types';
import { getCountry } from '../game/config/countries';

const makeCard = (result: GameResult): Promise<Blob> => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d'); if (!ctx) return reject(new Error('Canvas indisponible'));
  const gradient = ctx.createLinearGradient(0, 0, 0, 1350); gradient.addColorStop(0, '#164b3c'); gradient.addColorStop(1, '#071a17');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = 'rgba(102,242,177,.13)'; ctx.lineWidth = 3;
  for (let x = -200; x < 1200; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 350, 1350); ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f7fff9'; ctx.font = '900 104px Arial'; ctx.fillText('PENALTY', 540, 225);
  ctx.fillStyle = '#f4ff61'; ctx.font = '900 132px Arial'; ctx.fillText('RUSH', 540, 345);
  ctx.fillStyle = '#92aaa3'; ctx.font = '700 32px Arial'; ctx.fillText('5 TIRS · UN SCORE · DÉFENDS TON PAYS', 540, 420);
  ctx.fillStyle = '#102b26'; ctx.beginPath(); ctx.roundRect(100, 510, 880, 530, 45); ctx.fill();
  ctx.fillStyle = '#f7fff9'; ctx.font = '900 160px Arial'; ctx.fillText(`${result.goals}/5`, 540, 730);
  ctx.fillStyle = '#92aaa3'; ctx.font = '700 34px Arial'; ctx.fillText('PENALTIES MARQUÉS', 540, 790);
  ctx.fillStyle = '#f4ff61'; ctx.font = '900 94px Arial'; ctx.fillText(new Intl.NumberFormat('fr-FR').format(result.score), 540, 920);
  ctx.fillStyle = '#f7fff9'; ctx.font = '700 34px Arial'; ctx.fillText(`${getCountry(result.country).name}  ·  ${result.accuracy}% de précision`, 540, 985);
  ctx.fillStyle = '#66f2b1'; ctx.font = '800 36px Arial'; ctx.fillText('TU FAIS MIEUX ?', 540, 1165);
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Export impossible')), 'image/png');
});

export const shareResult = async (result: GameResult): Promise<'shared' | 'downloaded' | 'copied'> => {
  const text = `J’ai marqué ${result.goals}/5 penalties et fait ${new Intl.NumberFormat('fr-FR').format(result.score)} points sur Penalty Rush. Tu fais mieux ?`;
  const blob = await makeCard(result);
  const file = new File([blob], 'penalty-rush-result.png', { type: 'image/png' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) { await navigator.share({ title: 'Penalty Rush', text, files: [file] }); return 'shared'; }
  if (navigator.clipboard) { await navigator.clipboard.writeText(text); return 'copied'; }
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = file.name; link.click(); URL.revokeObjectURL(link.href); return 'downloaded';
};
