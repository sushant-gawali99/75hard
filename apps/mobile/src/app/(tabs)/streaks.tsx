import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, Icon, type IconName } from '@/components/ui';
import { colors, radius, ruleIconPalettes, spacing, type RuleIconPalette } from '@/theme';

type RuleStat = { name: string; icon: IconName; palette: RuleIconPalette; current: number; longest: number; last7: boolean[] };

const RULES: RuleStat[] = [
  { name: 'Drink 3L of water', icon: 'water-drop', palette: 'water', current: 41, longest: 52, last7: [true, true, true, true, true, true, true] },
  { name: 'Walk 30 minutes', icon: 'directions-walk', palette: 'green', current: 28, longest: 40, last7: [true, true, false, true, true, true, true] },
  { name: 'No sugar after 7pm', icon: 'cookie', palette: 'orange', current: 12, longest: 30, last7: [false, true, true, true, false, true, true] },
  { name: 'Lights out by 11pm', icon: 'bedtime', palette: 'purple', current: 41, longest: 41, last7: [true, true, true, true, true, true, false] },
];

const HERO = [
  { label: 'CURRENT', value: 41, accent: true },
  { label: 'LONGEST', value: 52, accent: false },
  { label: 'PERFECT DAYS', value: 38, accent: false },
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HEAT = ['#BFE3B4', '#8FD392', '#5CC376', '#21B96B'];

type Cell = { day: number; pct: number; missed: boolean; future: boolean; today: boolean } | null;

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

  const label = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return { label, weeks };
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
  const month = buildMonth();

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
          {HERO.map((s, i) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                alignItems: 'center',
                borderLeftWidth: i === 0 ? 0 : 1,
                borderLeftColor: colors.divider,
              }}
            >
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
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? colors.surface : 'transparent',
                  ...(active ? { shadowColor: '#285037', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {}),
                }}
              >
                <AppText variant="caption" color={active ? colors.green : colors.muted} style={{ fontSize: 13 }}>
                  {key === 'rules' ? 'By rule' : 'Calendar'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {view === 'rules' ? (
          <View style={{ marginTop: 16, gap: 12 }}>
            {RULES.map((r) => {
              const p = ruleIconPalettes[r.palette];
              return (
                <Card key={r.name} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.icon} size={22} color={p.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="itemTitle">{r.name}</AppText>
                      <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
                        Longest {r.longest} days
                      </AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="local-fire-department" size={20} color={colors.amber} />
                      <AppText variant="stat" color={colors.ink} style={{ fontSize: 20 }}>
                        {r.current}
                      </AppText>
                    </View>
                  </View>
                  {/* last 7 days */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
                    {r.last7.map((d, i) => (
                      <View
                        key={i}
                        style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: d ? colors.green : colors.track }}
                      />
                    ))}
                  </View>
                </Card>
              );
            })}
          </View>
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
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: c.future ? 'transparent' : c.missed ? colors.clay : heatColor(c.pct),
                          borderWidth: c.future ? 1 : c.today ? 2 : 0,
                          borderColor: c.today ? colors.green : colors.track,
                        }}
                      >
                        <AppText
                          variant="caption"
                          color={c.future ? colors.mutedSoft : c.pct >= 55 || c.missed ? colors.white : colors.ink}
                          style={{ fontSize: 11 }}
                        >
                          {c.day}
                        </AppText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}

            {/* legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <AppText variant="caption" color={colors.muted}>
                Less
              </AppText>
              {[colors.track, ...HEAT].map((c, i) => (
                <View key={i} style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: c }} />
              ))}
              <AppText variant="caption" color={colors.muted}>
                More
              </AppText>
              <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.clay, marginLeft: 8 }} />
              <AppText variant="caption" color={colors.muted}>
                Missed
              </AppText>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
