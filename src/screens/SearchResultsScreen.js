import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import Chip from '../components/Chip';
import { colors, fonts, radius, shadow } from '../theme';
import { CATEGORIES, useAppContext } from '../AppContext';

export default function SearchResultsScreen({ navigation, route }) {
  const { filters, updateFilters, filteredVehicles, isFavorite, toggleFavorite } = useAppContext();

  useEffect(() => {
    if (route?.params?.category !== undefined) updateFilters({ category: route.params.category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.category]);

  const items = filteredVehicles();
  const activeCategory = CATEGORIES.find((c) => c.id === filters.category);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.searchBox} onPress={() => navigation.navigate('SearchFilter')}>
          <Ionicons name="search" size={15} color={colors.muted} />
          <Text style={styles.searchText} numberOfLines={1}>
            {activeCategory ? activeCategory.label : 'All vehicles'} · {filters.location || 'Any location'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('SearchFilter')}>
          <Ionicons name="options-outline" size={18} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="Any type" active={!filters.category} onPress={() => updateFilters({ category: null })} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} active={filters.category === c.id} onPress={() => updateFilters({ category: c.id })} />
          ))}
        </ScrollView>
      </View>

      <Text style={styles.resultCount}>{items.length} vehicle{items.length === 1 ? '' : 's'} found</Text>

      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 6, flexGrow: 1 }}>
        {items.length === 0 ? (
          <EmptyState icon="car-outline" title="No vehicles match your filters" subtitle="Try widening your price range or choosing a different category." />
        ) : (
          items.map((it) => (
            <TouchableOpacity key={it.id} style={[styles.card, shadow.soft]} onPress={() => navigation.navigate('VehicleDetails', { id: it.id })}>
              <Image source={{ uri: it.image }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{it.title}</Text>
                <Text style={styles.cardMeta}>{`${it.year} · ${it.transmission || 'N/A'} · ${it.fuel || 'N/A'}`}</Text>
                <StarRating rating={it.rating} reviews={it.reviews} />
              </View>
              <View style={styles.cardRight}>
                <TouchableOpacity onPress={() => toggleFavorite(it.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={isFavorite(it.id) ? 'heart' : 'heart-outline'} size={19} color={isFavorite(it.id) ? colors.danger : colors.muted} />
                </TouchableOpacity>
                <Text style={styles.cardPrice}>{`R${it.priceDaily}`}</Text>
                <Text style={styles.cardPriceUnit}>/day</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: 'row', padding: 14, alignItems: 'center', gap: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  searchText: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 13, flex: 1 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline },
  chipBar: { paddingLeft: 14 },
  resultCount: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, paddingHorizontal: 18, paddingTop: 10 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardImage: { width: 68, height: 68, borderRadius: 12, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 14.5 },
  cardMeta: { fontFamily: fonts.body, color: colors.muted, marginTop: 4, marginBottom: 6, fontSize: 12 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardPrice: { color: colors.skyBottom, fontFamily: fonts.displaySemi, fontSize: 15, marginTop: 6 },
  cardPriceUnit: { color: colors.muted, fontFamily: fonts.body, fontSize: 10 },
});
