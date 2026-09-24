import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const METHOD_ICON = { card: 'card-outline', wallet: 'wallet-outline', eft: 'business-outline' };

export default function PaymentScreen({ navigation, route }) {
  const { getVehicleById, addBooking, bookingDraft, paymentMethods, addPaymentMethod } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const draft = bookingDraft || {};
  const total = draft.total ?? 0;

  const [selected, setSelected] = useState(paymentMethods.find((p) => p.isDefault)?.id || paymentMethods[0]?.id);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!selected && paymentMethods.length) {
      setSelected(paymentMethods.find((method) => method.isDefault)?.id || paymentMethods[0].id);
    }
  }, [paymentMethods, selected]);

  function withTime(value, time) {
    const date = new Date(value || Date.now());
    const [hours, minutes] = String(time || '08:00').split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date.toISOString();
  }

  async function handleAddCard() {
    const normalizedNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,16}$/.test(normalizedNumber)) {
      Alert.alert('Invalid card number', 'Enter a valid card number.');
      return;
    }
    if (!cardName.trim()) {
      Alert.alert('Missing cardholder name', 'Enter the name shown on the card.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      Alert.alert('Invalid expiry date', 'Use the MM/YY format.');
      return;
    }
    const last4 = normalizedNumber.slice(-4).padStart(4, '•');
    const method = await addPaymentMethod({ type: 'card', label: `Card •••• ${last4}`, meta: `Expires ${cardExpiry}` });
    if (!method) return;
    setSelected(method.id);
    setCardNumber(''); setCardName(''); setCardExpiry('');
    setShowAddCard(false);
  }

  async function handlePay() {
    setPaying(true);
    const booking = await addBooking({
      vehicleId: id,
      pickup: withTime(draft.startDate, draft.pickupTime),
      dropoff: withTime(draft.endDate || draft.startDate, draft.returnTime || '17:00'),
      total,
      subtotal: draft.subtotal,
      location: vehicle.location,
    });
    setPaying(false);
    if (booking) {
      navigation.navigate('BookingConfirmed', { id, bookingId: booking.id });
    } else {
      Alert.alert('Could not confirm booking', 'We could not save this booking. Check your connection and try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Payment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={[styles.amountCard, shadow.soft]}>
          <Text style={styles.amountLabel}>Amount due</Text>
          <Text style={styles.amount}>{`R${total}`}</Text>
        </View>

        <Text style={styles.sectionLabel}>Payment method</Text>
        <View style={[styles.methodsCard, shadow.soft]}>
          {paymentMethods.map((m) => (
            <TouchableOpacity key={m.id} style={styles.method} onPress={() => setSelected(m.id)}>
              <View style={styles.methodIcon}>
                <Ionicons name={METHOD_ICON[m.type] || 'card-outline'} size={18} color={colors.skyBottom} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodMeta}>{m.meta}</Text>
              </View>
              <View style={[styles.radio, selected === m.id && styles.radioActive]}>
                {selected === m.id ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.method, { borderBottomWidth: 0 }]} onPress={() => setShowAddCard(true)}>
            <View style={styles.methodIcon}>
              <Ionicons name="add" size={18} color={colors.skyBottom} />
            </View>
            <Text style={[styles.methodLabel, { color: colors.skyBottom }]}>Add new card</Text>
          </TouchableOpacity>
        </View>
        {!paymentMethods.length ? <Text style={styles.emptyMethods}>Add a payment method before submitting this booking.</Text> : null}

        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
          <Text style={styles.secureText}>Your booking is recorded as pending until the provider confirms payment.</Text>
        </View>

        <PrimaryButton
          label={paying ? 'Saving booking…' : 'Confirm booking'}
          onPress={paying || !selected ? undefined : handlePay}
          disabled={!selected}
          style={{ backgroundColor: colors.skyBottom }}
        />
        {paying ? <ActivityIndicator style={{ marginTop: 14 }} color={colors.skyBottom} /> : null}
      </ScrollView>

      <Modal visible={showAddCard} transparent animationType="slide" onRequestClose={() => setShowAddCard(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add card</Text>
              <TouchableOpacity onPress={() => setShowAddCard(false)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={16}
            />
            <TextInput
              style={styles.input}
              placeholder="Name on card"
              placeholderTextColor={colors.muted}
              value={cardName}
              onChangeText={setCardName}
            />
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor={colors.muted}
              value={cardExpiry}
              onChangeText={setCardExpiry}
              maxLength={5}
            />
            <PrimaryButton label="Save card" onPress={handleAddCard} style={{ backgroundColor: colors.skyBottom, marginTop: 6 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  amountCard: { backgroundColor: colors.surfaceAlt, padding: 18, borderRadius: radius.md, alignItems: 'center' },
  amountLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  amount: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginTop: 6 },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft, marginTop: 22, marginBottom: 10 },
  methodsCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  methodIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  methodMeta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.skyBottom },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.skyBottom },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 18 },
  secureText: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  emptyMethods: { fontFamily: fonts.body, fontSize: 12, color: colors.warning, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 12, borderWidth: 1, borderColor: colors.hairline,
  },
});
