export interface Country {
  code: string;
  name: string;
  colors: [number, number];
  points: number;
}

export const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', colors: [0x2457d6, 0xf24455], points: 12_480_300 },
  { code: 'BR', name: 'Brésil', colors: [0x1ca55b, 0xffdc48], points: 15_920_120 },
  { code: 'AR', name: 'Argentine', colors: [0x70c5e8, 0xffffff], points: 14_310_900 },
  { code: 'PT', name: 'Portugal', colors: [0x19714c, 0xd84444], points: 9_230_420 },
  { code: 'ES', name: 'Espagne', colors: [0xe94343, 0xffc94a], points: 8_880_100 },
  { code: 'SN', name: 'Sénégal', colors: [0x1e9c58, 0xffd45b], points: 5_120_820 },
  { code: 'MA', name: 'Maroc', colors: [0xb82e3e, 0x43a66c], points: 7_510_600 },
  { code: 'DZ', name: 'Algérie', colors: [0x2e9a66, 0xffffff], points: 6_230_750 },
  { code: 'JP', name: 'Japon', colors: [0xf6f6f6, 0xe3445c], points: 6_910_080 },
  { code: 'EN', name: 'Angleterre', colors: [0xffffff, 0xc83e4d], points: 10_110_500 }
];

export const getCountry = (code: string) => COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
