import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export default function LoadingState({ label = 'Preparing your experience...' }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.orbit}>
        <ActivityIndicator size="small" color="#E8D5B2" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.skyBottom,
    padding: 32,
  },
  orbit: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(232,213,178,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  label: {
    color: '#E8D5B2',
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
