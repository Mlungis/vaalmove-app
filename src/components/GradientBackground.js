import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function GradientBackground({ children, contentStyle }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.skyTop, colors.skyMid, colors.skyBottom]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.blob, styles.blob1]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob2]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob3]} />
      <SafeAreaView style={[styles.safe, contentStyle]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: 'space-between' },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 260, height: 260, top: -90, left: -70, backgroundColor: 'rgba(255,255,255,0.22)' },
  blob2: { width: 220, height: 220, bottom: 160, right: -90, backgroundColor: 'rgba(255,255,255,0.14)' },
  blob3: { width: 180, height: 180, bottom: -60, left: '20%', backgroundColor: 'rgba(20,69,158,0.3)' },
});
