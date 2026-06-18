import { expoClient } from '@better-auth/expo/client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** Better Auth client. Talks to {BASE}/api/auth; session token kept in SecureStore. */
export const authClient = createAuthClient({
  baseURL: BASE,
  plugins: [expoClient({ scheme: 'process', storagePrefix: 'process', storage: SecureStore })],
});

if (WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
}

/** Native Google sign-in -> verify the ID token on the server (Better Auth idToken flow). */
export async function signInWithGoogle() {
  if (!WEB_CLIENT_ID) {
    throw new Error('Google sign-in not configured yet (set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).');
  }
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  const idToken = res.data?.idToken;
  if (!idToken) throw new Error('No Google ID token returned.');
  return authClient.signIn.social({ provider: 'google', idToken: { token: idToken } });
}

export async function signOut() {
  await authClient.signOut();
  await GoogleSignin.signOut().catch(() => {});
}
