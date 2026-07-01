export const DISPLAY_FONT = '"Barlow Condensed", sans-serif';
export const BODY_FONT = 'Manrope, sans-serif';

export const textStyles = {
  display: { fontFamily: DISPLAY_FONT, fontStyle: 'bold', color: '#f7fbff' },
  body: { fontFamily: BODY_FONT, color: '#f7fbff' },
  muted: { fontFamily: BODY_FONT, color: '#8aa0ad' }
} as const;
