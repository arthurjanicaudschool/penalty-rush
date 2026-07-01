type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export const requestAppFullscreen = (): void => {
  const element = document.documentElement as FullscreenElement;
  try {
    if (element.requestFullscreen) {
      void element.requestFullscreen({ navigationUI: 'hide' });
      return;
    }
    if (element.webkitRequestFullscreen) {
      void element.webkitRequestFullscreen();
    }
  } catch {
    /* Fullscreen is a progressive enhancement on mobile browsers. */
  }
};
