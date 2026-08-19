import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../AppContext';

export default function SearchResultsScreen({ navigation }) {
  const { vehicles } = useAppContext();
  const items = vehicles || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.searchBox} onPress={() => navigation.navigate('SearchFilter')}>
          <Text style={styles.searchText}>Bakkie · Vereeniging · 24-25 May</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><Ionicons name="filter" size={18} color={colors.ink} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {items.map((it) => (
          <TouchableOpacity key={it.id} style={styles.card} onPress={() => navigation.navigate('VehicleDetails', { id: it.id })}>
            <View style={styles.cardTop} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{it.title}</Text>
              <Text style={styles.cardMeta}>{`${it.year} · ${it.transmission} · ${it.fuel}`}</Text>
            </View>
            <Text style={styles.cardPrice}>{`R${it.priceDaily}/day`}</Text>
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
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline, flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardTop: { width: 60, height: 60, borderRadius: 10, backgroundColor: 'rgba(63,141,255,0.12)', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodySemi, color: colors.ink },
  cardMeta: { fontFamily: fonts.body, color: colors.muted, marginTop: 6, fontSize: 12 },
  cardPrice: { color: colors.skyBottom, fontFamily: fonts.bodySemi, marginLeft: 8 }
});
