import { useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeightChart } from '@/components/charts/WeightChart';
import { AppText, Button, Card, Icon } from '@/components/ui';
import { useWeights } from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

const GOAL = 72.0;
const RANGES = ['Week', 'Month', 'All'] as const;
type Range = (typeof RANGES)[number];
const SCREEN_PAD = 18;
const CARD_PAD = 18;

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function WeightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [range, setRange] = useState<Range>('Month');
  const { data: weights = [], isLoading, isError, refetch } = useWeights();

  const header = (
    <AppText variant="title" style={{ paddingHorizontal: 2 }}>
      Weight
    </AppText>
  );

  const wrap = (children: ReactNode) => (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: SCREEN_PAD, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {header}
        {children}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return wrap(
      <View style={{ paddingTop: 80, alignItems: 'center' }}>
        <ActivityIndicator color={colors.green} />
      </View>,
    );
  }

  if (isError) {
    return wrap(
      <View style={{ paddingTop: 60, alignItems: 'center', gap: 12 }}>
        <Icon name="cloud-off" size={36} color={colors.mutedSoft} />
        <AppText variant="bodyMuted" color={colors.muted} style={{ textAlign: 'center' }}>
          Couldn&apos;t reach the server.{'\n'}Is the API running?
        </AppText>
        <Button title="Retry" variant="tonal" onPress={() => refetch()} />
      </View>,
    );
  }

  if (weights.length === 0) {
    return wrap(
      <View style={{ paddingTop: 50, alignItems: 'center', gap: 14 }}>
        <Icon name="monitor-weight" size={40} color={colors.mutedSoft} />
        <AppText variant="bodyMuted" color={colors.muted}>
          No weigh-ins yet. Add your first.
        </AppText>
        <Button title="Add weight" icon="add" onPress={() => router.push('/add-weight')} />
      </View>,
    );
  }

  const points = weights.map((w) => ({ label: fmt(w.date), kg: w.valueKg }));
  const data = range === 'Week' ? points.slice(-7) : points;
  const chartWidth = Dimensions.get('window').width - SCREEN_PAD * 2 - CARD_PAD * 2;

  const start = weights[0]!.valueKg;
  const current = weights[weights.length - 1]!.valueKg;
  const lost = +(start - current).toFixed(1);
  const toGoal = +(current - GOAL).toFixed(1);

  const stats = [
    { label: 'TOTAL LOST', value: `${lost} kg` },
    { label: 'TO GOAL', value: `${toGoal} kg` },
    { label: 'ENTRIES', value: `${weights.length}` },
    { label: 'GOAL', value: `${GOAL.toFixed(1)} kg` },
  ];

  const history = weights
    .map((w, i) => ({ ...w, delta: i === 0 ? 0 : +(w.valueKg - weights[i - 1]!.valueKg).toFixed(1) }))
    .slice(-6)
    .reverse();

  return wrap(
    <>
      {/* hero */}
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
              <Icon name={lost >= 0 ? 'south' : 'north'} size={16} color={colors.green} />
              <AppText variant="itemTitle" color={colors.green}>
                {Math.abs(lost)} kg
              </AppText>
            </View>
            <AppText variant="caption" color={colors.muted}>
              since start
            </AppText>
          </View>
        </View>
      </Card>

      {/* chart */}
      <Card style={{ marginTop: 14, padding: CARD_PAD }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 12 }}>
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <Pressable key={r} onPress={() => setRange(r)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: active ? colors.sage : 'transparent' }}>
                <AppText variant="caption" color={active ? colors.green : colors.muted}>
                  {r}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <WeightChart data={data} goalKg={GOAL} width={chartWidth} />
      </Card>

      {/* stats */}
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

      {/* add (demo value until the entry sheet — WGT-1) */}
      <Button title="Add weigh-in" icon="add" onPress={() => router.push('/add-weight')} style={{ marginTop: 16 }} />

      {/* history */}
      <AppText variant="label" color={colors.muted} style={{ marginTop: 24, marginBottom: 10, paddingHorizontal: 4 }}>
        HISTORY
      </AppText>
      <Card style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
        {history.map((h, i) => (
          <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.divider }}>
            <AppText variant="bodyMuted" color={colors.muted} style={{ flex: 1 }}>
              {fmt(h.date)}
            </AppText>
            <AppText variant="itemTitle" color={colors.ink} style={{ marginRight: 12 }}>
              {h.valueKg.toFixed(1)} kg
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
    </>,
  );
}
