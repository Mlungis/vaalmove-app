import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

function fmt(d) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BookingSummaryScreen({ navigation, route }) {
  const { getVehicleById, bookingDraft, setBookingDraft } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const draft = bookingDraft || {};
  const [agreed, setAgreed] = useState(false);

  const subtotal = draft.subtotal ?? vehicle.priceDaily ?? 0;
  const total = subtotal;

  function handleContinue() {
    if (!agreed) {
      Alert.alert('Almost there', 'Please accept the rental terms to continue.');
      return;
    }
    setBookingDraft({ ...draft, total });
    navigation.navigate('Payment', { id });
  }

  return (
    <View style={styles.container}>
      <Header title="Booking Summary" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={[styles.card, shadow.soft]}>
          {vehicle.image ? <Image source={{ uri: vehicle.image }} style={styles.hero} /> : <View style={[styles.hero, { backgroundColor: colors.blueBg }]} />}
          <Text style={styles.itemTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.itemMeta}>{vehicle.year ? `${vehicle.year} · ${vehicle.fuel} · ${vehicle.transmission}` : ''}</Text>
        </View>

        <View style={[styles.detailCard, shadow.soft]}>
          <View style={styles.row}><Text style={styles.label}>Pickup</Text><Text style={styles.value}>{fmt(draft.startDate)} · {draft.pickupTime || '08:00'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Return</Text><Text style={styles.value}>{fmt(draft.endDate)} · {draft.returnTime || '17:00'}</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.label}>Location</Text><Text style={styles.value}>{vehicle.location || 'Provider pickup location'}</Text></View>
        </View>

        <View style={[styles.feesCard, shadow.soft]}>
          <View style={styles.row}><Text style={styles.feeLabel}>{draft.days || 1} Day{(draft.days || 1) === 1 ? '' : 's'} Rental</Text><Text style={styles.feeValue}>R{subtotal}</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.feeLabel}>Insurance</Text><Text style={styles.feeValue}>Provider terms</Text></View>
          <View style={[styles.row, { marginTop: 6, borderBottomWidth: 0 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed((v) => !v)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
          </View>
          <Text style={styles.checkLabel}>I agree to the rental terms, mileage limits, and cancellation policy.</Text>
        </TouchableOpacity>

        <PrimaryButton label="Proceed to Payment" onPress={handleContinue} style={{ backgroundColor: colors.skyBottom }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md },
  hero: { height: 120, borderRadius: 12, width: '100%' },
  itemTitle: { fontFamily: fonts.bodySemi, marginTop: 10, fontSize: 15, color: colors.ink },
  itemMeta: { color: colors.muted, marginTop: 4, fontSize: 12, fontFamily: fonts.body },
  detailCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  label: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  value: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 13 },
  feesCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginTop: 14 },
  feeLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  feeValue: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  totalLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink },
  totalValue: { color: colors.skyBottom, fontFamily: fonts.displaySemi, fontSize: 17 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 18, marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.skyBottom, borderColor: colors.skyBottom },
  checkLabel: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
});
