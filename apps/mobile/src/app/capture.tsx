import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { useMealDraft } from '@/lib/meal-draft';
import { useAnalyzeMeal } from '@/lib/queries';
import { colors, gradient } from '@/theme';

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const analyze = useAnalyzeMeal();
  const setDraft = useMealDraft((s) => s.set);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    const cam = cameraRef.current;
    if (!cam) return;
    setBusy(true);
    try {
      const photo = await cam.takePictureAsync({ quality: 0.5, base64: true });
      if (!photo?.base64) throw new Error('Could not capture the photo.');
      const analysis = await analyze.mutateAsync({ image: photo.base64, mealType: 'lunch' });
      setDraft({ analysis, photoUri: photo.uri, mealType: 'lunch' });
      router.replace('/analysis');
    } catch (e) {
      Alert.alert('Analysis failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.appBg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
        <Icon name="photo-camera" size={40} color={colors.muted} />
        <AppText variant="bodyStrong" color={colors.ink} style={{ textAlign: 'center' }}>
          Camera access is needed to snap your meals.
        </AppText>
        <Button title="Grant camera access" onPress={requestPermission} />
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <AppText variant="caption" color={colors.muted}>
            Cancel
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '78%', aspectRatio: 1, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 24 }} />
        <AppText variant="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 14 }}>
          Fit your whole plate in frame
        </AppText>
      </View>

      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={{ position: 'absolute', top: insets.top + 10, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="close" size={24} color="#fff" />
      </Pressable>

      <View style={{ position: 'absolute', bottom: insets.bottom + 32, left: 0, right: 0, alignItems: 'center' }}>
        {busy ? (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <ActivityIndicator color="#fff" size="large" />
            <AppText variant="caption" color="#fff">
              Reading your plate…
            </AppText>
          </View>
        ) : (
          <Pressable onPress={capture}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 74, height: 74, borderRadius: 37, borderWidth: 5, borderColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="restaurant" size={28} color="#fff" />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}
