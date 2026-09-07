import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function DriverDashboardScreen({ navigation }) {
  const { getDriverDashboard } = useAppContext();
  const data = getDriverDashboard();

  return (
    <View style={styles.container}>
      <Header title="Driver Dashboard" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 36 }}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Fleet overview</Text>
          <Text style={styles.heroTitle}>Today’s dispatch status</Text>
          <View style={styles.overviewRow}>
            {Object.entries(data.overview).map(([key, value]) => (
              <View key={key} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{key === 'activeTrips' ? 'Trips' : key === 'onTimeRate' ? 'On-time' : key === 'avgEta' ? 'Avg ETA' : 'Revenue'}</Text>
                <Text style={styles.metricValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Route health</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Track')}>
            <Text style={styles.linkText}>Open map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {data.routeHealth.map((item) => (
            <View key={item.id} style={styles.routeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>{item.route}</Text>
                <Text style={styles.routeMeta}>{item.driver}</Text>
              </View>
              <View style={styles.routeRight}>
                <Text style={[styles.routeStatus, item.status === 'Delayed 4 min' ? styles.statusWarning : styles.statusSuccess]}>{item.status}</Text>
                <Text style={styles.routeEta}>{item.eta}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>
        <View style={styles.alertCard}>
          {data.liveAlerts.map((alert) => (
            <View key={alert} style={styles.alertRow}>
              <Ionicons name="alert-circle" size={15} color={colors.warning} />
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick reminders</Text>
        </View>
        <View style={styles.reminderRow}>
          {data.reminders.map((item) => (
            <View key={item.label} style={[styles.reminderCard, item.tone === 'warning' ? styles.warningCard : item.tone === 'success' ? styles.successCard : styles.infoCard]}>
              <Text style={styles.reminderLabel}>{item.label}</Text>
              <Text style={styles.reminderValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  heroCard: { backgroundColor: colors.skyBottom, borderRadius: radius.lg, padding: 18 },
  heroLabel: { fontFamily: fonts.body, fontSize: 11.5, color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontFamily: fonts.displaySemi, fontSize: 22, color: '#fff', marginTop: 6 },
  overviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  metricCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, padding: 12, width: '48%' },
  metricLabel: { fontFamily: fonts.body, fontSize: 10.5, color: 'rgba(255,255,255,0.8)' },
  metricValue: { fontFamily: fonts.displaySemi, fontSize: 18, color: '#fff', marginTop: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.skyBottom },
  listCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.hairline },
  routeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  routeTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  routeMeta: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 3 },
  routeRight: { alignItems: 'flex-end' },
  routeStatus: { fontFamily: fonts.bodySemi, fontSize: 10.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  routeEta: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink, marginTop: 4 },
  statusWarning: { backgroundColor: colors.warningBg, color: colors.warning },
  statusSuccess: { backgroundColor: colors.successBg, color: colors.success },
  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.hairline },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8 },
  alertText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reminderCard: { flexBasis: '31%', borderRadius: radius.md, padding: 12, minHeight: 90 },
  warningCard: { backgroundColor: colors.warningBg },
  successCard: { backgroundColor: colors.successBg },
  infoCard: { backgroundColor: colors.blueBg },
  reminderLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  reminderValue: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink, marginTop: 10 },
});
