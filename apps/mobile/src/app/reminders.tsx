import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Card, Icon } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BODY = 'Time to follow the process. Check off today — one day at a time.';

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(8);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const existing = scheduled.find((s) => (s.content.data as { kind?: string })?.kind === 'daily-reminder');
      if (existing) {
        setEnabled(true);
        const trigger = existing.trigger as { hour?: number };
        if (typeof trigger?.hour === 'number') setHour(trigger.hour);
      }
    })();
  }, []);

  const reschedule = async (on: boolean, h: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!on) return;
    let granted = (await Notifications.getPermissionsAsync()).granted;
    if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) {
      Alert.alert('Notifications off', 'Enable notifications in system settings to get reminders.');
      setEnabled(false);
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Process', body: BODY, data: { kind: 'daily-reminder' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: 0, channelId: 'reminders' },
    });
  };

  const onToggle = async (v: boolean) => {
    setEnabled(v);
    await reschedule(v, hour);
  };
  const onHour = async (d: number) => {
    const h = (hour + d + 24) % 24;
    setHour(h);
    if (enabled) await reschedule(true, h);
  };

  const am = hour < 12;
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const display = `${h12}:00 ${am ? 'AM' : 'PM'}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg, paddingTop: insets.top + 8 }}>
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <AppText variant="heading" style={{ fontSize: 18 }}>
          Reminders
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 12, paddingHorizontal: 2 }}>
          A gentle daily nudge to follow your process.
        </AppText>

        <Card style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Icon name="notifications" size={19} color={colors.green} />
            </View>
            <AppText variant="itemTitle" style={{ flex: 1 }}>
              Daily reminder
            </AppText>
            <Switch value={enabled} onValueChange={onToggle} trackColor={{ true: colors.green, false: colors.track }} thumbColor={colors.white} />
          </View>

          {enabled ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.divider }}>
              <AppText variant="itemTitle" style={{ flex: 1 }}>
                Remind me at
              </AppText>
              <Pressable onPress={() => onHour(-1)} hitSlop={8}>
                <Icon name="remove-circle-outline" size={26} color={colors.muted} />
              </Pressable>
              <AppText variant="stat" color={colors.ink} style={{ fontSize: 17, minWidth: 92, textAlign: 'center' }}>
                {display}
              </AppText>
              <Pressable onPress={() => onHour(1)} hitSlop={8}>
                <Icon name="add-circle-outline" size={26} color={colors.green} />
              </Pressable>
            </View>
          ) : null}
        </Card>

        {/* preview */}
        <AppText variant="label" color={colors.muted} style={{ marginTop: 22, marginBottom: 8, paddingHorizontal: 4 }}>
          PREVIEW
        </AppText>
        <Card style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="eco" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="itemTitle">Process</AppText>
            <AppText variant="bodyMuted" color={colors.muted} style={{ marginTop: 2 }}>
              {BODY}
            </AppText>
          </View>
        </Card>

        <AppText variant="caption" color={colors.mutedSoft} style={{ marginTop: 16, paddingHorizontal: 4, lineHeight: 17 }}>
          Reminders are scheduled on your device. They need notification permission and a dev/standalone build (not Expo Go).
        </AppText>
      </ScrollView>
    </View>
  );
}
