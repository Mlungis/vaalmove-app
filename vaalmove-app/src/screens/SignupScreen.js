import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassView from '../components/GlassView';
import TextField from '../components/TextField';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius } from '../theme';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignup = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!phone.trim()) next.phone = 'Phone number is required.';
    if (!password) next.password = 'Password is required.';
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) next.confirmPassword = "Passwords don't match.";
    if (!agreed) next.terms = 'You need to accept the terms to continue.';

    setErrors(next);
    if (Object.keys(next).length === 0) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const handleSocialSignup = (provider) => {
    Alert.alert('Continue with ' + provider, 'Social sign-up is ready to connect to your auth provider.');
  };

  return (
    <GradientBackground contentStyle={{ justifyContent: 'flex-start' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <GlassView soft style={styles.headerIcon}>
              <Ionicons name="person-add-outline" size={26} color="#fff" />
            </GlassView>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join LexRidesZA — rent, ride, or offer your services</Text>
          </View>

          <GlassView style={styles.card}>
            <View style={styles.cardInner}>
              <TextField
                label="Full name"
                icon="person-outline"
                placeholder="Lesedi Moraba"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                error={errors.fullName}
              />
              <TextField
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <TextField
                label="Phone number"
                icon="call-outline"
                placeholder="082 000 0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                error={errors.phone}
              />
              <TextField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword((v) => !v)}
              />
              <TextField
                label="Confirm password"
                icon="lock-closed-outline"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                error={errors.confirmPassword}
                rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowConfirm((v) => !v)}
              />

              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed((v) => !v)}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed ? <Ionicons name="checkmark" size={13} color={colors.skyBottom} /> : null}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to LexRidesZA's Terms of Service and Privacy Policy.
                </Text>
              </TouchableOpacity>
              {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

              <View style={styles.socialSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialGrid}>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialSignup('Google')}
                  >
                    <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialSignup('Apple')}
                  >
                    <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={() => handleSocialSignup('Facebook')}
                  >
                    <Ionicons name="logo-facebook" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <PrimaryButton label="Create Account" onPress={handleSignup} />
            </View>
          </GlassView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 22 },
  headerIcon: { width: 60, height: 60, borderRadius: 18, marginBottom: 16 },
  title: { fontFamily: fonts.display, fontSize: 22, color: '#fff', textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    textAlign: 'center',
  },
  card: { borderRadius: radius.xl, alignItems: 'stretch' },
  cardInner: { width: '100%', padding: 22 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4, marginBottom: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#fff', borderColor: '#fff' },
  checkboxLabel: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  termsError: { fontFamily: fonts.bodySemi, fontSize: 12, color: '#FFD9D9', marginBottom: 14 },
  socialSection: { marginTop: 8, marginBottom: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: fonts.bodySemi,
    fontSize: 11.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
  },
  socialGrid: { gap: 10 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  googleButton: { backgroundColor: '#EA4335' },
  appleButton: { backgroundColor: '#111827' },
  facebookButton: { backgroundColor: '#1877F2' },
  socialButtonText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontFamily: fonts.body, fontSize: 13.5, color: 'rgba(255,255,255,0.75)' },
  footerLink: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#fff' },
});
