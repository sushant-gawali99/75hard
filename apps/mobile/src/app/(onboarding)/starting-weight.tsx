import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon } from '@/components/ui';
import { useOnboarding } from '@/lib/onboarding-store';
import { useCompleteOnboarding } from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

type Unit = 'kg' | 'lb';
const ACTIVITIES = ['Sedentary', 'Light', 'Moderate', 'Very active'];
const ACT_MAP: Record<string, 'sedentary' | 'light' | 'moderate' | 'very_active'> = {
  Sedentary: 'sedentary',
  Light: 'light',
  Moderate: 'moderate',
  'Very active': 'very_active',
};

function RoundBtn({ icon, onPress }: { icon: 'remove' | 'add'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={colors.ink} />
      </View>
    </Pressable>
  );
}

function WeightStepper({ label, kg, unit, onStep }: { label: string; kg: number; unit: Unit; onStep: (delta: number) => void }) {
  const display = unit === 'kg' ? kg.toFixed(1) : (kg * 2.20462).toFixed(1);
  return (
    <Card style={{ padding: 16, marginTop: 12 }}>
      <AppText variant="label" color={colors.muted}>
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <RoundBtn icon="remove" onPress={() => onStep(-0.5)} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <AppText variant="display" color={colors.green} style={{ fontSize: 44 }}>
            {display}
          </AppText>
          <AppText variant="heading" color={colors.muted}>
            {unit}
          </AppText>
        </View>
        <RoundBtn icon="add" onPress={() => onStep(0.5)} />
      </View>
    </Card>
  );
}

export default function StartingWeightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [unit, setUnit] = useState<Unit>('kg');
  const [currentKg, setCurrentKg] = useState(80.6);
  const [goalKg, setGoalKg] = useState(72.0);
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState(30);
  const [heightCm, setHeightCm] = useState(175);
  const [activity, setActivity] = useState('Light');

  const days = useOnboarding((s) => s.days);
  const rules = useOnboarding((s) => s.rules);
  const complete = useCompleteOnboarding();

  const onStart = async () => {
    try {
      await complete.mutateAsync({
        days,
        rules,
        currentKg,
        goalKg,
        unit,
        sex: sex.toLowerCase() as 'male' | 'female',
        age,
        heightCm,
        activity: ACT_MAP[activity],
      });
      router.replace('/');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const toLose = Math.max(0, currentKg - goalKg);
  const toLoseDisplay = unit === 'kg' ? toLose.toFixed(1) : (toLose * 2.20462).toFixed(1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, paddingTop: insets.top + 8 }}>
      {/* app bar */}
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.green, borderRadius: 3 }} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          Step 3 of 3
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="title" color={colors.ink} style={{ fontSize: 26, lineHeight: 32 }}>
              Where are you starting?
            </AppText>
            <AppText variant="bodyStrong" color={colors.muted} style={{ marginTop: 12, fontSize: 15 }}>
              We'll track your progress — privately, just for you.
            </AppText>
          </View>
          {/* unit toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.sage, borderRadius: radius.pill, padding: 3 }}>
            {(['kg', 'lb'] as Unit[]).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnit(u)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: unit === u ? colors.surface : 'transparent' }}
              >
                <AppText variant="caption" color={unit === u ? colors.green : colors.muted}>
                  {u}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <WeightStepper label="CURRENT WEIGHT" kg={currentKg} unit={unit} onStep={(d) => setCurrentKg((v) => Math.max(30, +(v + d).toFixed(1)))} />
        <WeightStepper label="GOAL WEIGHT" kg={goalKg} unit={unit} onStep={(d) => setGoalKg((v) => Math.max(30, +(v + d).toFixed(1)))} />

        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sage }}>
          <AppText variant="caption" color={colors.green}>
            To lose: {toLoseDisplay} {unit}
          </AppText>
        </View>

        {/* About you */}
        <AppText variant="label" color={colors.muted} style={{ marginTop: 26, marginBottom: 10 }}>
          ABOUT YOU · personalises your calorie budget
        </AppText>
        <Card style={{ padding: 16, gap: 18 }}>
          {/* sex */}
          <View>
            <AppText variant="caption" color={colors.muted} style={{ marginBottom: 8 }}>
              Sex
            </AppText>
            <View style={{ flexDirection: 'row', backgroundColor: colors.sage, borderRadius: radius.pill, padding: 3 }}>
              {(['Male', 'Female'] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSex(s)}
                  style={{ flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', backgroundColor: sex === s ? colors.surface : 'transparent' }}
                >
                  <AppText variant="caption" color={sex === s ? colors.green : colors.muted} style={{ fontSize: 13 }}>
                    {s}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* age + height steppers (compact) */}
          {[
            { label: 'Age', value: age, set: setAge, min: 13, max: 100, suffix: '' },
            { label: 'Height', value: heightCm, set: setHeightCm, min: 120, max: 230, suffix: ' cm' },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText variant="itemTitle">{row.label}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Pressable onPress={() => row.set((v: number) => Math.max(row.min, v - 1))} hitSlop={8}>
                  <Icon name="remove-circle-outline" size={26} color={colors.muted} />
                </Pressable>
                <AppText variant="stat" color={colors.ink} style={{ fontSize: 18, minWidth: 64, textAlign: 'center' }}>
                  {row.value}
                  {row.suffix}
                </AppText>
                <Pressable onPress={() => row.set((v: number) => Math.min(row.max, v + 1))} hitSlop={8}>
                  <Icon name="add-circle-outline" size={26} color={colors.green} />
                </Pressable>
              </View>
            </View>
          ))}

          {/* activity */}
          <View>
            <AppText variant="caption" color={colors.muted} style={{ marginBottom: 8 }}>
              Activity level
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ACTIVITIES.map((a) => {
                const active = a === activity;
                return (
                  <Pressable
                    key={a}
                    onPress={() => setActivity(a)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: radius.pill,
                      backgroundColor: active ? colors.green : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.green : colors.sageBorder,
                    }}
                  >
                    <AppText variant="caption" color={active ? colors.white : colors.ink}>
                      {a}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <Button title="Start my challenge" onPress={onStart} disabled={complete.isPending} />
        <AppText variant="caption" color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: spacing.md }}>
          You can edit the extras later in Settings.
        </AppText>
      </View>
    </View>
  );
}
