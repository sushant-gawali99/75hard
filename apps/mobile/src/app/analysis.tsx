import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon } from '@/components/ui';
import { colors, gradient, radius, spacing } from '@/theme';

const MEAL = { name: 'Chicken salad bowl', time: 'Lunch · 1:05 PM', score: 84, kcal: 540 };
const ITEMS = [
  { name: 'Grilled chicken breast', portion: '150 g', kcal: 250 },
  { name: 'Mixed greens', portion: '80 g', kcal: 30 },
  { name: 'Olive oil', portion: '1 tbsp', kcal: 120 },
  { name: 'Cherry tomatoes', portion: '60 g', kcal: 20 },
  { name: 'Feta cheese', portion: '30 g', kcal: 120 },
];
const MACROS = [
  { label: 'Protein', grams: 42, pct: 31, color: colors.green },
  { label: 'Carbs', grams: 18, pct: 13, color: colors.gradientEnd },
  { label: 'Fat', grams: 34, pct: 56, color: colors.amber },
];

function band(score: number) {
  if (score >= 75) return { bg: colors.sage, fg: colors.green };
  if (score >= 50) return { bg: colors.amberChipBg, fg: colors.amberText };
  return { bg: '#FBE6E0', fg: colors.clay };
}

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sb = band(MEAL.score);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* photo hero (placeholder) */}
        <View style={{ height: 220, backgroundColor: colors.sage }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="restaurant" size={56} color="#B8CDB6" />
          </View>
          <LinearGradient colors={['transparent', 'rgba(20,40,28,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110 }} />
          {/* close */}
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={22} color={colors.ink} />
          </Pressable>
          {/* score badge */}
          <View style={{ position: 'absolute', top: insets.top + 8, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, backgroundColor: sb.bg, alignItems: 'center' }}>
            <AppText variant="stat" color={sb.fg} style={{ fontSize: 22 }}>
              {MEAL.score}
            </AppText>
            <AppText variant="caption" color={sb.fg} style={{ fontSize: 9 }}>
              SCORE
            </AppText>
          </View>
          {/* name */}
          <View style={{ position: 'absolute', left: 18, bottom: 14 }}>
            <AppText variant="title" color={colors.white} style={{ fontSize: 22 }}>
              {MEAL.name}
            </AppText>
            <AppText variant="bodyMuted" color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }}>
              {MEAL.time}
            </AppText>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          {/* detected items */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10, paddingHorizontal: 4 }}>
            <AppText variant="label" color={colors.muted}>
              DETECTED ITEMS
            </AppText>
            <AppText variant="caption" color={colors.mutedSoft}>
              AI estimate · tap to refine
            </AppText>
          </View>
          <Card style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            {ITEMS.map((it, i) => (
              <Pressable
                key={it.name}
                onPress={() => {}}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.divider }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green }} />
                <View style={{ flex: 1 }}>
                  <AppText variant="itemTitle">{it.name}</AppText>
                  <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 1 }}>
                    {it.portion} · {it.kcal} kcal
                  </AppText>
                </View>
                <Icon name="edit" size={18} color={colors.mutedSoft} />
              </Pressable>
            ))}
            <Pressable onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: colors.divider }}>
              <Icon name="add" size={18} color={colors.green} />
              <AppText variant="caption" color={colors.green}>
                Add item
              </AppText>
            </Pressable>
          </Card>

          {/* nutrition breakdown */}
          <AppText variant="label" color={colors.muted} style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
            NUTRITION
          </AppText>
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <AppText variant="stat" color={colors.ink} style={{ fontSize: 26 }}>
                {MEAL.kcal}
              </AppText>
              <AppText variant="bodyMuted" color={colors.muted}>
                kcal total
              </AppText>
            </View>
            {MACROS.map((m) => (
              <View key={m.label} style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <AppText variant="caption" color={colors.muted}>
                    {m.label}
                  </AppText>
                  <AppText variant="caption" color={colors.ink}>
                    {m.grams} g · {m.pct}%
                  </AppText>
                </View>
                <View style={{ height: 7, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${m.pct}%`, borderRadius: radius.pill, backgroundColor: m.color }} />
                </View>
              </View>
            ))}
          </Card>

          {/* score explanation + tip */}
          <View style={{ marginTop: 14, padding: 16, borderRadius: radius.card, backgroundColor: colors.sage, borderWidth: 1, borderColor: colors.sageBorder }}>
            <AppText variant="itemTitle" color={colors.inkSoft}>
              High protein, healthy fats — light on fiber.
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
              <Icon name="lightbulb" size={18} color={colors.green} />
              <AppText variant="bodyStrong" color={colors.inkSoft} style={{ flex: 1, fontSize: 14 }}>
                Add a whole grain or legumes for lasting energy and a higher score.
              </AppText>
            </View>
          </View>

          {/* budget impact */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 4 }}>
            <Icon name="account-balance-wallet" size={18} color={colors.muted} />
            <AppText variant="bodyMuted" color={colors.muted}>
              Adds to today: +{MEAL.kcal} kcal · 42 g protein
            </AppText>
          </View>

          {/* actions */}
          <View style={{ marginTop: 20, gap: 10 }}>
            <Button title="Save to diary" onPress={() => router.back()} />
            <Button title="Re-analyze" variant="tonal" icon="refresh" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
