import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appMeta } from '@/constants/app';
import { AppText, Button, Card, HabitRow, Icon, ProgressRing, type IconName } from '@/components/ui';
import { colors, gradient, radius, shadows, spacing, type RuleIconPalette } from '@/theme';

type Habit = { name: string; icon: IconName; palette: RuleIconPalette; streak: number; done: boolean };

const PROGRAM_DAY = 41;
const PROGRAM_TOTAL = 75;
const STREAK = 41;

const MOTIVATION = ['You showed up today.', 'One day at a time.', 'Small steps, every day.', "Don't break the chain."];

// Split the philosophy so we can emphasise the tail (keeps the shared constant as source of truth).
const SPLIT_AT = appMeta.philosophy.indexOf('the process');
const PHILO_PRE = appMeta.philosophy.slice(0, SPLIT_AT);
const PHILO_EMPH = appMeta.philosophy.slice(SPLIT_AT);

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([
    { name: 'Drink 3L of water', icon: 'water-drop', palette: 'water', streak: 41, done: true },
    { name: 'Walk 30 minutes', icon: 'directions-walk', palette: 'green', streak: 28, done: true },
    { name: 'No sugar after 7pm', icon: 'cookie', palette: 'orange', streak: 12, done: true },
    { name: 'Lights out by 11pm', icon: 'bedtime', palette: 'purple', streak: 41, done: false },
  ]);
  const [motivIdx, setMotivIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMotivIdx((i) => (i + 1) % MOTIVATION.length), 4200);
    return () => clearInterval(t);
  }, []);

  const done = habits.filter((h) => h.done).length;
  const total = habits.length;
  const allDone = done === total;
  const doneLabel = `${done} of ${total} done`;

  const toggle = (i: number) =>
    setHabits((hs) => hs.map((h, idx) => (idx === i ? { ...h, done: !h.done } : h)));

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                height: 38,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                backgroundColor: colors.amberChipBg,
                borderWidth: 1,
                borderColor: colors.amberChipBorder,
              }}
            >
              <Icon name="local-fire-department" size={19} color={colors.amber} />
              <AppText variant="caption" color={colors.amberText} style={{ fontSize: 15 }}>
                {STREAK}
              </AppText>
            </View>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            >
              <AppText variant="heading" color={colors.white} style={{ fontSize: 17 }}>
                S
              </AppText>
            </LinearGradient>
          </View>
        </View>

        {/* philosophy banner */}
        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            gap: 11,
            alignItems: 'flex-start',
            padding: 14,
            paddingHorizontal: 16,
            borderRadius: radius.xl,
            backgroundColor: colors.sage,
            borderWidth: 1,
            borderColor: colors.sageBorder,
          }}
        >
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
          <ProgressRing progress={PROGRAM_DAY / PROGRAM_TOTAL}>
            <AppText variant="label" color={colors.muted}>
              DAY
            </AppText>
            <AppText variant="display" color={colors.ink}>
              {PROGRAM_DAY}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              of {PROGRAM_TOTAL}
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
                  {STREAK}
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
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', borderRadius: radius.pill, width: `${Math.round((done / total) * 100)}%` }}
                />
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

        <Card style={{ paddingHorizontal: 6, paddingTop: 4, paddingBottom: 14 }}>
          {habits.map((h, i) => (
            <HabitRow
              key={h.name}
              name={h.name}
              icon={h.icon}
              palette={h.palette}
              streak={h.streak}
              done={h.done}
              showDivider={i > 0}
              onToggle={() => toggle(i)}
            />
          ))}

          <View style={{ paddingHorizontal: 6, paddingTop: 8 }}>
            {allDone ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 11,
                  padding: 14,
                  paddingHorizontal: 16,
                  borderRadius: radius.lg,
                  backgroundColor: colors.successBg,
                  borderWidth: 1,
                  borderColor: colors.successBorder,
                }}
              >
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
                  74.2 kg
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <Icon name="south" size={15} color={colors.green} />
                  <AppText variant="caption" color={colors.green}>
                    0.3 kg
                  </AppText>
                </View>
              </View>
            </View>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, shadows.fab]}
            >
              <Icon name="add" size={24} color={colors.white} />
            </LinearGradient>
          </Card>
        </Pressable>

        {/* motivation */}
        <View style={{ marginTop: 22, alignItems: 'center', paddingHorizontal: 12 }}>
          <AppText variant="bodyStrong" color="#8AA08E">
            {MOTIVATION[motivIdx]}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
