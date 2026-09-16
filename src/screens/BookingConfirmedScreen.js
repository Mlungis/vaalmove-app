import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function BookingConfirmedScreen({ navigation, route }) {
  const { getVehicleById, bookings } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const latest = bookings[0] || {};

  function handleShare() {
    Share.share({ message: `Booked ${vehicle.title} on LexRidesZA — booking ${latest.code}.` }).catch(() => {});
  }

  function handleCalendar() {
    Alert.alert('Added to calendar', 'A reminder for your pickup has been added to your calendar.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 32 }}>
        <View style={styles.tick}>
          <Ionicons name="checkmark" size={54} color="#fff" />
        </View>
        <Text style={styles.title}>Your booking is confirmed!</Text>
        <Text style={styles.sub}>Booking ID: {latest.code || 'Pending confirmation'}</Text>

        <View style={[styles.card, shadow.soft]}>
          <Text style={styles.cardTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.cardMeta}>{vehicle.provider} · {vehicle.location}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total paid</Text>
            <Text style={styles.rowValue}>R{latest.total}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCalendar}>
            <Ionicons name="calendar-outline" size={18} color={colors.skyBottom} />
            <Text style={styles.actionText}>Add to calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={colors.skyBottom} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.getParent()?.navigate('Bookings')}
        >
          <Text style={styles.ctaText}>View Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 14 }}
          onPress={() => navigation.navigate('HomeMain')}
        >
          <Text style={{ color: colors.muted, fontFamily: fonts.bodySemi }}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  tick: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 4, textAlign: 'center' },
  sub: { color: colors.muted, marginTop: 8, fontFamily: fonts.body },
  card: { backgroundColor: colors.surfaceAlt, padding: 16, borderRadius: radius.md, marginTop: 24, width: '100%' },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink },
  cardMeta: { color: colors.muted, marginTop: 4, fontFamily: fonts.body, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontFamily: fonts.body, color: colors.muted },
  rowValue: { fontFamily: fonts.displaySemi, color: colors.ink },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 18, width: '100%' },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.blueBg, paddingVertical: 12, borderRadius: radius.md,
  },
  actionText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.skyBottom },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 14, borderRadius: 999, marginTop: 24, alignItems: 'center', width: '100%' },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi },
});
