import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { useAddWeight, useWeights } from '@/lib/queries';
import { colors, radius } from '@/theme';

type Unit = 'kg' | 'lb';

export default function AddWeightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: weights = [] } = useWeights();
  const addWeight = useAddWeight();

  const last = weights.length ? weights[weights.length - 1]!.valueKg : 75;
  const [unit, setUnit] = useState<Unit>('kg');
  const [kg, setKg] = useState(last);

  const display = unit === 'kg' ? kg.toFixed(1) : (kg * 2.20462).toFixed(1);
  const step = (d: number) => setKg((v) => Math.max(30, Math.min(400, +(v + d).toFixed(1))));

  const onSave = async () => {
    try {
      await addWeight.mutateAsync({ date: new Date().toISOString().slice(0, 10), value: kg, unit: 'kg' });
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, paddingTop: insets.top + 8 }}>
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="close" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="itemTitle">Add weigh-in</AppText>
        <View style={{ flexDirection: 'row', backgroundColor: colors.sage, borderRadius: radius.pill, padding: 3 }}>
          {(['kg', 'lb'] as Unit[]).map((u) => (
            <Pressable key={u} onPress={() => setUnit(u)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: unit === u ? colors.surface : 'transparent' }}>
              <AppText variant="caption" color={unit === u ? colors.green : colors.muted}>
                {u}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="label" color={colors.muted}>
          TODAY'S WEIGHT
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28, marginTop: 14 }}>
          <Pressable onPress={() => step(-0.1)} hitSlop={10}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="remove" size={26} color={colors.ink} />
            </View>
          </Pressable>
          <View style={{ alignItems: 'center', width: 150 }}>
            <AppText variant="display" color={colors.green} style={{ fontSize: 64, lineHeight: 68 }}>
              {display}
            </AppText>
            <AppText variant="label" color={colors.muted}>
              {unit.toUpperCase()}
            </AppText>
          </View>
          <Pressable onPress={() => step(0.1)} hitSlop={10}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="add" size={26} color={colors.ink} />
            </View>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 28 }}>
          {[-1, -0.5, 0.5, 1].map((d) => (
            <Pressable key={d} onPress={() => step(d)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.sageBorder }}>
              <AppText variant="caption" color={colors.ink}>
                {d > 0 ? `+${d}` : d}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button title="Save" onPress={onSave} disabled={addWeight.isPending} />
      </View>
    </View>
  );
}
