import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Alert } from '../lib/alerts';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';
import { payForBooking } from '../lib/payments';

export default function PaymentScreen({ navigation, route }) {
  const { getVehicleById, addBooking, bookingDraft, setBookingDraft } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const draft = bookingDraft || {};
  const [paying, setPaying] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(draft.bookingId || null);
  const [amountDue, setAmountDue] = useState(draft.total ?? draft.subtotal ?? 0);

  function withTime(value, time) {
    const date = new Date(value || Date.now());
    const [hours, minutes] = String(time || '08:00').split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date.toISOString();
  }

  async function handlePay() {
    if (!id || !draft.startDate || !draft.endDate) {
      Alert.alert('Booking details missing', 'Choose your rental dates again before continuing.');
      return;
    }

    setPaying(true);
    try {
      let bookingId = draft.bookingId || pendingBookingId;
      if (!bookingId) {
        const booking = await addBooking({
          vehicleId: id,
          pickup: withTime(draft.startDate, draft.pickupTime),
          dropoff: withTime(draft.endDate, draft.returnTime || '17:00'),
          total: draft.total ?? draft.subtotal ?? 0,
          subtotal: draft.subtotal,
          location: vehicle.location,
          paymentStatus: 'unpaid',
        });
        bookingId = booking.id;
        setPendingBookingId(bookingId);
        setAmountDue(booking.total);
        setBookingDraft({ ...draft, bookingId, total: booking.total, subtotal: booking.subtotal });
      }

      const payment = await payForBooking({ bookingId });
      if (!payment && Platform.OS === 'web') return;
      if (!payment?.paid) throw new Error('Paystack could not verify this payment.');
      navigation.navigate('BookingConfirmed', { id, bookingId: payment.bookingId || bookingId });
    } catch (error) {
      Alert.alert('Payment not completed', error?.message || 'We could not complete this payment.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Payment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={[styles.amountCard, shadow.soft]}>
          <Text style={styles.amountLabel}>Amount due</Text>
          <Text style={styles.amount}>{`R${Number(amountDue).toFixed(2)}`}</Text>
        </View>

        <View style={[styles.checkoutCard, shadow.soft]}>
          <View style={styles.checkoutIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.skyBottom} />
          </View>
          <View style={styles.checkoutCopy}>
            <Text style={styles.checkoutTitle}>Secure checkout with Paystack</Text>
            <Text style={styles.checkoutText}>
              Your booking total is calculated by the server. We confirm the booking only after Paystack verifies the payment.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label={paying ? 'Preparing secure checkout…' : pendingBookingId ? 'Continue to payment' : 'Pay securely'}
          onPress={paying ? undefined : handlePay}
          style={{ backgroundColor: colors.skyBottom }}
        />
        {paying ? <ActivityIndicator style={{ marginTop: 14 }} color={colors.skyBottom} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  amountCard: { backgroundColor: colors.surfaceAlt, padding: 18, borderRadius: radius.md, alignItems: 'center' },
  amountLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  amount: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginTop: 6 },
  checkoutCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 16, marginVertical: 20 },
  checkoutIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  checkoutCopy: { flex: 1 },
  checkoutTitle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  checkoutText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 5 },
});
