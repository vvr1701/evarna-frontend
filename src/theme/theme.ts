// theme.ts — Whisper design tokens, ported verbatim from system.jsx `W`.
// Fonts: Manrope (companion/display) + Outfit (user/body).

export const W = {
  // Surfaces
  bg: '#0F111A',
  surface1: '#1A1D2E',
  surface2: '#252836',
  // Brand
  primary: '#7C72FF',
  primaryDim: 'rgba(124,114,255,0.15)',
  secondary: '#C4B5FD',
  accent: '#5EEAD4',
  accentDim: 'rgba(94,234,212,0.15)',
  // Text
  text: '#F0F0F5',
  text2: '#8B8FA3',
  text3: 'rgba(139,143,163,0.6)',
  // Status
  danger: '#F87171',
  // Archetype accents
  mentor: '#60A5FA',
  friend: '#34D399',
  partner: '#FB7185',
  challenger: '#FBBF24',
  // Fonts — registered in App.tsx via expo-font
  fontComp: 'Manrope', // companion / display
  fontUser: 'Outfit', // user / body / labels
  fontMono: 'JetBrainsMono',
} as const;

// Specific weighted font families. RN doesn't synthesize weight from a single
// family the way the web does, so we map fontWeight -> a concrete loaded face.
export const fonts = {
  comp: {
    400: 'Manrope_400Regular',
    500: 'Manrope_500Medium',
    600: 'Manrope_600SemiBold',
    700: 'Manrope_700Bold',
  },
  user: {
    400: 'Outfit_400Regular',
    500: 'Outfit_500Medium',
    600: 'Outfit_600SemiBold',
    700: 'Outfit_700Bold',
  },
} as const;

export type FontFamily = 'comp' | 'user';
export type FontWeightKey = 400 | 500 | 600 | 700;

// Resolve a {family, weight} into the concrete RN font family string.
export function resolveFont(family: FontFamily, weight: FontWeightKey = 400): string {
  return fonts[family][weight];
}

// Phone viewport reference (used by some fixed-size layouts in the prototype)
export const PHONE = { w: 390, h: 844 } as const;

// ─── Color helpers ─────────────────────────────────────────────────────────
// The prototype frequently appends 2-hex-digit alpha to 6-digit hex colors,
// e.g. `${accent}40` or `${tint}00`. These helpers reproduce that exactly.

/** Append an 8-bit alpha (0-255) to a #RRGGBB color as #RRGGBBAA. */
export function withAlphaByte(hex: string, byte: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(byte)));
  return `${hex}${clamped.toString(16).padStart(2, '0')}`;
}

/** Append a 2-char hex alpha suffix (e.g. '40', '1f', '00') to a hex color. */
export function alpha(hex: string, suffix: string): string {
  return `${hex}${suffix}`;
}

/** Convert opacity 0..1 to the equivalent #RRGGBBAA on a #RRGGBB base. */
export function hexWithOpacity(hex: string, opacity: number): string {
  return withAlphaByte(hex, opacity * 255);
}
