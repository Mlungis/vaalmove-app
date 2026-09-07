import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const ROWS = [
  { key: 'push', label: 'Push notifications', meta: 'Booking updates, messages & alerts' },
  { key: 'email', label: 'Email notifications', meta: 'Receipts and account updates' },
  { key: 'sms', label: 'SMS notifications', meta: 'Pickup reminders via text' },
  { key: 'promotions', label: 'Promotions & offers', meta: 'Deals from LexRidesZA and providers' },
];

export default function NotificationSettingsScreen({ navigation }) {
  const { notificationSettings, updateNotificationSettings } = useAppContext();

  return (
    <View style={styles.container}>
      <Header title="Notification Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={[styles.card, shadow.soft]}>
          {ROWS.map((r, i) => (
            <View key={r.key} style={[styles.row, i === ROWS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{r.label}</Text>
                <Text style={styles.meta}>{r.meta}</Text>
              </View>
              <Switch
                value={notificationSettings[r.key]}
                onValueChange={(v) => updateNotificationSettings({ [r.key]: v })}
                trackColor={{ false: colors.hairline, true: colors.skyMid }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  meta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
});
