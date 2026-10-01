import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Alert } from '../lib/alerts';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';

const FAQS = [
  { q: 'How do I cancel a booking?', a: 'Go to My Bookings, open the upcoming booking, and tap Cancel. Cancellation policies vary by provider.' },
  { q: 'How do I become a provider?', a: 'Open your Profile and tap Provider Dashboard, then Add New Listing to list a vehicle for rent.' },
  { q: 'What payment methods are accepted?', a: 'Checkout is handled securely by Paystack. The payment options available depend on what is enabled for your account in Paystack.' },
  { q: 'Is insurance included?', a: 'Coverage differs by vehicle. Check the listing details or message the provider to confirm insurance and mileage terms.' },
];

const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim();
const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();

export default function HelpSupportScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(null);

  function callSupport() {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() =>
      Alert.alert('Unavailable', 'Calling is not available on this device.')
    );
  }

  function emailSupport() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() =>
      Alert.alert('Unavailable', 'Email is not available on this device.')
    );
  }

  const supportChannels = [
    ...(SUPPORT_PHONE ? [{ label: 'Call us', icon: 'call-outline', onPress: callSupport }] : []),
    ...(SUPPORT_EMAIL ? [{ label: 'Email us', icon: 'mail-outline', onPress: emailSupport }] : []),
    {
      label: 'Messages',
      icon: 'chatbubble-outline',
      onPress: () => navigation.getParent()?.navigate('Messages'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={styles.contactRow}>
          {supportChannels.map((channel) => (
            <TouchableOpacity key={channel.label} style={[styles.contactCard, shadow.soft]} onPress={channel.onPress}>
              <Ionicons name={channel.icon} size={20} color={colors.skyBottom} />
              <Text style={styles.contactLabel}>{channel.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!SUPPORT_PHONE && !SUPPORT_EMAIL ? (
          <Text style={styles.contactNote}>
            Phone and email support contacts are not configured. Messages are available for existing conversations.
          </Text>
        ) : null}

        <Text style={styles.sectionLabel}>Frequently asked questions</Text>
        {FAQS.map((f, i) => (
          <TouchableOpacity key={f.q} style={[styles.faqCard, shadow.soft]} onPress={() => setOpenIndex(openIndex === i ? null : i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Ionicons name={openIndex === i ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
            </View>
            {openIndex === i ? <Text style={styles.faqA}>{f.a}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  contactCard: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', gap: 8 },
  contactLabel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink },
  contactNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 8 },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted, marginTop: 22, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  faqCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink, marginRight: 10 },
  faqA: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, marginTop: 10, lineHeight: 18 },
});
