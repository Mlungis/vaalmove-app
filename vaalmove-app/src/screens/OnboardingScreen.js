import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GlassView from '../components/GlassView';
import CarIllustration from '../components/CarIllustration';
import { PrimaryButton, GhostButton } from '../components/Buttons';
import { fonts, radius } from '../theme';

export default function OnboardingScreen({ navigation }) {
  return (
    <GradientBackground>
      <View style={styles.content}>
        <GlassView soft style={styles.brandIcon}>
          <MaterialCommunityIcons name="bus" size={34} color="#fff" />
        </GlassView>

        <View style={styles.heroImageWrap}>
          <View style={styles.skyGlow} />
          <View style={styles.cloud} />
          <View style={styles.cloudTwo} />
          <View style={styles.hill} />
          <View style={styles.roadLine} />

          <View style={styles.carScene}>
            <CarIllustration />
          </View>
        </View>

        <GlassView style={styles.fleetPanel}>
          <View style={styles.fleetRow}>
            <GlassView soft style={styles.fleetChip}>
              <MaterialCommunityIcons name="car" size={24} color="#fff" />
            </GlassView>
            <GlassView soft style={styles.fleetChip}>
              <MaterialCommunityIcons name="truck" size={24} color="#fff" />
            </GlassView>
            <GlassView soft style={styles.fleetChip}>
              <MaterialCommunityIcons name="bus-side" size={24} color="#fff" />
            </GlassView>
          </View>
          <Text style={styles.fleetCaption}>Fleet available near you</Text>
        </GlassView>

        <View style={styles.copy}>
          <Text style={styles.wordmark}>
            Vaal<Text style={styles.wordmarkLex}>Move</Text>
          </Text>
          <Text style={styles.tagline}>Move smarter. Move faster.</Text>
          <Text style={styles.desc}>
            Premium rides, executive shuttles, and reliable transport for every trip across the city.
          </Text>
        </View>
      </View>

      <View style={styles.ctaStack}>
        <PrimaryButton label="Get Started" onPress={() => navigation.navigate('Signup')} />
        <GhostButton label="I already have an account" onPress={() => navigation.navigate('Login')} />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 28 },
  brandIcon: { width: 76, height: 76, borderRadius: radius.lg, marginBottom: 20 },
  heroImageWrap: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    marginBottom: 18,
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  skyGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -30,
    left: -20,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  cloud: {
    position: 'absolute',
    width: 90,
    height: 36,
    borderRadius: 20,
    top: 30,
    right: 48,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  cloudTwo: {
    position: 'absolute',
    width: 120,
    height: 42,
    borderRadius: 22,
    top: 54,
    right: 90,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  hill: {
    position: 'absolute',
    bottom: 36,
    left: -20,
    right: -20,
    height: 70,
    backgroundColor: 'rgba(37, 120, 197, 0.12)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  roadLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 54,
    backgroundColor: 'rgba(18, 62, 110, 0.26)',
  },
  carScene: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    height: 182,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fleetPanel: { width: '100%', paddingVertical: 22, paddingHorizontal: 20, borderRadius: radius.xl },
  fleetRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 16 },
  fleetChip: { width: 58, height: 58, borderRadius: radius.md },
  fleetCaption: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  copy: { marginTop: 30, alignItems: 'center' },
  wordmark: { fontFamily: fonts.display, fontSize: 34, color: '#fff', letterSpacing: -0.5 },
  wordmarkLex: { color: '#8EF7FF' },
  tagline: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 320,
  },
  ctaStack: { paddingHorizontal: 28, paddingBottom: 24, gap: 14 },
});