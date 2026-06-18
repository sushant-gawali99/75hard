import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, Icon, type IconName } from '@/components/ui';
import { useRules, useStreaks } from '@/lib/queries';
import { colors, radius, ruleIconPalettes, spacing, type RuleIconPalette } from '@/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HEAT = ['#BFE3B4', '#8FD392', '#5CC376', '#21B96B'];

type Cell = { day: number; pct: number; missed: boolean; future: boolean; today: boolean } | null;

// NOTE: calendar uses sample completion data until a per-day aggregate endpoint exists.
function buildMonth(): { label: string; weeks: Cell[][] } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Cell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const future = d > today;
    const seed = (d * 37) % 100;
    const missed = !future && seed < 12;
    const pct = future || missed ? 0 : 45 + (seed % 56);
    cells.push({ day: d, pct, missed, future, today: d === today });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { label: now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), weeks };
}

function heatColor(pct: number): string {
  if (pct >= 85) return HEAT[3]!;
  if (pct >= 70) return HEAT[2]!;
  if (pct >= 55) return HEAT[1]!;
  return HEAT[0]!;
}

export default function StreaksScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'rules' | 'calendar'>('rules');
  const { data: rules = [], isLoading } = useRules();
  const { data: streaks } = useStreaks();
  const month = buildMonth();

  const byRule = new Map((streaks?.rules ?? []).map((s) => [s.ruleId, s]));
  const hero = [
    { label: 'CURRENT', value: streaks?.overall.current ?? 0, accent: true },
    { label: 'LONGEST', value: streaks?.overall.longest ?? 0, accent: false },
    { label: 'PERFECT DAYS', value: streaks?.overall.perfectDays ?? 0, accent: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" style={{ paddingHorizontal: 2 }}>
          Your consistency
        </AppText>

        {/* hero stats */}
        <Card style={{ marginTop: 14, padding: 18, flexDirection: 'row' }}>
          {hero.map((s, i) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: colors.divider }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {s.accent ? <Icon name="local-fire-department" size={20} color={colors.amber} /> : null}
                <AppText variant="stat" color={s.accent ? colors.green : colors.ink}>
                  {s.value}
                </AppText>
              </View>
              <AppText variant="label" color={colors.muted} style={{ marginTop: 4 }}>
                {s.label}
              </AppText>
            </View>
          ))}
        </Card>

        {/* segmented control */}
        <View style={{ flexDirection: 'row', marginTop: 18, backgroundColor: colors.sage, borderRadius: radius.pill, padding: 4 }}>
          {(['rules', 'calendar'] as const).map((key) => {
            const active = view === key;
            return (
              <Pressable
                key={key}
                onPress={() => setView(key)}
                style={{ flex: 1, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.surface : 'transparent' }}
              >
                <AppText variant="caption" color={active ? colors.green : colors.muted} style={{ fontSize: 13 }}>
                  {key === 'rules' ? 'By rule' : 'Calendar'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {view === 'rules' ? (
          isLoading ? (
            <View style={{ paddingTop: 40, alignItems: 'center' }}>
              <ActivityIndicator color={colors.green} />
            </View>
          ) : rules.length === 0 ? (
            <AppText variant="bodyMuted" color={colors.muted} style={{ textAlign: 'center', marginTop: 40 }}>
              No rules yet — add some to build streaks.
            </AppText>
          ) : (
            <View style={{ marginTop: 16, gap: 12 }}>
              {rules.map((r) => {
                const p = ruleIconPalettes[r.palette as RuleIconPalette];
                const s = byRule.get(r.id);
                return (
                  <Card key={r.id} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.icon as IconName} size={22} color={p.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="itemTitle">{r.name}</AppText>
                      <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
                        Longest {s?.longest ?? 0} days
                      </AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="local-fire-department" size={20} color={colors.amber} />
                      <AppText variant="stat" color={colors.ink} style={{ fontSize: 20 }}>
                        {s?.current ?? 0}
                      </AppText>
                    </View>
                  </Card>
                );
              })}
            </View>
          )
        ) : (
          <Card style={{ marginTop: 16, padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Icon name="chevron-left" size={24} color={colors.muted} />
              <AppText variant="heading" style={{ fontSize: 16 }}>
                {month.label}
              </AppText>
              <Icon name="chevron-right" size={24} color={colors.muted} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              {WEEKDAYS.map((w, i) => (
                <AppText key={i} variant="caption" color={colors.mutedSoft} style={{ flex: 1, textAlign: 'center' }}>
                  {w}
                </AppText>
              ))}
            </View>
            {month.weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: 'row', marginTop: 6 }}>
                {week.map((c, di) => (
                  <View key={di} style={{ flex: 1, alignItems: 'center' }}>
                    {c === null ? (
                      <View style={{ width: 34, height: 34 }} />
                    ) : (
                      <View style={{ width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: c.future ? 'transparent' : c.missed ? colors.clay : heatColor(c.pct), borderWidth: c.future ? 1 : c.today ? 2 : 0, borderColor: c.today ? colors.green : colors.track }}>
                        <AppText variant="caption" color={c.future ? colors.mutedSoft : c.pct >= 55 || c.missed ? colors.white : colors.ink} style={{ fontSize: 11 }}>
                          {c.day}
                        </AppText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
            <AppText variant="caption" color={colors.mutedSoft} style={{ marginTop: 14, textAlign: 'center' }}>
              Calendar shows sample data (per-day endpoint coming).
            </AppText>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
