import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appMeta } from '@/constants/app';
import { AppText, Card, Icon, type IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

function Row({
  icon,
  label,
  value,
  trailing,
  danger,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  trailing?: ReactNode;
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
      {trailing ?? (onPress ? <Icon name="chevron-right" size={22} color={colors.mutedSoft} /> : null)}
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
  const [reminder, setReminder] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" style={{ paddingHorizontal: 2 }}>
          Settings
        </AppText>

        <Section title="PROFILE">
          <Row icon="person" label="Name" value="Sushant" onPress={() => {}} />
          <Row icon="straighten" label="Units" value="kg" last onPress={() => {}} />
        </Section>

        <Section title="YOUR CHALLENGE">
          <Row icon="calendar-today" label="Current" value="Day 41 of 75" />
          <Row icon="checklist" label="Edit rules" onPress={() => {}} />
          <Row icon="flag" label="Goal weight" value="72.0 kg" onPress={() => {}} />
          <Row icon="restart-alt" label="Restart challenge" danger last onPress={() => {}} />
        </Section>

        <Section title="NUTRITION">
          <Row icon="local-fire-department" label="Daily targets" value="2,000 kcal" last onPress={() => {}} />
        </Section>

        <Section title="REMINDERS">
          <Row
            icon="notifications"
            label="Daily reminder"
            last
            trailing={
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ true: colors.green, false: colors.track }}
                thumbColor={colors.white}
              />
            }
          />
        </Section>

        <Section title="APPEARANCE">
          <Row icon="palette" label="Theme" value="System" last onPress={() => {}} />
        </Section>

        <Section title="DATA">
          <Row icon="ios-share" label="Export data" onPress={() => {}} />
          <Row icon="delete-outline" label="Reset all data" danger last onPress={() => {}} />
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
