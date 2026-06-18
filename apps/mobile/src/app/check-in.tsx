import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon, type IconName } from '@/components/ui';
import { colors, radius, ruleIconPalettes, spacing, type RuleIconPalette } from '@/theme';

type RState = 'done' | 'skipped' | 'missed';
type Rule = { name: string; icon: IconName; palette: RuleIconPalette; streak: number };

const RULES: Rule[] = [
  { name: 'Drink 3L of water', icon: 'water-drop', palette: 'water', streak: 41 },
  { name: 'Walk 30 minutes', icon: 'directions-walk', palette: 'green', streak: 28 },
  { name: 'No sugar after 7pm', icon: 'cookie', palette: 'orange', streak: 12 },
  { name: 'Lights out by 11pm', icon: 'bedtime', palette: 'purple', streak: 41 },
];

const STATE_OPTS: { key: RState; label: string; fg: string; activeBg: string }[] = [
  { key: 'done', label: 'Done', fg: colors.green, activeBg: colors.green },
  { key: 'skipped', label: 'Skip', fg: colors.muted, activeBg: colors.muted },
  { key: 'missed', label: 'Miss', fg: colors.clay, activeBg: colors.clay },
];

const MOODS = ['😞', '😐', '🙂', '😄', '🤩'];

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [states, setStates] = useState<Record<number, RState>>({ 0: 'done', 1: 'done', 2: 'done' });
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<number | null>(3);

  const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 18, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="close" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="itemTitle" color={colors.muted}>
          Today · {dateLabel}
        </AppText>
        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.sage }}>
          <AppText variant="caption" color={colors.green}>
            Day 41
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <AppText variant="title" color={colors.ink} style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 2, fontSize: 24 }}>
          How did today go?
        </AppText>

        <View style={{ gap: 12 }}>
          {RULES.map((r, i) => {
            const p = ruleIconPalettes[r.palette];
            const cur = states[i];
            return (
              <Card key={r.name} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={r.icon} size={22} color={p.icon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="itemTitle">{r.name}</AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <Icon name="local-fire-department" size={14} color={colors.amber} />
                      <AppText variant="caption" color={colors.muted}>
                        {r.streak} day streak
                      </AppText>
                    </View>
                  </View>
                </View>
                {/* 3-state selector */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                  {STATE_OPTS.map((opt) => {
                    const active = cur === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setStates((s) => ({ ...s, [i]: opt.key }))}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: radius.pill,
                          alignItems: 'center',
                          backgroundColor: active ? opt.activeBg : colors.appBg,
                          borderWidth: 1,
                          borderColor: active ? opt.activeBg : colors.sageBorder,
                        }}
                      >
                        <AppText variant="caption" color={active ? colors.white : opt.fg} style={{ fontSize: 13 }}>
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            );
          })}
        </View>

        {/* reflection */}
        <AppText variant="label" color={colors.muted} style={{ marginTop: 24, marginBottom: 10, paddingHorizontal: 4 }}>
          REFLECTION (OPTIONAL)
        </AppText>
        <Card style={{ padding: 14 }}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="How are you feeling? What helped today?"
            placeholderTextColor={colors.mutedSoft}
            multiline
            style={{ minHeight: 72, fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.ink, textAlignVertical: 'top' }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            {MOODS.map((m, i) => {
              const active = mood === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setMood(i)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? colors.sage : 'transparent',
                    borderWidth: active ? 1 : 0,
                    borderColor: colors.sageBorder,
                  }}
                >
                  <AppText style={{ fontSize: 24, opacity: active ? 1 : 0.55 }}>{m}</AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      {/* save */}
      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 14, paddingTop: 8 }}>
        <Button title="Save today" onPress={() => router.back()} />
      </View>
    </View>
  );
}
