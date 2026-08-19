import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

export function PrimaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.primary, style]} onPress={onPress}>
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ label, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={[styles.ghost, style]} onPress={onPress}>
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#061A3C',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.skyBottom,
  },
  ghost: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ghostText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
  },
});
