import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, Icon, ProgressRing } from '@/components/ui';
import type { MealRow } from '@/lib/api';
import { useMeals, useNutritionTargets } from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

const SECTIONS: { key: string; title: string }[] = [
  { key: 'breakfast', title: 'Breakfast' },
  { key: 'lunch', title: 'Lunch' },
  { key: 'dinner', title: 'Dinner' },
  { key: 'snack', title: 'Snacks' },
];

function band(score: number) {
  if (score >= 75) return { bg: colors.sage, fg: colors.green };
  if (score >= 50) return { bg: colors.amberChipBg, fg: colors.amberText };
  return { bg: '#FBE6E0', fg: colors.clay };
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, target > 0 ? value / target : 0);
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <AppText variant="caption" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="caption" color={colors.ink}>
          {Math.round(value)} / {Math.round(target)} g
        </AppText>
      </View>
      <View style={{ height: 7, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct * 100}%`, borderRadius: radius.pill, backgroundColor: color }} />
      </View>
    </View>
  );
}

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const { data: meals = [], isLoading } = useMeals(today);
  const { data: targets } = useNutritionTargets();

  const budget = targets?.kcal ?? 2000;
  const eaten = Math.round(meals.reduce((a, m) => a + (m.kcal ?? 0), 0));
  const left = Math.max(0, budget - eaten);
  const protein = meals.reduce((a, m) => a + (m.proteinG ?? 0), 0);
  const carbs = meals.reduce((a, m) => a + (m.carbsG ?? 0), 0);
  const fat = meals.reduce((a, m) => a + (m.fatG ?? 0), 0);
  const dailyScore = meals.length ? Math.round(meals.reduce((a, m) => a + (m.score ?? 0), 0) / meals.length) : 0;
  const sb = band(dailyScore);

  const byType: Record<string, MealRow[]> = {};
  for (const m of meals) (byType[m.type] ??= []).push(m);

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
            const isToday = i === days.length - 1;
            return (
              <View key={i} style={{ alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 8, borderRadius: radius.lg, backgroundColor: isToday ? colors.green : 'transparent' }}>
                <AppText variant="caption" color={isToday ? 'rgba(255,255,255,0.85)' : colors.muted} style={{ fontSize: 10 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]}
                </AppText>
                <AppText variant="itemTitle" color={isToday ? colors.white : colors.ink} style={{ fontSize: 14 }}>
                  {d.getDate()}
                </AppText>
              </View>
            );
          })}
        </View>

        {/* daily summary */}
        <Card style={{ marginTop: 14, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <ProgressRing size={120} stroke={11} radius={50} progress={budget ? eaten / budget : 0}>
              <AppText variant="stat" color={colors.ink} style={{ fontSize: 22 }}>
                {eaten.toLocaleString()}
              </AppText>
              <AppText variant="caption" color={colors.muted} style={{ fontSize: 10 }}>
                of {budget.toLocaleString()}
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
          <MacroBar label="Protein" value={protein} target={targets?.proteinG ?? 120} color={colors.green} />
          <MacroBar label="Carbs" value={carbs} target={targets?.carbsG ?? 220} color={colors.gradientEnd} />
          <MacroBar label="Fat" value={fat} target={targets?.fatG ?? 65} color={colors.amber} />
        </Card>

        {isLoading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.green} />
          </View>
        ) : (
          SECTIONS.map((section) => {
            const list = byType[section.key] ?? [];
            return (
              <Fragment key={section.key}>
                <AppText variant="label" color={colors.muted} style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
                  {section.title.toUpperCase()}
                </AppText>
                <Card style={{ paddingHorizontal: 6, paddingVertical: list.length ? 4 : 0 }}>
                  {list.length === 0 ? (
                    <Pressable onPress={() => router.push('/capture')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 10 }}>
                      <Icon name="add-circle-outline" size={22} color={colors.mutedSoft} />
                      <AppText variant="bodyMuted" color={colors.mutedSoft}>
                        Add {section.title.toLowerCase()}
                      </AppText>
                    </Pressable>
                  ) : (
                    list.map((meal, i) => {
                      const mb = band(meal.score ?? 0);
                      return (
                        <View key={meal.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.divider }}>
                          <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="restaurant" size={22} color={colors.green} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <AppText variant="itemTitle" numberOfLines={1}>
                              {meal.dishName}
                            </AppText>
                            <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
                              {Math.round(meal.kcal ?? 0)} kcal · {fmtTime(meal.eatenAt)}
                            </AppText>
                          </View>
                          {meal.score != null ? (
                            <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: mb.bg }}>
                              <AppText variant="caption" color={mb.fg}>
                                {meal.score}
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                  )}
                </Card>
              </Fragment>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
