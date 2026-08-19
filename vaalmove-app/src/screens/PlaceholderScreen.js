import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

export default function PlaceholderScreen({ title, subtitle, actionText, onAction }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle || 'Your demo experience is ready for the next feature.'}</Text>
        {actionText ? (
          <TouchableOpacity style={styles.action} onPress={onAction}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  action: { marginTop: 16, backgroundColor: colors.skyBottom, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  actionText: { color: '#fff', fontFamily: fonts.bodySemi },
});
