import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function SearchResultsScreen({ navigation, route }) {
  const { searchVehicles } = useAppContext();
  const items = searchVehicles(route?.params || {}) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.searchBox} onPress={() => navigation.navigate('SearchFilter')}>
          <Text style={styles.searchText}>Bakkie · Vereeniging · 24-25 May</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('SearchFilter')}>
          <Ionicons name="filter" size={18} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <Text style={styles.countLabel}>{items.length} vehicles available</Text>

      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 10 }}>
        {items.map((it) => (
          <TouchableOpacity key={it.id} style={styles.card} onPress={() => navigation.navigate('VehicleDetails', { id: it.id })}>
            <Image source={{ uri: it.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{it.title}</Text>
              <Text style={styles.cardMeta}>{`${it.year} · ${it.transmission} · ${it.fuel}`}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.provider}>{it.provider}</Text>
                <Text style={styles.rating}>★ {it.rating}</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.cardPrice}>{`R${it.priceDaily}`}</Text>
              <Text style={styles.cardPeriod}>/day</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 8 },
  searchBox: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  searchText: { color: colors.muted, fontFamily: fonts.body },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline },
  countLabel: { marginLeft: 18, color: colors.inkSoft, fontFamily: fonts.bodySemi, fontSize: 12 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline, flexDirection: 'row', alignItems: 'center', padding: 10 },
  cardImage: { width: 90, height: 84, borderRadius: 14, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
  cardMeta: { fontFamily: fonts.body, color: colors.muted, marginTop: 4, fontSize: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  provider: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
  rating: { color: '#F5A623', fontFamily: fonts.bodySemi, fontSize: 11 },
  priceBox: { marginLeft: 12, alignItems: 'flex-end' },
  cardPrice: { color: colors.skyBottom, fontFamily: fonts.displaySemi, fontSize: 16 },
  cardPeriod: { color: colors.muted, fontFamily: fonts.body, fontSize: 10 },
});
