import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './Buttons';
import { colors, fonts, radius } from '../theme';

export default function ErrorState({ title = 'Something went wrong', subtitle = 'Your data is safe. Please try again.', onRetry }) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={28} color={colors.skyMid} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onRetry ? <PrimaryButton label="Try again" onPress={onRetry} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 28 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: '#D7BC82',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 7, textAlign: 'center' },
  button: { marginTop: 18, minWidth: 140, paddingHorizontal: 22 },
});
