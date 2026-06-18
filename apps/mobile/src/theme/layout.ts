/**
 * Spacing (8pt grid), corner radii, and elevation tokens — from the export.
 */
import type { ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 18,
  xl: 20,
  card: 24,
  pill: 100,
  full: 9999,
} as const;

/** Soft, green-tinted elevation. Cross-platform (iOS shadow* + Android elevation). */
export const shadows = {
  card: {
    shadowColor: '#285037',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  fab: {
    shadowColor: '#16C2A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;
