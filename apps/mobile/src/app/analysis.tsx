import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon } from '@/components/ui';
import { useMealDraft } from '@/lib/meal-draft';
import { useSaveMeal } from '@/lib/queries';
import { colors, radius } from '@/theme';

function band(score: number) {
  if (score >= 75) return { bg: colors.sage, fg: colors.green };
  if (score >= 50) return { bg: colors.amberChipBg, fg: colors.amberText };
  return { bg: '#FBE6E0', fg: colors.clay };
}

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { analysis, photoUri, mealType } = useMealDraft();
  const save = useSaveMeal();

  if (!analysis) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.appBg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
        <Icon name="restaurant" size={40} color={colors.mutedSoft} />
        <AppText variant="bodyMuted" color={colors.muted}>
          Snap a meal to analyze it.
        </AppText>
        <Button title="Open camera" icon="photo-camera" onPress={() => router.replace('/capture')} />
      </View>
    );
  }

  const sb = band(analysis.score.value);
  const t = analysis.totals;
  const macros = [
    { label: 'Protein', g: t.proteinG, kcal: t.proteinG * 4, color: colors.green },
    { label: 'Carbs', g: t.carbsG, kcal: t.carbsG * 4, color: colors.gradientEnd },
    { label: 'Fat', g: t.fatG, kcal: t.fatG * 9, color: colors.amber },
  ];
  const macroKcal = macros.reduce((a, m) => a + m.kcal, 0) || 1;

  const onSave = async () => {
    try {
      await save.mutateAsync({
        type: mealType,
        dishName: analysis.dishName,
        items: analysis.items.map((i) => ({ name: i.name, quantityGrams: i.quantityGrams, nutrients: i.nutrients, source: i.source })),
        totals: analysis.totals,
        score: analysis.score,
      });
      router.replace('/meals');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        {/* photo hero */}
        <View style={{ height: 240, backgroundColor: colors.sage }}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="restaurant" size={56} color="#B8CDB6" />
            </View>
          )}
          <LinearGradient colors={['transparent', 'rgba(20,40,28,0.6)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }} />
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ position: 'absolute', top: insets.top + 8, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={22} color={colors.ink} />
          </Pressable>
          <View style={{ position: 'absolute', top: insets.top + 8, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, backgroundColor: sb.bg, alignItems: 'center' }}>
            <AppText variant="stat" color={sb.fg} style={{ fontSize: 22 }}>
              {analysis.score.value}
            </AppText>
            <AppText variant="caption" color={sb.fg} style={{ fontSize: 9 }}>
              SCORE
            </AppText>
          </View>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 14 }}>
            <AppText variant="title" color={colors.white} style={{ fontSize: 21 }}>
              {analysis.dishName}
            </AppText>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          {/* detected items */}
          <AppText variant="label" color={colors.muted} style={{ marginTop: 20, marginBottom: 10, paddingHorizontal: 4 }}>
            DETECTED ITEMS
          </AppText>
          <Card style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            {analysis.items.map((it, i) => (
              <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.divider }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: it.source === 'fatsecret' ? colors.green : colors.amber }} />
                <View style={{ flex: 1 }}>
                  <AppText variant="itemTitle">{it.name}</AppText>
                  <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 1 }}>
                    {Math.round(it.quantityGrams)} g · {Math.round(it.nutrients.kcal)} kcal · {it.source}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>

          {/* nutrition */}
          <AppText variant="label" color={colors.muted} style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
            NUTRITION
          </AppText>
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <AppText variant="stat" color={colors.ink} style={{ fontSize: 26 }}>
                {Math.round(t.kcal)}
              </AppText>
              <AppText variant="bodyMuted" color={colors.muted}>
                kcal total
              </AppText>
            </View>
            {macros.map((m) => (
              <View key={m.label} style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <AppText variant="caption" color={colors.muted}>
                    {m.label}
                  </AppText>
                  <AppText variant="caption" color={colors.ink}>
                    {Math.round(m.g)} g
                  </AppText>
                </View>
                <View style={{ height: 7, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${(m.kcal / macroKcal) * 100}%`, borderRadius: radius.pill, backgroundColor: m.color }} />
                </View>
              </View>
            ))}
          </Card>

          {/* score explanation + tip */}
          <View style={{ marginTop: 14, padding: 16, borderRadius: radius.card, backgroundColor: colors.sage, borderWidth: 1, borderColor: colors.sageBorder }}>
            <AppText variant="itemTitle" color={colors.inkSoft}>
              {analysis.score.rationale}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
              <Icon name="lightbulb" size={18} color={colors.green} />
              <AppText variant="bodyStrong" color={colors.inkSoft} style={{ flex: 1, fontSize: 14 }}>
                {analysis.score.tip}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* save */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10, paddingBottom: insets.bottom + 12, backgroundColor: colors.appBg, borderTopWidth: 1, borderTopColor: colors.divider }}>
        <Button title="Save to diary" onPress={onSave} disabled={save.isPending} />
      </View>
    </View>
  );
}
