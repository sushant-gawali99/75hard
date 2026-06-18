/**
 * Fresh Sage palette — exact values from the claude.ai/design export (design-export/Today.dc.html).
 * Single source of truth for color across the app.
 */
export const colors = {
  // Surfaces
  appBg: '#F4F8F1',
  surface: '#FFFFFF',
  sage: '#EAF3E7', // soft sage fill (philosophy banner, icon chips)
  sageBorder: '#DCEBD6',

  // Brand
  green: '#21B96B',
  gradientStart: '#2BC56F',
  gradientEnd: '#16C2A6',

  // Text
  ink: '#23332A',
  inkSoft: '#3A4A40',
  muted: '#7C9080',
  mutedSoft: '#A6B6A8',

  // Accents
  amber: '#E0A33A', // streak flame
  amberText: '#B97E22',
  amberChipBg: '#FBF1DD',
  amberChipBorder: '#F2E2C2',
  clay: '#D9806A', // missed / alert (gentle)

  // Tracks & dividers
  track: '#DBEBD6', // ring track, progress track
  divider: '#EEF3EA',
  navBorder: '#E6EFE2',

  // Completion banner
  successBg: '#DCF0D8',
  successBorder: '#C6E6C0',
  successInk: '#1E6B3C',
  successInkSoft: '#4C8A5E',

  white: '#FFFFFF',
} as const;

/** Brand gradient stops (use with expo-linear-gradient). */
export const gradient = [colors.gradientStart, colors.gradientEnd] as const;

/** Page backdrop gradient behind the device frame (mostly marketing/web). */
export const pageGradient = ['#EAF3E7', '#E2EEE0', '#D6E6D2'] as const;

/**
 * Per-rule icon chip palette (from the export). Each habit/rule picks one;
 * `grad` is used to fill the checkbox when the rule is done.
 */
export const ruleIconPalettes = {
  water: { icon: '#0E8FE0', chipBg: '#DCEEFC', grad: ['#36C0F5', '#0E8FE0'], glow: 'rgba(14,143,224,0.55)' },
  green: { icon: '#13B85F', chipBg: '#DFF4E5', grad: ['#1FD976', '#08C2A0'], glow: 'rgba(16,200,150,0.55)' },
  orange: { icon: '#F0992A', chipBg: '#FDEBCF', grad: ['#FFB23E', '#F2715A'], glow: 'rgba(240,140,42,0.55)' },
  purple: { icon: '#6A5CF0', chipBg: '#E8E6FD', grad: ['#8A78FF', '#6A5CF0'], glow: 'rgba(106,92,240,0.55)' },
} as const;

export type RuleIconPalette = keyof typeof ruleIconPalettes;
