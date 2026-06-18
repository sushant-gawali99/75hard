import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appMeta } from '@/constants/app';
import { AppText, Button, Card, Confetti, HabitRow, Icon, ProgressRing, type IconName } from '@/components/ui';
import { useChallenge, useRuleLogs, useRules, useSetRuleState, useStreaks, useWeights } from '@/lib/queries';
import { colors, gradient, radius, shadows, spacing, type RuleIconPalette } from '@/theme';

const MOTIVATION = ['You showed up today.', 'One day at a time.', 'Small steps, every day.', "Don't break the chain."];

const SPLIT_AT = appMeta.philosophy.indexOf('the process');
const PHILO_PRE = appMeta.philosophy.slice(0, SPLIT_AT);
const PHILO_EMPH = appMeta.philosophy.slice(SPLIT_AT);

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayIso();

  const { data: rules = [], isLoading } = useRules();
  const { data: logs = [] } = useRuleLogs(today);
  const { data: streaks } = useStreaks();
  const { data: weights = [] } = useWeights();
  const { data: challenge } = useChallenge();
  const setState = useSetRuleState();

  const [motivIdx, setMotivIdx] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const celebratedRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setMotivIdx((i) => (i + 1) % MOTIVATION.length), 4200);
    return () => clearInterval(t);
  }, []);

  const stateByRule = new Map(logs.map((l) => [l.ruleId, l.state]));
  const currentByRule = new Map((streaks?.rules ?? []).map((s) => [s.ruleId, s.current]));
  const habits = rules.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon as IconName,
    palette: r.palette as RuleIconPalette,
    done: stateByRule.get(r.id) === 'done',
    streak: currentByRule.get(r.id) ?? 0,
  }));

  const done = habits.filter((h) => h.done).length;
  const total = habits.length;
  const allDone = total > 0 && done === total;
  useEffect(() => {
    if (allDone && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3500);
      return () => clearTimeout(t);
    }
    if (!allDone) celebratedRef.current = false;
  }, [allDone]);
  const doneLabel = `${done} of ${total} done`;
  const dayStreak = streaks?.overall.current ?? 0;
  const challengeTotal = challenge?.days ?? 75;
  const challengeDay = challenge
    ? Math.min(challengeTotal, Math.floor((Date.parse(today) - Date.parse(challenge.startDate)) / 86400000) + 1)
    : 0;

  const latest = weights.length ? weights[weights.length - 1] : undefined;
  const prev = weights.length > 1 ? weights[weights.length - 2] : undefined;
  const weightDelta = latest && prev ? +(latest.valueKg - prev.valueKg).toFixed(1) : null;

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingHorizontal: 2 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="title">Good morning, Sushant</AppText>
            <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 3 }}>
              {dateLabel}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 38, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.amberChipBg, borderWidth: 1, borderColor: colors.amberChipBorder }}>
              <Icon name="local-fire-department" size={19} color={colors.amber} />
              <AppText variant="caption" color={colors.amberText} style={{ fontSize: 15 }}>
                {dayStreak}
              </AppText>
            </View>
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="heading" color={colors.white} style={{ fontSize: 17 }}>
                S
              </AppText>
            </LinearGradient>
          </View>
        </View>

        {/* philosophy banner */}
        <View style={{ marginTop: 16, flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: 14, paddingHorizontal: 16, borderRadius: radius.xl, backgroundColor: colors.sage, borderWidth: 1, borderColor: colors.sageBorder }}>
          <Icon name="format-quote" size={20} color={colors.green} />
          <AppText variant="bodyStrong" color={colors.inkSoft} style={{ flex: 1 }}>
            {PHILO_PRE}
            <AppText variant="bodyStrong" color={colors.green}>
              {PHILO_EMPH}
            </AppText>
          </AppText>
        </View>

        {/* progress hero */}
        <Card style={{ marginTop: 14, padding: 20, flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <ProgressRing progress={challengeTotal ? challengeDay / challengeTotal : 0}>
            <AppText variant="label" color={colors.muted}>
              DAY
            </AppText>
            <AppText variant="display" color={colors.ink}>
              {challengeDay}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              of {challengeTotal}
            </AppText>
          </ProgressRing>
          <View style={{ flex: 1, gap: 15 }}>
            <View>
              <AppText variant="label" color={colors.muted}>
                DAY STREAK
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Icon name="local-fire-department" size={22} color={colors.amber} />
                <AppText variant="stat" color={colors.ink}>
                  {dayStreak}
                </AppText>
                <AppText variant="bodyMuted" color={colors.muted}>
                  days
                </AppText>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.muted}>
                  TODAY
                </AppText>
                <AppText variant="caption" color={colors.green}>
                  {doneLabel}
                </AppText>
              </View>
              <View style={{ marginTop: 7, height: 8, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', borderRadius: radius.pill, width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
              </View>
            </View>
          </View>
        </Card>

        {/* today's process */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
          <AppText variant="label" color={colors.muted}>
            TODAY'S PROCESS
          </AppText>
          <AppText variant="caption" color={colors.mutedSoft}>
            {doneLabel}
          </AppText>
        </View>

        {isLoading ? (
          <Card style={{ padding: 28, alignItems: 'center' }}>
            <ActivityIndicator color={colors.green} />
          </Card>
        ) : habits.length === 0 ? (
          <Card style={{ padding: 22, alignItems: 'center', gap: 12 }}>
            <AppText variant="bodyMuted" color={colors.muted}>
              No rules yet. Set up your daily process.
            </AppText>
            <Button title="Define rules" icon="add" onPress={() => router.push('/define-rules')} />
          </Card>
        ) : (
          <Card style={{ paddingHorizontal: 6, paddingTop: 4, paddingBottom: 14 }}>
            {habits.map((h, i) => (
              <HabitRow
                key={h.id}
                name={h.name}
                icon={h.icon}
                palette={h.palette}
                streak={h.streak}
                done={h.done}
                showDivider={i > 0}
                onToggle={() => setState.mutate({ ruleId: h.id, date: today, state: h.done ? 'missed' : 'done' })}
              />
            ))}
            <View style={{ paddingHorizontal: 6, paddingTop: 8 }}>
              {allDone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder }}>
                  <Icon name="task-alt" size={26} color={colors.green} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="itemTitle" color={colors.successInk} style={{ fontSize: 15 }}>
                      Day complete.
                    </AppText>
                    <AppText variant="bodyMuted" color={colors.successInkSoft} style={{ marginTop: 1 }}>
                      See you tomorrow. Don't break the chain.
                    </AppText>
                  </View>
                </View>
              ) : (
                <Button title="Open check-in" icon="arrow-forward" onPress={() => router.push('/check-in')} />
              )}
            </View>
          </Card>
        )}

        {/* quick weight add */}
        <Pressable onPress={() => router.push('/weight')}>
          <Card style={{ marginTop: 16, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="monitor-weight" size={23} color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={colors.muted}>
                TODAY'S WEIGHT
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                <AppText variant="stat" color={colors.ink} style={{ fontSize: 22 }}>
                  {latest ? `${latest.valueKg.toFixed(1)} kg` : '—'}
                </AppText>
                {weightDelta !== null ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Icon name={weightDelta <= 0 ? 'south' : 'north'} size={15} color={colors.green} />
                    <AppText variant="caption" color={colors.green}>
                      {Math.abs(weightDelta)} kg
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={{ width: 46, height: 46, borderRadius: 23, overflow: 'hidden' }}>
              <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, shadows.fab]}>
                <Icon name="add" size={24} color={colors.white} />
              </LinearGradient>
            </View>
          </Card>
        </Pressable>

        {/* motivation */}
        <View style={{ marginTop: 22, alignItems: 'center', paddingHorizontal: 12 }}>
          <AppText variant="bodyStrong" color="#8AA08E">
            {MOTIVATION[motivIdx]}
          </AppText>
        </View>
      </ScrollView>
      {celebrate ? <Confetti count={80} /> : null}
    </View>
  );
}
