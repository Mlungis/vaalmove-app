import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function BookingConfirmedScreen({ navigation, route }) {
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 }}>
        <View style={styles.tickWrap}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>
        <Text style={styles.title}>Your booking is confirmed!</Text>
        <Text style={styles.sub}>Booking ID: VM2505247846</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.cardMeta}>20 Aug – 21 Aug 2025</Text>
          <Text style={styles.status}>Status: Confirmed</Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => navigation.getParent?.().navigate('Bookings')}>
          <Text style={styles.ctaText}>View Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 14 }} onPress={() => navigation.getParent?.().navigate('Home')}>
          <Text style={{ color: colors.muted, fontFamily: fonts.bodySemi }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  tickWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#2FA85B', marginBottom: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#2FA85B', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  title: { fontFamily: fonts.displaySemi, fontSize: 24, color: colors.ink, marginTop: 12 },
  sub: { color: colors.muted, marginTop: 6, fontFamily: fonts.body },
  card: { backgroundColor: colors.surfaceAlt, padding: 16, borderRadius: radius.md, marginTop: 18, borderWidth: 1, borderColor: colors.hairline, width: '100%' },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink },
  cardMeta: { color: colors.muted, marginTop: 6 },
  status: { color: '#1DAA66', fontFamily: fonts.bodySemi, marginTop: 8 },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 12, borderRadius: 999, marginTop: 18, alignItems: 'center', width: '100%' },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi },
});
