import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function VehicleDetailsScreen({ navigation, route }) {
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  const specs = [
    { label: 'Year', value: vehicle.year || '2022' },
    { label: 'Fuel', value: vehicle.fuel || 'Diesel' },
    { label: 'Transmission', value: vehicle.transmission || 'Auto' },
    { label: 'Seats', value: `${vehicle.seats || 5}` },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.heroWrap}>
          <Image source={{ uri: vehicle.image }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{vehicle.title || 'Vehicle'}</Text>
            <Text style={styles.meta}>{vehicle.provider || 'Verified provider'}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.score}>★ {vehicle.rating || '4.8'}</Text>
          </View>
        </View>

        <Text style={styles.metaLine}>
          {vehicle.year ? `${vehicle.year} · ${vehicle.fuel} · ${vehicle.transmission}` : ''}
          {vehicle.drivetrain ? ` · ${vehicle.drivetrain}` : ''}
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pricing</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{vehicle.priceDaily ? `R${vehicle.priceDaily}` : 'R--'}</Text>
            <Text style={styles.period}>/day</Text>
          </View>
          <Text style={styles.smallInfo}>Includes 150km/day, insurance, and roadside cover.</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vehicle highlights</Text>
          <View style={styles.specGrid}>
            {specs.map((item) => (
              <View key={item.label} style={styles.specItem}>
                <Text style={styles.specLabel}>{item.label}</Text>
                <Text style={styles.specValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What’s included</Text>
          <Text style={styles.listRow}>• Insurance cover</Text>
          <Text style={styles.listRow}>• Roadside assist</Text>
          <Text style={styles.listRow}>• Delivery within 30km</Text>
          <Text style={styles.listRow}>• Verified driver support</Text>
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => navigation.navigate('CheckAvailability', { id })}>
          <Text style={styles.ctaText}>Check Availability</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: colors.hairline },
  heroWrap: { height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 18, borderWidth: 1, borderColor: colors.hairline },
  heroImage: { width: '100%', height: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontFamily: fonts.displaySemi, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 4 },
  scoreBox: { backgroundColor: '#FFF4D9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  score: { fontFamily: fonts.bodySemi, color: '#D29B00', fontSize: 12 },
  metaLine: { fontFamily: fonts.body, color: colors.muted, marginBottom: 14 },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.hairline },
  infoTitle: { fontFamily: fonts.displaySemi, color: colors.ink, fontSize: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  price: { fontFamily: fonts.displaySemi, color: colors.skyBottom, fontSize: 28 },
  period: { fontFamily: fonts.body, color: colors.muted, marginLeft: 6 },
  smallInfo: { marginTop: 8, color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  specItem: { width: '48%', backgroundColor: '#F4F8FF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(20,69,158,0.10)' },
  specLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 11 },
  specValue: { fontFamily: fonts.bodySemi, color: colors.ink, marginTop: 6 },
  listRow: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 8 },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 14, borderRadius: 999, marginTop: 18, alignItems: 'center' },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi },
});
