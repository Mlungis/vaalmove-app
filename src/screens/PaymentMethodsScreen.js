import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const METHOD_ICON = { card: 'card-outline', wallet: 'wallet-outline', eft: 'business-outline' };

export default function PaymentMethodsScreen({ navigation }) {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  function handleAdd() {
    if (!cardNumber.trim() || !cardExpiry.trim()) return;
    const last4 = cardNumber.slice(-4).padStart(4, '•');
    addPaymentMethod({ type: 'card', label: `Card •••• ${last4}`, meta: `Expires ${cardExpiry}` });
    setCardNumber(''); setCardExpiry('');
    setShowAdd(false);
  }

  function handleRemove(m) {
    Alert.alert('Remove card', `Remove ${m.label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePaymentMethod(m.id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Header title="Payment Methods" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        {paymentMethods.length === 0 ? (
          <EmptyState icon="card-outline" title="No payment methods yet" subtitle="Add a card to make checkout faster." />
        ) : (
          paymentMethods.map((m) => (
            <View key={m.id} style={[styles.card, shadow.soft]}>
              <View style={styles.iconWrap}>
                <Ionicons name={METHOD_ICON[m.type] || 'card-outline'} size={18} color={colors.skyBottom} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{m.label}</Text>
                <Text style={styles.meta}>{m.meta}</Text>
              </View>
              {m.isDefault ? (
                <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
              ) : (
                <TouchableOpacity onPress={() => setDefaultPaymentMethod(m.id)}>
                  <Text style={styles.setDefault}>Set default</Text>
                </TouchableOpacity>
              )}
              {m.type !== 'wallet' ? (
                <TouchableOpacity onPress={() => handleRemove(m)} style={{ marginLeft: 12 }}>
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add-circle-outline" size={18} color={colors.skyBottom} />
          <Text style={styles.addBtnText}>Add new card</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add card</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Card number" placeholderTextColor={colors.muted} keyboardType="number-pad" value={cardNumber} onChangeText={setCardNumber} maxLength={16} />
            <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor={colors.muted} value={cardExpiry} onChangeText={setCardExpiry} maxLength={5} />
            <PrimaryButton label="Save card" onPress={handleAdd} style={{ backgroundColor: colors.skyBottom }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  meta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
  defaultBadge: { backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  defaultText: { color: colors.success, fontFamily: fonts.bodySemi, fontSize: 10.5 },
  setDefault: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14, marginTop: 6 },
  addBtnText: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 13.5 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 12, borderWidth: 1, borderColor: colors.hairline,
  },
});
