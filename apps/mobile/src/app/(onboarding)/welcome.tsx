import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appMeta } from '@/constants/app';
import { AppText, Icon, type IconName } from '@/components/ui';
import { api } from '@/lib/api';
import { signInWithGoogle } from '@/lib/auth';
import { queryClient } from '@/lib/queries';
import { colors, radius, spacing } from '@/theme';

const SPLIT_AT = appMeta.philosophy.indexOf('the process');
const PRE = appMeta.philosophy.slice(0, SPLIT_AT);
const EMPH = appMeta.philosophy.slice(SPLIT_AT);

const VALUES: { icon: IconName; label: string }[] = [
  { icon: 'calendar-today', label: 'Commit' },
  { icon: 'checklist', label: 'Your rules' },
  { icon: 'trending-up', label: 'See change' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // New session = different user; drop dev-user cache, then route by onboarding state.
      queryClient.clear();
      const profile = await api.getProfile().catch(() => null);
      router.replace(profile?.onboardingCompleted ? '/' : '/set-days');
    } catch (e) {
      Alert.alert('Sign-in unavailable', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <LinearGradient
        colors={['#EAF3E7', colors.appBg, colors.appBg]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }}
      />

      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }}>
        {/* wordmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="eco" size={19} color={colors.white} />
          </View>
          <AppText variant="heading" color={colors.ink} style={{ fontSize: 19 }}>
            Process
          </AppText>
        </View>

        {/* hero */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <AppText variant="display" color={colors.ink} style={{ fontSize: 32, lineHeight: 40 }}>
            {PRE}
            <AppText variant="display" color={colors.green} style={{ fontSize: 32, lineHeight: 40 }}>
              {EMPH}
            </AppText>
          </AppText>
          <AppText variant="bodyStrong" color={colors.muted} style={{ marginTop: 16, fontSize: 15 }}>
            Pick your days. Set your rules. Show up every day.
          </AppText>

          {/* value chips */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 28 }}>
            {VALUES.map((v) => (
              <View
                key={v.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.sageBorder,
                }}
              >
                <Icon name={v.icon} size={16} color={colors.green} />
                <AppText variant="caption" color={colors.ink}>
                  {v.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* sign in */}
        <Pressable
          onPress={handleGoogle}
          disabled={loading}
          style={{
            height: 54,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: '#DfE7DC',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: loading ? 0.6 : 1,
            ...{ shadowColor: '#285037', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.green} />
          ) : (
            <>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E2E2', alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="heading" color="#4285F4" style={{ fontSize: 14 }}>
                  G
                </AppText>
              </View>
              <AppText variant="itemTitle" color={colors.ink} style={{ fontSize: 15.5 }}>
                Continue with Google
              </AppText>
            </>
          )}
        </Pressable>
        <AppText variant="caption" color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: spacing.md }}>
          By continuing you agree to our Terms & Privacy.
        </AppText>
        <Pressable onPress={() => router.push('/set-days')} hitSlop={8} style={{ marginTop: 14, alignSelf: 'center' }}>
          <AppText variant="caption" color={colors.muted}>
            Skip for now (dev)
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
