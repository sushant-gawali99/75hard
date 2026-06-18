import { Redirect, Tabs } from 'expo-router';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { useProfile } from '@/lib/queries';

export default function TabsLayout() {
  const { data: profile, isLoading, isError } = useProfile();
  if (isLoading) return null;
  // Route un-onboarded users to Welcome (only when the API actually answered).
  if (!isError && (profile === null || profile?.onboardingCompleted === false)) {
    return <Redirect href="/welcome" />;
  }
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="meals" options={{ title: 'Meals' }} />
      <Tabs.Screen name="streaks" options={{ title: 'Streaks' }} />
      <Tabs.Screen name="weight" options={{ title: 'Weight' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
