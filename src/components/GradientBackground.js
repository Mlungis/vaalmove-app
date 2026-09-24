import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function GradientBackground({ children, contentStyle }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C182B', colors.skyBottom, '#263B58']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blob1, styles.nonInteractive]} />
      <View style={[styles.blob, styles.blob2, styles.nonInteractive]} />
      <View style={[styles.blob, styles.blob3, styles.nonInteractive]} />
      <SafeAreaView style={[styles.safe, contentStyle]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nonInteractive: { pointerEvents: 'none' },
  safe: { flex: 1, justifyContent: 'space-between' },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 300, height: 300, top: -120, left: -90, backgroundColor: 'rgba(202,163,93,0.18)' },
  blob2: { width: 260, height: 260, bottom: 150, right: -110, backgroundColor: 'rgba(202,163,93,0.12)' },
  blob3: { width: 220, height: 220, bottom: -80, left: '15%', backgroundColor: 'rgba(4,12,26,0.35)' },
});
