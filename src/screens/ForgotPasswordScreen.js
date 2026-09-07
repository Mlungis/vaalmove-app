import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassView from '../components/GlassView';
import TextField from '../components/TextField';
import { PrimaryButton } from '../components/Buttons';
import { fonts, radius } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSend() {
    if (!email.trim()) return setError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  }

  return (
    <GradientBackground contentStyle={{ justifyContent: 'flex-start' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <GlassView soft style={styles.headerIcon}>
              <Ionicons name={sent ? 'mail-open-outline' : 'key-outline'} size={26} color="#fff" />
            </GlassView>
            <Text style={styles.title}>{sent ? 'Check your inbox' : 'Reset your password'}</Text>
            <Text style={styles.subtitle}>
              {sent
                ? `We've sent password reset instructions to ${email}.`
                : "Enter the email linked to your account and we'll send you a reset link."}
            </Text>
          </View>

          <GlassView style={styles.card}>
            <View style={styles.cardInner}>
              {sent ? (
                <>
                  <PrimaryButton label="Back to Log In" onPress={() => navigation.navigate('Login')} />
                  <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={handleSend}>
                    <Text style={styles.resend}>Didn't get it? Resend email</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextField
                    label="Email"
                    icon="mail-outline"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={error}
                  />
                  <PrimaryButton label={loading ? 'Sending…' : 'Send reset link'} onPress={loading ? undefined : handleSend} />
                </>
              )}
            </View>
          </GlassView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  header: { alignItems: 'center', marginBottom: 22 },
  headerIcon: { width: 60, height: 60, borderRadius: 18, marginBottom: 16 },
  title: { fontFamily: fonts.display, fontSize: 22, color: '#fff', textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: { borderRadius: radius.xl, alignItems: 'stretch' },
  cardInner: { width: '100%', padding: 22 },
  resend: { fontFamily: fonts.bodySemi, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  footer: { alignItems: 'center', marginTop: 22 },
  footerLink: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#fff' },
});
