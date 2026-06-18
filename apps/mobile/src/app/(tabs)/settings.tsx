import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appMeta } from '@/constants/app';
import { AppText, Card, Icon, type IconName } from '@/components/ui';
import { signOut } from '@/lib/auth';
import { useChallenge, useNutritionTargets, useProfile } from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

function Row({
  icon,
  label,
  value,
  danger,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
  last?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: radius.sm, backgroundColor: danger ? '#FBE6E0' : colors.sage, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={19} color={danger ? colors.clay : colors.green} />
      </View>
      <AppText variant="itemTitle" color={danger ? colors.clay : colors.ink} style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="bodyMuted" color={colors.muted}>
          {value}
        </AppText>
      ) : null}
      {onPress ? <Icon name="chevron-right" size={22} color={colors.mutedSoft} /> : null}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      <AppText variant="label" color={colors.muted} style={{ marginBottom: 8, paddingHorizontal: 6 }}>
        {title}
      </AppText>
      <Card style={{ paddingHorizontal: 4 }}>{children}</Card>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: challenge } = useChallenge();
  const { data: targets } = useNutritionTargets();

  const challengeLabel = challenge
    ? `Day ${Math.min(
        challenge.days,
        Math.floor((Date.now() - Date.parse(challenge.startDate)) / 86400000) + 1,
      )} of ${challenge.days}`
    : '—';
  const unit = profile?.unit ?? 'kg';
  const goal = profile?.goalWeightKg ? `${profile.goalWeightKg.toFixed(1)} kg` : '—';
  const kcal = targets?.kcal ? `${targets.kcal.toLocaleString()} kcal` : '—';

  const confirmRestart = () =>
    Alert.alert('Restart challenge?', 'This starts a new challenge from onboarding.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restart', style: 'destructive', onPress: () => router.replace('/set-days') },
    ]);

  const confirmSignOut = () =>
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut().catch(() => {});
          router.replace('/welcome');
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" style={{ paddingHorizontal: 2 }}>
          Settings
        </AppText>

        <Section title="YOUR CHALLENGE">
          <Row icon="calendar-today" label="Current" value={challengeLabel} />
          <Row icon="checklist" label="Edit rules" onPress={() => router.push('/define-rules')} />
          <Row icon="flag" label="Goal weight" value={goal} />
          <Row icon="restart-alt" label="Restart challenge" danger last onPress={confirmRestart} />
        </Section>

        <Section title="NUTRITION">
          <Row icon="local-fire-department" label="Daily targets" value={kcal} />
          <Row icon="straighten" label="Units" value={unit} last />
        </Section>

        <Section title="NOTIFICATIONS">
          <Row icon="notifications" label="Reminders" last onPress={() => router.push('/reminders')} />
        </Section>

        <Section title="ACCOUNT">
          <Row icon="logout" label="Sign out" danger last onPress={confirmSignOut} />
        </Section>

        <Section title="ABOUT">
          <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 }}>
            <AppText variant="bodyStrong" color={colors.inkSoft}>
              {appMeta.philosophy}
            </AppText>
          </View>
          <Row icon="lock-outline" label="Privacy policy" onPress={() => {}} />
          <Row icon="star-outline" label="Rate Process" onPress={() => {}} />
          <Row icon="info-outline" label="Version" value="1.0.0" last />
        </Section>
      </ScrollView>
    </View>
  );
}
