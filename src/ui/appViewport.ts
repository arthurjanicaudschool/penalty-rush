export const updateAppHeight = (): void => {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
};

export const setupAppViewport = (): void => {
  updateAppHeight();
  window.addEventListener('resize', updateAppHeight, { passive: true });
  window.addEventListener('orientationchange', updateAppHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', updateAppHeight, { passive: true });
  window.visualViewport?.addEventListener('scroll', updateAppHeight, { passive: true });
  window.addEventListener('pageshow', updateAppHeight, { passive: true });
};
