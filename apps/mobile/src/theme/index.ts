/**
 * Fresh Sage design system — the single import surface for theme tokens.
 *   import { colors, typography, spacing, radius, shadows, gradient } from '@/theme';
 */
export { colors, gradient, pageGradient, ruleIconPalettes } from './colors';
export type { RuleIconPalette } from './colors';
export { fontFamily, typography } from './typography';
export type { TypographyToken } from './typography';
export { spacing, radius, shadows } from './layout';
export { useAppFonts, fontsToLoad } from './fonts';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius, shadows } from './layout';

/** Convenience bundle. */
export const theme = { colors, typography, spacing, radius, shadows } as const;
