import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const METHODS = [
  { id: 'card', label: 'Card', detail: 'Visa / Mastercard' },
  { id: 'eft', label: 'Instant EFT', detail: 'Bank transfer in seconds' },
  { id: 'wallet', label: 'Wallet balance', detail: 'R501 available' },
  { id: 'cash', label: 'Cash on handover', detail: 'Pay on pickup' },
];

export default function PaymentScreen({ navigation, route }) {
  const { getVehicleById, addBooking } = useAppContext();
  const params = route?.params || {};
  const id = params.id;
  const vehicle = getVehicleById(id) || {};
  const total = (vehicle.priceDaily || 850) + 120 + 80;
  const [selectedMethod, setSelectedMethod] = useState('card');

  function handlePay() {
    const pickup = `${params.pickupDate || '20 Aug'} ${params.pickupTime || '08:00'}`;
    const dropoff = `${params.returnDate || '21 Aug'} ${params.returnTime || '17:00'}`;

    addBooking({
      vehicleId: id,
      pickup,
      return: dropoff,
      total,
      status: 'Confirmed',
      paymentMethod: selectedMethod,
    });

    navigation.navigate('BookingConfirmed', { id });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 18 }}>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total due</Text>
          <Text style={styles.amount}>{`R${total}`}</Text>
        </View>

        <View style={styles.methodsCard}>
          {METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.method, selectedMethod === method.id && styles.methodActive]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Ionicons name={selectedMethod === method.id ? 'radio-button-on' : 'radio-button-off'} size={16} color={selectedMethod === method.id ? colors.skyBottom : colors.muted} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodMeta}>{method.detail}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.cta} onPress={handlePay}>
          <Text style={styles.ctaText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  amountCard: { backgroundColor: colors.surfaceAlt, padding: 18, borderRadius: radius.md, marginTop: 12, borderWidth: 1, borderColor: colors.hairline },
  amountLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  amount: { fontFamily: fonts.displaySemi, fontSize: 28, color: colors.ink, marginTop: 8 },
  methodsCard: { marginTop: 18, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, padding: 8 },
  method: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 8 },
  methodActive: { backgroundColor: '#ECF6FF', borderWidth: 1, borderColor: 'rgba(20,69,158,0.12)' },
  methodLabel: { fontFamily: fonts.bodySemi, color: colors.ink },
  methodMeta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 14, borderRadius: 999, marginTop: 18, alignItems: 'center' },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi },
});
