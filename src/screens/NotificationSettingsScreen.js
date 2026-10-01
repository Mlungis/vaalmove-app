import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';

export default function NotificationSettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header title="Notification Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={[styles.card, shadow.soft]}>
          <Text style={styles.label}>Delivery preferences are not available yet</Text>
          <Text style={styles.meta}>
            Push, email, SMS, and promotional notifications are not configured. In-app
            notifications can still be viewed in your inbox.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink, marginTop: 14 },
  meta: { color: colors.muted, marginVertical: 14, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
});
