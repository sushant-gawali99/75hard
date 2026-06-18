import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Confetti, Icon } from '@/components/ui';
import { colors, gradient, radius, shadows } from '@/theme';

const STATS = [
  { label: 'DAYS', value: '75' },
  { label: 'PERFECT DAYS', value: '71' },
  { label: 'LONGEST STREAK', value: '75' },
  { label: 'WEIGHT LOST', value: '8.6 kg' },
];

export default function MilestoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <LinearGradient colors={['#D7F1E1', '#EAF7EF', colors.appBg]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%' }} />

      {/* celebratory confetti */}
      <Confetti count={90} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
        {/* medal */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }, shadows.fab]}
        >
          <Icon name="check" size={52} color={colors.white} />
        </LinearGradient>

        <AppText variant="display" color={colors.ink} style={{ marginTop: 24, fontSize: 32, textAlign: 'center' }}>
          Day 75. Complete.
        </AppText>
        <AppText variant="bodyStrong" color={colors.muted} style={{ marginTop: 10, fontSize: 15, textAlign: 'center' }}>
          You followed the process — every single day.
        </AppText>

        {/* summary */}
        <Card style={{ width: '100%', padding: 18, marginTop: 28, flexDirection: 'row', flexWrap: 'wrap' }}>
          {STATS.map((s, i) => (
            <View key={s.label} style={{ width: '50%', paddingVertical: 10, alignItems: 'center', borderTopWidth: i >= 2 ? 1 : 0, borderTopColor: colors.divider }}>
              <AppText variant="stat" color={i === 3 ? colors.green : colors.ink}>
                {s.value}
              </AppText>
              <AppText variant="label" color={colors.muted} style={{ marginTop: 4 }}>
                {s.label}
              </AppText>
            </View>
          ))}
        </Card>

        {/* actions */}
        <View style={{ width: '100%', marginTop: 28, gap: 10 }}>
          <Button title="Start a new challenge" onPress={() => router.replace('/set-days')} />
          <Button title="Share my progress" variant="tonal" icon="ios-share" onPress={() => {}} />
          <Button title="Back to home" variant="text" onPress={() => router.replace('/')} />
        </View>
      </View>
    </View>
  );
}
