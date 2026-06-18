import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, Icon, ProgressRing } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const BUDGET = 2000;
const EATEN = 1420;

const MACROS = [
  { label: 'Protein', value: 92, target: 120, color: colors.green },
  { label: 'Carbs', value: 140, target: 220, color: colors.gradientEnd },
  { label: 'Fat', value: 48, target: 65, color: colors.amber },
];

type Meal = { name: string; kcal: number; time: string; score: number };
const SECTIONS: { title: string; meals: Meal[] }[] = [
  { title: 'Breakfast', meals: [{ name: 'Oatmeal & berries', kcal: 320, time: '8:10 AM', score: 88 }] },
  { title: 'Lunch', meals: [{ name: 'Chicken salad bowl', kcal: 540, time: '1:05 PM', score: 84 }] },
  { title: 'Dinner', meals: [] },
  { title: 'Snacks', meals: [{ name: 'Greek yogurt', kcal: 150, time: '4:30 PM', score: 79 }] },
];

function band(score: number) {
  if (score >= 75) return { bg: colors.sage, fg: colors.green };
  if (score >= 50) return { bg: colors.amberChipBg, fg: colors.amberText };
  return { bg: '#FBE6E0', fg: colors.clay };
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, value / target);
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <AppText variant="caption" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="caption" color={colors.ink}>
          {value} / {target} g
        </AppText>
      </View>
      <View style={{ height: 7, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct * 100}%`, borderRadius: radius.pill, backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const left = BUDGET - EATEN;
  const dailyScore = 82;
  const sb = band(dailyScore);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" style={{ paddingHorizontal: 2 }}>
          Meals
        </AppText>

        {/* date strip */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          {days.map((d, i) => {
            const today = i === days.length - 1;
            return (
              <View
                key={i}
                style={{
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderRadius: radius.lg,
                  backgroundColor: today ? colors.green : 'transparent',
                }}
              >
                <AppText variant="caption" color={today ? 'rgba(255,255,255,0.85)' : colors.muted} style={{ fontSize: 10 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]}
                </AppText>
                <AppText variant="itemTitle" color={today ? colors.white : colors.ink} style={{ fontSize: 14 }}>
                  {d.getDate()}
                </AppText>
              </View>
            );
          })}
        </View>

        {/* daily summary */}
        <Card style={{ marginTop: 14, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <ProgressRing size={120} stroke={11} radius={50} progress={EATEN / BUDGET}>
              <AppText variant="stat" color={colors.ink} style={{ fontSize: 22 }}>
                {EATEN.toLocaleString()}
              </AppText>
              <AppText variant="caption" color={colors.muted} style={{ fontSize: 10 }}>
                of {BUDGET.toLocaleString()}
              </AppText>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <AppText variant="label" color={colors.muted}>
                    LEFT
                  </AppText>
                  <AppText variant="stat" color={colors.green}>
                    {left.toLocaleString()}
                  </AppText>
                </View>
                <View style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, backgroundColor: sb.bg }}>
                  <AppText variant="stat" color={sb.fg} style={{ fontSize: 22 }}>
                    {dailyScore}
                  </AppText>
                  <AppText variant="caption" color={sb.fg} style={{ fontSize: 10 }}>
                    SCORE
                  </AppText>
                </View>
              </View>
            </View>
          </View>
          {MACROS.map((m) => (
            <MacroBar key={m.label} {...m} />
          ))}
        </Card>

        {/* meals by section */}
        {SECTIONS.map((section) => (
          <Fragment key={section.title}>
            <AppText variant="label" color={colors.muted} style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
              {section.title.toUpperCase()}
            </AppText>
            <Card style={{ paddingHorizontal: 6, paddingVertical: section.meals.length ? 4 : 0 }}>
              {section.meals.length === 0 ? (
                <Pressable
                  onPress={() => router.push('/capture')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 10 }}
                >
                  <Icon name="add-circle-outline" size={22} color={colors.mutedSoft} />
                  <AppText variant="bodyMuted" color={colors.mutedSoft}>
                    Add {section.title.toLowerCase()}
                  </AppText>
                </Pressable>
              ) : (
                section.meals.map((meal, i) => {
                  const mb = band(meal.score);
                  return (
                    <Pressable
                      key={meal.name}
                      onPress={() => router.push('/analysis')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: colors.divider,
                      }}
                    >
                      <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="restaurant" size={22} color={colors.green} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="itemTitle">{meal.name}</AppText>
                        <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
                          {meal.kcal} kcal · {meal.time}
                        </AppText>
                      </View>
                      <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: mb.bg }}>
                        <AppText variant="caption" color={mb.fg}>
                          {meal.score}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </Card>
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
