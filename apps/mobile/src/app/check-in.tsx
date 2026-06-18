import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Icon, type IconName } from '@/components/ui';
import {
  useChallenge,
  useCheckin,
  useRuleLogs,
  useRules,
  useSetRuleState,
  useStreaks,
  useUpsertCheckin,
} from '@/lib/queries';
import { colors, radius, ruleIconPalettes, type RuleIconPalette } from '@/theme';

type RState = 'done' | 'skipped' | 'missed';

const STATE_OPTS: { key: RState; label: string; fg: string; activeBg: string }[] = [
  { key: 'done', label: 'Done', fg: colors.green, activeBg: colors.green },
  { key: 'skipped', label: 'Skip', fg: colors.muted, activeBg: colors.muted },
  { key: 'missed', label: 'Miss', fg: colors.clay, activeBg: colors.clay },
];

const MOODS = ['😞', '😐', '🙂', '😄', '🤩'];
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayIso();

  const { data: rules = [] } = useRules();
  const { data: logs = [] } = useRuleLogs(today);
  const { data: streaks } = useStreaks();
  const { data: challenge } = useChallenge();
  const { data: checkin } = useCheckin(today);
  const setState = useSetRuleState();
  const upsertCheckin = useUpsertCheckin();

  const [note, setNote] = useState('');
  const [mood, setMood] = useState<number | null>(3);
  const [override, setOverride] = useState<Record<string, RState>>({});

  // Hydrate the reflection once from the server (don't clobber in-progress edits on refetch).
  const hydrated = useRef(false);
  useEffect(() => {
    if (checkin && !hydrated.current) {
      hydrated.current = true;
      setNote(checkin.note ?? '');
      setMood(checkin.mood ?? null);
    }
  }, [checkin]);

  const serverState = new Map(logs.map((l) => [l.ruleId, l.state as RState]));
  const streakByRule = new Map((streaks?.rules ?? []).map((s) => [s.ruleId, s.current]));

  const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const challengeTotal = challenge?.days ?? 75;
  const challengeDay = challenge
    ? Math.min(challengeTotal, Math.floor((Date.parse(today) - Date.parse(challenge.startDate)) / 86400000) + 1)
    : 1;

  const select = (ruleId: string, state: RState) => {
    setOverride((o) => ({ ...o, [ruleId]: state }));
    setState.mutate({ ruleId, date: today, state });
  };

  const onDone = async () => {
    try {
      await upsertCheckin.mutateAsync({ date: today, mood, note: note.trim() ? note.trim() : null });
    } catch {
      // reflection is best-effort; rule states already saved on tap
    }
    router.back();
  };

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
            Day {challengeDay}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <AppText variant="title" color={colors.ink} style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 2, fontSize: 24 }}>
          How did today go?
        </AppText>

        {rules.length === 0 ? (
          <Card style={{ padding: 18, alignItems: 'center' }}>
            <AppText variant="bodyMuted" color={colors.muted}>
              No rules yet. Add your daily process first.
            </AppText>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {rules.map((r) => {
              const palette = r.palette as RuleIconPalette;
              const p = ruleIconPalettes[palette];
              const cur = override[r.id] ?? serverState.get(r.id);
              const streak = streakByRule.get(r.id) ?? 0;
              return (
                <Card key={r.id} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.icon as IconName} size={22} color={p.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="itemTitle">{r.name}</AppText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Icon name="local-fire-department" size={14} color={colors.amber} />
                        <AppText variant="caption" color={colors.muted}>
                          {streak} day streak
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
                          onPress={() => select(r.id, opt.key)}
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
        )}

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
        <Button title="Done" onPress={onDone} />
      </View>
    </View>
  );
}
