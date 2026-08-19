import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function BookingSummaryScreen({ navigation, route }) {
  const { getVehicleById } = useAppContext();
  const params = route?.params || {};
  const id = params.id;
  const vehicle = getVehicleById(id) || {};

  const base = vehicle.priceDaily || 850;
  const insurance = 120;
  const fee = 80;
  const total = base + insurance + fee;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.title}>Booking Summary</Text>

        <View style={styles.card}>
          <Image source={{ uri: vehicle.image }} style={styles.hero} resizeMode="cover" />
          <Text style={styles.itemTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.itemMeta}>{vehicle.year ? `${vehicle.year} · ${vehicle.fuel} · ${vehicle.transmission}` : ''}</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.row}><Text style={styles.label}>Pickup</Text><Text style={styles.value}>{params.pickupDate || '20 Aug'} · {params.pickupTime || '08:00'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Return</Text><Text style={styles.value}>{params.returnDate || '21 Aug'} · {params.returnTime || '17:00'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>Vereeniging, Gauteng</Text></View>
        </View>

        <View style={styles.feesCard}>
          <View style={styles.row}><Text style={styles.feeLabel}>Base rental</Text><Text style={styles.feeValue}>R{base}</Text></View>
          <View style={styles.row}><Text style={styles.feeLabel}>Insurance</Text><Text style={styles.feeValue}>R{insurance}</Text></View>
          <View style={styles.row}><Text style={styles.feeLabel}>Service fee</Text><Text style={styles.feeValue}>R{fee}</Text></View>
          <View style={[styles.row, styles.totalLine]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Payment', { id, pickupDate: params.pickupDate, returnDate: params.returnDate, pickupTime: params.pickupTime, returnTime: params.returnTime })}>
          <Text style={styles.ctaText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 12 },
  card: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  hero: { height: 120, borderRadius: 12, marginBottom: 10 },
  itemTitle: { fontFamily: fonts.bodySemi, fontSize: 16 },
  itemMeta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  detailCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.hairline },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  label: { color: colors.muted, fontFamily: fonts.body },
  value: { color: colors.ink, fontFamily: fonts.bodySemi, maxWidth: '58%' },
  feesCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.hairline },
  feeLabel: { fontFamily: fonts.body, color: colors.inkSoft },
  feeValue: { fontFamily: fonts.bodySemi, color: colors.ink },
  totalLine: { marginTop: 8, borderBottomWidth: 0 },
  totalLabel: { fontFamily: fonts.bodySemi, color: colors.ink },
  totalValue: { color: colors.skyBottom, fontFamily: fonts.bodySemi },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 14, borderRadius: 999, marginTop: 18, alignItems: 'center' },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi },
});
