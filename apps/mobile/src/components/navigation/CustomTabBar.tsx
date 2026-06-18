import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, type IconName } from '@/components/ui';
import { colors, gradient, shadows } from '@/theme';

/** The props expo-router passes to a custom `tabBar` (derived from its vendored types). */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'wb-sunny' },
  meals: { label: 'Meals', icon: 'restaurant' },
  streaks: { label: 'Streaks', icon: 'local-fire-department' },
  weight: { label: 'Weight', icon: 'monitor-weight' },
  settings: { label: 'Settings', icon: 'settings' },
};

const ACTIVE = '#1E8A4C';
const ACTIVE_PILL = '#DCF0D8';

/**
 * Fresh Sage bottom navigation: 5 tabs (sage pill on the active one) plus a
 * floating camera FAB that opens the capture flow.
 * NOTE: FAB offset is a first pass — tweak after running on a device.
 */
export function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View>
      <Pressable
        accessibilityLabel="Capture a meal"
        onPress={() => router.push('/capture')}
        style={{ position: 'absolute', alignSelf: 'center', bottom: insets.bottom + 72, zIndex: 10 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }, shadows.fab]}
        >
          <Icon name="photo-camera" size={28} color={colors.white} />
        </LinearGradient>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopWidth: 1,
          borderTopColor: colors.navBorder,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          paddingHorizontal: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
              <View
                style={{
                  height: 32,
                  paddingHorizontal: focused ? 18 : 0,
                  borderRadius: 100,
                  backgroundColor: focused ? ACTIVE_PILL : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={tab.icon} size={23} color={focused ? ACTIVE : colors.muted} />
              </View>
              <AppText variant="caption" color={focused ? ACTIVE : colors.muted} style={{ fontSize: 11 }}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
