import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';

export default function PaymentMethodsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header title="Payment Methods" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, shadow.soft]}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={23} color={colors.skyBottom} />
          </View>
          <Text style={styles.title}>Secure checkout</Text>
          <Text style={styles.body}>
            Payments are completed through Paystack when you confirm a booking. Choose from the payment options enabled for your account during checkout.
          </Text>
          <View style={styles.divider} />
          <View style={styles.noteRow}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.success} />
            <Text style={styles.note}>
              LexRidesZA does not collect or store your card number or security code.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 18 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 18 },
  iconWrap: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink, marginTop: 16 },
  body: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20, marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 16 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  note: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.muted, lineHeight: 18 },
});
