import { View, type ViewProps } from 'react-native';

import { colors, radius, shadows } from '@/theme';

/** White rounded surface with the soft Fresh Sage elevation. */
export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: colors.surface, borderRadius: radius.card, ...shadows.card },
        style,
      ]}
    />
  );
}
