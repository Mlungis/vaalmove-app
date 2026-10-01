import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

function callbackUrl() {
  return Platform.OS === 'web'
    ? window.location.origin
    : Linking.makeRedirectUri({ scheme: 'lexridesza', path: 'payment/callback' });
}

export async function verifyPaystackPayment(reference) {
  const verification = await supabase.functions.invoke('paystack-transaction', {
    body: { action: 'verify', reference },
  });
  if (verification.error) throw verification.error;
  if (!verification.data?.paid) throw new Error('Paystack could not verify this payment.');
  return verification.data;
}

export async function payForBooking({ bookingId }) {
  const redirectTo = callbackUrl();
  const { data, error } = await supabase.functions.invoke('paystack-transaction', {
    body: { action: 'initialize', bookingId, callbackUrl: redirectTo },
  });
  if (error) throw error;
  if (!data?.authorization_url || !data?.reference) throw new Error('Paystack did not return a checkout session.');

  if (Platform.OS === 'web') {
    window.location.assign(data.authorization_url);
    return null;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.authorization_url, redirectTo);
  if (result.type !== 'success' || !result.url) throw new Error('Payment checkout was cancelled.');
  const callback = new URL(result.url);
  const reference = callback.searchParams.get('reference') || callback.searchParams.get('trxref') || data.reference;
  return verifyPaystackPayment(reference);
}
