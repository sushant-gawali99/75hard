/**
 * Type system. Family names match the loaded fonts in fonts.ts.
 * letterSpacing/lineHeight are in px (RN units), converted from the export's em values.
 */
import type { TextStyle } from 'react-native';

export const fontFamily = {
  // Plus Jakarta Sans
  jakarta: 'PlusJakartaSans_400Regular',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaSemibold: 'PlusJakartaSans_600SemiBold',
  jakartaBold: 'PlusJakartaSans_700Bold',
  jakartaExtrabold: 'PlusJakartaSans_800ExtraBold',
  // Inter
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemibold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
} as const;

/** Named text styles used across screens. */
export const typography = {
  /** Big ring number / hero numerals (Day 41). */
  display: { fontFamily: fontFamily.jakartaExtrabold, fontSize: 38, letterSpacing: -1.1, lineHeight: 40 },
  /** Screen greeting / page titles. */
  title: { fontFamily: fontFamily.jakartaExtrabold, fontSize: 23, letterSpacing: -0.45, lineHeight: 27 },
  /** Section / card headlines. */
  heading: { fontFamily: fontFamily.jakartaBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 23 },
  /** Stat numbers (streak 41). */
  stat: { fontFamily: fontFamily.jakartaExtrabold, fontSize: 24, letterSpacing: -0.5, lineHeight: 28 },
  /** Card item title (habit name). */
  itemTitle: { fontFamily: fontFamily.jakartaBold, fontSize: 14.5, letterSpacing: -0.15, lineHeight: 19 },
  /** Emphasis body (philosophy banner). */
  bodyStrong: { fontFamily: fontFamily.jakartaSemibold, fontSize: 14.5, letterSpacing: -0.15, lineHeight: 21 },
  /** Default body. */
  body: { fontFamily: fontFamily.inter, fontSize: 14, lineHeight: 20 },
  /** Secondary / supporting text. */
  bodyMuted: { fontFamily: fontFamily.interMedium, fontSize: 13, lineHeight: 18 },
  /** Small uppercase section labels (TODAY'S PROCESS). */
  label: { fontFamily: fontFamily.interBold, fontSize: 11, letterSpacing: 1.5, lineHeight: 14 },
  /** Tiny caption. */
  caption: { fontFamily: fontFamily.interSemibold, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
