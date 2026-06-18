import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeightChart, type WeightPoint } from '@/components/charts/WeightChart';
import { AppText, Button, Card, Icon } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const GOAL = 72.0;

const ALL: WeightPoint[] = [
  { label: 'May 19', kg: 80.6 },
  { label: 'May 22', kg: 80.1 },
  { label: 'May 26', kg: 79.4 },
  { label: 'May 30', kg: 78.9 },
  { label: 'Jun 2', kg: 78.3 },
  { label: 'Jun 5', kg: 77.6 },
  { label: 'Jun 8', kg: 77.0 },
  { label: 'Jun 11', kg: 76.3 },
  { label: 'Jun 13', kg: 75.7 },
  { label: 'Jun 15', kg: 75.1 },
  { label: 'Jun 17', kg: 74.6 },
  { label: 'Jun 18', kg: 74.2 },
];

const RANGES = ['Week', 'Month', 'All'] as const;
type Range = (typeof RANGES)[number];

const SCREEN_PAD = 18;
const CARD_PAD = 18;

export default function WeightScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('Month');

  const data = range === 'Week' ? ALL.slice(-7) : ALL;
  const chartWidth = Dimensions.get('window').width - SCREEN_PAD * 2 - CARD_PAD * 2;

  const start = ALL[0]!.kg;
  const current = ALL[ALL.length - 1]!.kg;
  const lost = +(start - current).toFixed(1);
  const toGoal = +(current - GOAL).toFixed(1);

  const stats = [
    { label: 'TOTAL LOST', value: `${lost} kg` },
    { label: 'WEEKLY AVG', value: '-0.5 kg' },
    { label: 'BMI', value: '24.1' },
    { label: 'BEST WEEK', value: '-0.9 kg' },
  ];

  const history = ALL.map((p, i) => ({ ...p, delta: i === 0 ? 0 : +(p.kg - ALL[i - 1]!.kg).toFixed(1) }))
    .slice(-6)
    .reverse();

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: SCREEN_PAD, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" style={{ paddingHorizontal: 2 }}>
          Weight
        </AppText>

        {/* hero stat */}
        <Card style={{ marginTop: 14, padding: 18 }}>
          <AppText variant="label" color={colors.muted}>
            CURRENT
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4 }}>
            <AppText variant="display" color={colors.ink} style={{ fontSize: 40 }}>
              {current.toFixed(1)}
            </AppText>
            <AppText variant="heading" color={colors.muted} style={{ marginBottom: 6 }}>
              kg
            </AppText>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Icon name="south" size={16} color={colors.green} />
                <AppText variant="itemTitle" color={colors.green}>
                  {lost} kg
                </AppText>
              </View>
              <AppText variant="caption" color={colors.muted}>
                since start
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sage }}>
            <AppText variant="caption" color={colors.green}>
              {toGoal} kg to goal ({GOAL.toFixed(1)})
            </AppText>
          </View>
        </Card>

        {/* chart */}
        <Card style={{ marginTop: 14, padding: CARD_PAD }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 12 }}>
            {RANGES.map((r) => {
              const active = r === range;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRange(r)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: radius.pill,
                    backgroundColor: active ? colors.sage : 'transparent',
                  }}
                >
                  <AppText variant="caption" color={active ? colors.green : colors.muted}>
                    {r}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <WeightChart data={data} goalKg={GOAL} width={chartWidth} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <View style={{ width: 14, height: 0, borderTopWidth: 1.5, borderColor: colors.gradientEnd, borderStyle: 'dashed' }} />
            <AppText variant="caption" color={colors.muted}>
              Goal {GOAL.toFixed(1)} kg
            </AppText>
          </View>
        </Card>

        {/* stats grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 12 }}>
          {stats.map((s) => (
            <Card key={s.label} style={{ width: (Dimensions.get('window').width - SCREEN_PAD * 2 - 12) / 2, padding: 16 }}>
              <AppText variant="label" color={colors.muted}>
                {s.label}
              </AppText>
              <AppText variant="stat" color={colors.ink} style={{ marginTop: 4 }}>
                {s.value}
              </AppText>
            </Card>
          ))}
        </View>

        {/* add weight */}
        <Button title="Add today's weight" icon="add" onPress={() => { /* entry sheet: WGT-1 */ }} style={{ marginTop: 16 }} />

        {/* history */}
        <AppText variant="label" color={colors.muted} style={{ marginTop: 24, marginBottom: 10, paddingHorizontal: 4 }}>
          HISTORY
        </AppText>
        <Card style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
          {history.map((h, i) => (
            <View
              key={h.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.divider,
              }}
            >
              <AppText variant="bodyMuted" color={colors.muted} style={{ flex: 1 }}>
                {h.label}
              </AppText>
              <AppText variant="itemTitle" color={colors.ink} style={{ marginRight: 12 }}>
                {h.kg.toFixed(1)} kg
              </AppText>
              {h.delta !== 0 ? (
                <AppText variant="caption" color={h.delta < 0 ? colors.green : colors.clay}>
                  {h.delta > 0 ? '+' : ''}
                  {h.delta}
                </AppText>
              ) : (
                <AppText variant="caption" color={colors.mutedSoft}>
                  —
                </AppText>
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
