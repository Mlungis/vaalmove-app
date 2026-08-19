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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassView from '../components/GlassView';
import TextField from '../components/TextField';
import { PrimaryButton } from '../components/Buttons';
import { fonts, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Continue with ' + provider, 'This social login button is ready for your auth integration.');
  };

  return (
    <GradientBackground contentStyle={{ justifyContent: 'flex-start' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <GlassView soft style={styles.logoWrap}>
              <Text style={styles.logoText}>
                <Text style={styles.logoLex}>Lex</Text>
                RidesZA
              </Text>
            </GlassView>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to keep moving with LexRidesZA</Text>
          </View>

          <GlassView style={styles.card}>
            <View style={styles.cardInner}>
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
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword((v) => !v)}
              />

              <TouchableOpacity style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <View style={styles.socialSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialGrid}>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialLogin('Google')}
                  >
                    <MaterialCommunityIcons name="google" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('Apple')}
                  >
                    <MaterialCommunityIcons name="apple" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={() => handleSocialLogin('Facebook')}
                  >
                    <MaterialCommunityIcons name="facebook" size={18} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <PrimaryButton label="Log In" onPress={handleLogin} />
            </View>
          </GlassView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  header: { alignItems: 'center', marginBottom: 26 },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 18,
  },
  logoText: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 1,
    color: '#fff',
    textTransform: 'uppercase',
  },
  logoLex: {
    color: '#57d9ff',
    fontWeight: '800',
    textShadowColor: 'rgba(87, 217, 255, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: '#fff' },
  subtitle: { fontFamily: fonts.body, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  card: { borderRadius: radius.xl, alignItems: 'stretch' },
  cardInner: { width: '100%', padding: 22 },
  forgot: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 18 },
  forgotText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: 'rgba(255,255,255,0.8)' },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { fontFamily: fonts.body, fontSize: 13.5, color: 'rgba(255,255,255,0.75)' },
  footerLink: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#fff' },
});
