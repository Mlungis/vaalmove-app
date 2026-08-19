import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function ProviderDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Welcome back, Vaal Bakkies</Text>
          <Text style={styles.bannerMeta}>8 vehicles active • Last sync 4 mins ago</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>R28,450</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>348</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operational overview</Text>
          <View style={styles.inlineRow}><Text style={styles.muted}>Occupancy</Text><Text style={styles.bold}>74%</Text></View>
          <View style={styles.inlineRow}><Text style={styles.muted}>Accepted trips</Text><Text style={styles.bold}>18</Text></View>
          <View style={styles.inlineRow}><Text style={styles.muted}>Pending review</Text><Text style={styles.bold}>3</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Recent bookings</Text>
        <View style={styles.booking}><Text style={styles.bookingText}>Toyota Hilux 2.8 GD6</Text><Text style={styles.bookingMeta}>24 May 2025</Text></View>
        <View style={styles.booking}><Text style={styles.bookingText}>Ford Ranger 2.2</Text><Text style={styles.bookingMeta}>26 May 2025</Text></View>
        <View style={styles.booking}><Text style={styles.bookingText}>Mercedes Sprinter</Text><Text style={styles.bookingMeta}>29 May 2025</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 36 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  banner: { backgroundColor: colors.skyBottom, padding: 16, borderRadius: radius.md, marginTop: 12 },
  bannerTitle: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 16 },
  bannerMeta: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.body, marginTop: 6 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  stat: { backgroundColor: colors.surfaceAlt, flex: 1, marginRight: 8, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  statValue: { fontFamily: fonts.bodySemi, color: colors.ink },
  statLabel: { color: colors.muted, marginTop: 6, fontSize: 11 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.hairline },
  sectionTitle: { fontFamily: fonts.bodySemi, color: colors.ink, marginBottom: 10, marginTop: 14 },
  inlineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  muted: { color: colors.muted, fontFamily: fonts.body },
  bold: { color: colors.ink, fontFamily: fonts.bodySemi },
  booking: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, marginTop: 8 },
  bookingText: { fontFamily: fonts.bodySemi, color: colors.ink },
  bookingMeta: { color: colors.muted, marginTop: 4 },
});
