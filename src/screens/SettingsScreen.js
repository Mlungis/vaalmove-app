import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Alert } from '../lib/alerts';
import Header from '../components/Header';
import ListRow from '../components/ListRow';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function SettingsScreen({ navigation }) {
  const { deleteAccount } = useAppContext();

  return (
    <View style={styles.container}>
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionLabel}>Available in this preview</Text>
        <View style={[styles.card, shadow.soft]}>
          <Text style={styles.info}>
            The app currently uses English and South African rand (ZAR). Additional
            languages, USD display, dark mode, and biometric login are not available yet.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={[styles.card, shadow.soft, { paddingHorizontal: 12 }]}>
          <ListRow
            icon="trash-outline"
            label="Delete account"
            danger
            noBorder
            onPress={() =>
              Alert.alert('Delete account', 'This permanently deletes your account and data. This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete permanently',
                  style: 'destructive',
                  onPress: async () => {
                    const deleted = await deleteAccount();
                    if (!deleted) Alert.alert('Could not delete account', 'Please try again or contact support.');
                  },
                },
              ])
            }
          />
        </View>

        <Text style={styles.version}>LexRidesZA v1.0.0 (preview)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14 },
  info: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  version: { textAlign: 'center', color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, marginTop: 28 },
});
