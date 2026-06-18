/**
 * Font loading. Plus Jakarta Sans (headings) + Inter (body), matching the design system.
 * RN doesn't synthesize weights — each weight is a separately-named family (see typography.ts).
 */
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export const fontsToLoad = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

/** Load app fonts. Gate first render on `loaded` so text never flashes in a fallback face. */
export function useAppFonts() {
  const [loaded, error] = useFonts(fontsToLoad);
  return { loaded, error };
}
