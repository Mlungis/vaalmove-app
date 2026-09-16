import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import Header from '../components/Header';
import Chip from '../components/Chip';
import ListRow from '../components/ListRow';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function SettingsScreen({ navigation }) {
  const { appSettings, updateAppSettings } = useAppContext();
  const { language, currency, darkMode, biometric } = appSettings;

  return (
    <View style={styles.container}>
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionLabel}>Language</Text>
        <View style={styles.chipRow}>
          {['English', 'Afrikaans', 'isiZulu', 'Sesotho'].map((l) => (
            <Chip key={l} label={l} active={language === l} onPress={() => updateAppSettings({ language: l })} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Currency</Text>
        <View style={styles.chipRow}>
          {['ZAR (R)', 'USD ($)'].map((c) => (
            <Chip key={c} label={c} active={currency === c} onPress={() => updateAppSettings({ currency: c })} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={[styles.card, shadow.soft]}>
          <View style={styles.row}>
            <Text style={styles.label}>Dark mode</Text>
            <Switch value={darkMode} onValueChange={(value) => updateAppSettings({ darkMode: value })} trackColor={{ false: colors.hairline, true: colors.skyMid }} thumbColor="#fff" />
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Biometric login (Face/Touch ID)</Text>
            <Switch value={biometric} onValueChange={(value) => updateAppSettings({ biometric: value })} trackColor={{ false: colors.hairline, true: colors.skyMid }} thumbColor="#fff" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={[styles.card, shadow.soft, { paddingHorizontal: 12 }]}>
          <ListRow
            icon="trash-outline"
            label="Delete account"
            danger
            noBorder
            onPress={() =>
              Alert.alert('Delete account', 'This will permanently delete your account and data. This is disabled in the preview build.', [
                { text: 'OK' },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  label: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink, flex: 1, marginRight: 12 },
  version: { textAlign: 'center', color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, marginTop: 28 },
});
