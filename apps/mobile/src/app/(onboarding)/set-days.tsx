import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const PRESETS = [21, 30, 60, 75, 90];

export default function SetDaysScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [days, setDays] = useState(75);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, paddingTop: insets.top + 8 }}>
      {/* app bar */}
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
          <View style={{ width: '33%', height: '100%', backgroundColor: colors.green, borderRadius: 3 }} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          Step 1 of 3
        </AppText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: insets.bottom + 20 }}>
        <View style={{ marginTop: 32 }}>
          <AppText variant="title" color={colors.ink} style={{ fontSize: 26, lineHeight: 32 }}>
            How many days will you commit?
          </AppText>
          <AppText variant="bodyStrong" color={colors.muted} style={{ marginTop: 12, fontSize: 15 }}>
            Choose a window you'll show up for — every single day.
          </AppText>
        </View>

        {/* big number + stepper */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <Pressable onPress={() => setDays((d) => Math.max(7, d - 1))} hitSlop={10}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="remove" size={24} color={colors.ink} />
              </View>
            </Pressable>
            <View style={{ alignItems: 'center', width: 130 }}>
              <AppText variant="display" color={colors.green} style={{ fontSize: 72, lineHeight: 76 }}>
                {days}
              </AppText>
              <AppText variant="label" color={colors.muted}>
                DAYS
              </AppText>
            </View>
            <Pressable onPress={() => setDays((d) => Math.min(365, d + 1))} hitSlop={10}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="add" size={24} color={colors.ink} />
              </View>
            </Pressable>
          </View>

          {/* presets */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PRESETS.map((p) => {
              const active = p === days;
              return (
                <Pressable
                  key={p}
                  onPress={() => setDays(p)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: radius.pill,
                    backgroundColor: active ? colors.green : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.green : colors.sageBorder,
                  }}
                >
                  <AppText variant="itemTitle" color={active ? colors.white : colors.ink}>
                    {p}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <AppText variant="caption" color={colors.mutedSoft} style={{ textAlign: 'center', marginBottom: spacing.lg }}>
          Choose with intention — this sets your whole journey.
        </AppText>
        {/* TODO: route to /define-rules once that screen exists */}
        <Button title="Continue" onPress={() => router.push('/')} />
      </View>
    </View>
  );
}
