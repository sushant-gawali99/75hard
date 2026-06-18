import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme';

/** Temporary screen stand-in until the real screen is built. */
export function ScreenPlaceholder({ title, subtitle = 'Coming soon' }: { title: string; subtitle?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <AppText variant="title" color={colors.ink}>
        {title}
      </AppText>
      <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 8 }}>
        {subtitle}
      </AppText>
    </View>
  );
}
