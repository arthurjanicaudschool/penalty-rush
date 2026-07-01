const readInset = (name: string): number => {
  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.paddingTop = `env(${name})`;
  document.body.appendChild(probe);
  const value = parseFloat(window.getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return value;
};

export const getSafeArea = (): { top: number; bottom: number; left: number; right: number } => ({
  top: readInset('safe-area-inset-top'),
  bottom: readInset('safe-area-inset-bottom'),
  left: readInset('safe-area-inset-left'),
  right: readInset('safe-area-inset-right')
});
