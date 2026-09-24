import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function startOAuth(provider) {
  const redirectTo = Platform.OS === 'web'
    ? window.location.origin
    : Linking.makeRedirectUri({
      scheme: 'lexridesza',
      path: 'auth/callback',
    });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider.toLowerCase(),
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error(`Unable to start ${provider} sign-in.`);

  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return null;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') return null;
  if (result.type !== 'success' || !result.url) {
    throw new Error(`Unable to complete ${provider} sign-in.`);
  }

  const callback = new URL(result.url);
  const code = callback.searchParams.get('code');
  if (code) {
    const exchange = await supabase.auth.exchangeCodeForSession(code);
    if (exchange.error) throw exchange.error;
    return result.url;
  }

  const hash = new URLSearchParams(callback.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (accessToken && refreshToken) {
    const session = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (session.error) throw session.error;
    return result.url;
  }

  throw new Error('The sign-in provider returned an incomplete session.');
}
