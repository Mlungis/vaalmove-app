import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, radius } from '../theme';

export function PrimaryButton({ label, onPress, style, textStyle, disabled, loading }) {
  // Variant detection: if a custom backgroundColor is passed in `style`,
  // switch to white text automatically so the label never disappears
  // against a colored background (the default variant is a white pill
  // with blue text, used on the gradient onboarding/auth screens).
  const flatStyle = StyleSheet.flatten(style) || {};
  const isColoredVariant = !!flatStyle.backgroundColor && flatStyle.backgroundColor !== colors.white;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.primary,
        isColoredVariant && styles.primaryColored,
        style,
        isDisabled && styles.primaryDisabled,
      ]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isColoredVariant ? '#fff' : colors.skyBottom} />
      ) : (
        <Text style={[styles.primaryText, isColoredVariant && styles.primaryTextColored, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function GhostButton({ label, onPress, style, disabled }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={[styles.ghost, style]} onPress={onPress} disabled={disabled}>
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
  primaryColored: {
    shadowOpacity: 0.18,
  },
  primaryDisabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.skyBottom,
  },
  primaryTextColored: {
    color: '#fff',
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

