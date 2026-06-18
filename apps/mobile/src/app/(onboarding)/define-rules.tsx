import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon, type IconName } from '@/components/ui';
import { colors, radius, ruleIconPalettes, spacing, type RuleIconPalette } from '@/theme';

type Rule = { id: number; name: string; icon: IconName; palette: RuleIconPalette; target: string };

const SEED: Rule[] = [
  { id: 1, name: 'Drink 3L of water', icon: 'water-drop', palette: 'water', target: '3 L · every day' },
  { id: 2, name: 'Walk 30 minutes', icon: 'directions-walk', palette: 'green', target: 'every day' },
  { id: 3, name: 'No sugar after 7pm', icon: 'cookie', palette: 'orange', target: 'every day' },
  { id: 4, name: 'Lights out by 11pm', icon: 'bedtime', palette: 'purple', target: 'every day' },
];

const SUGGESTIONS: Omit<Rule, 'id' | 'target'>[] = [
  { name: 'Read 10 pages', icon: 'menu-book', palette: 'purple' },
  { name: 'Meditate 10 min', icon: 'self-improvement', palette: 'green' },
  { name: 'Strength workout', icon: 'fitness-center', palette: 'orange' },
];

export default function DefineRulesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>(SEED);
  const idRef = useRef(100);
  const [suggIdx, setSuggIdx] = useState(0);

  const addRule = () => {
    const s = SUGGESTIONS[suggIdx % SUGGESTIONS.length]!;
    setRules((r) => [...r, { id: ++idRef.current, name: s.name, icon: s.icon, palette: s.palette, target: 'every day' }]);
    setSuggIdx((i) => i + 1);
  };
  const remove = (id: number) => setRules((r) => r.filter((x) => x.id !== id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, paddingTop: insets.top + 8 }}>
      {/* app bar */}
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
          <View style={{ width: '66%', height: '100%', backgroundColor: colors.green, borderRadius: 3 }} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          Step 2 of 3
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 24 }}>
          <AppText variant="title" color={colors.ink} style={{ fontSize: 26, lineHeight: 32 }}>
            Set your daily rules
          </AppText>
          <AppText variant="bodyStrong" color={colors.muted} style={{ marginTop: 12, fontSize: 15 }}>
            These are the non-negotiables you'll follow every day.
          </AppText>
        </View>

        <AppText variant="label" color={colors.muted} style={{ marginTop: 24, marginBottom: 10 }}>
          YOUR PROCESS · {rules.length} {rules.length === 1 ? 'RULE' : 'RULES'}
        </AppText>

        <View style={{ gap: 10 }}>
          {rules.map((r) => {
            const p = ruleIconPalettes[r.palette];
            return (
              <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={r.icon} size={22} color={p.icon} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="itemTitle">{r.name}</AppText>
                  <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
                    {r.target}
                  </AppText>
                </View>
                <Pressable onPress={() => remove(r.id)} hitSlop={8}>
                  <Icon name="close" size={20} color={colors.mutedSoft} />
                </Pressable>
              </Card>
            );
          })}

          {/* add tile */}
          <Pressable
            onPress={addRule}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 16,
              borderRadius: radius.card,
              borderWidth: 1.5,
              borderColor: colors.sageBorder,
              borderStyle: 'dashed',
              backgroundColor: colors.sage,
            }}
          >
            <Icon name="add" size={20} color={colors.green} />
            <AppText variant="itemTitle" color={colors.green}>
              Add a rule
            </AppText>
          </Pressable>
        </View>

        <AppText variant="caption" color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: 16 }}>
          Most people pick 4–6 rules. Make them specific and doable.
        </AppText>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <Button title="Continue" onPress={() => router.push('/starting-weight')} disabled={rules.length === 0} />
      </View>
    </View>
  );
}
