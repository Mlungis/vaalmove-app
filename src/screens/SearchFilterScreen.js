import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Chip from '../components/Chip';
import DateRangeCalendar from '../components/DateRangeCalendar';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { CATEGORIES, useAppContext } from '../AppContext';

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

export default function SearchFilterScreen({ navigation, route }) {
  const { filters, updateFilters } = useAppContext();
  const [showCalendar, setShowCalendar] = useState(false);
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    const patch = {};
    if (route?.params?.category !== undefined) patch.category = route.params.category;
    if (route?.params?.query) patch.query = route.params.query;
    if (Object.keys(patch).length) setLocal((s) => ({ ...s, ...patch }));
  }, [route?.params]);

  function apply(patch) {
    setLocal((s) => ({ ...s, ...patch }));
  }

  function step(field, amount) {
    setLocal((s) => {
      const next = { ...s, [field]: Math.max(0, s[field] + amount) };
      if (field === 'minPrice' && next.minPrice > next.maxPrice) next.maxPrice = next.minPrice;
      if (field === 'maxPrice' && next.maxPrice < next.minPrice) next.minPrice = next.maxPrice;
      return next;
    });
  }

  function handleShowResults() {
    updateFilters(local);
    navigation.navigate('SearchResults');
  }

  return (
    <View style={styles.container}>
      <Header title="Search Vehicles" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={styles.searchBox}>
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Location"
            placeholderTextColor={colors.muted}
            value={local.location}
            onChangeText={(t) => apply({ location: t })}
          />
        </View>

        <TouchableOpacity style={[styles.searchBox, { marginTop: 10 }]} onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar-outline" size={16} color={colors.muted} />
          <Text style={styles.dateText}>
            {local.startDate ? fmtDate(local.startDate) : 'Start date'}
            {' – '}
            {local.endDate ? fmtDate(local.endDate) : 'End date'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Vehicle type</Text>
        <View style={styles.chipRow}>
          <Chip label="Any type" active={!local.category} onPress={() => apply({ category: null })} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} active={local.category === c.id} onPress={() => apply({ category: c.id })} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Transmission</Text>
        <View style={styles.chipRow}>
          <Chip label="Any" active={!local.transmission} onPress={() => apply({ transmission: null })} />
          <Chip label="Manual" active={local.transmission === 'Manual'} onPress={() => apply({ transmission: 'Manual' })} />
          <Chip label="Automatic" active={local.transmission === 'Automatic'} onPress={() => apply({ transmission: 'Automatic' })} />
        </View>

        <Text style={styles.sectionLabel}>Price per day</Text>
        <View style={[styles.priceCard, shadow.soft]}>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Min</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => step('minPrice', -100)}><Ionicons name="remove" size={16} color={colors.ink} /></TouchableOpacity>
                <Text style={styles.priceValue}>R{local.minPrice}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => step('minPrice', 100)}><Ionicons name="add" size={16} color={colors.ink} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Max</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => step('maxPrice', -100)}><Ionicons name="remove" size={16} color={colors.ink} /></TouchableOpacity>
                <Text style={styles.priceValue}>R{local.maxPrice}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => step('maxPrice', 100)}><Ionicons name="add" size={16} color={colors.ink} /></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Sort by</Text>
        <View style={styles.chipRow}>
          <Chip label="Recommended" active={local.sort === 'recommended'} onPress={() => apply({ sort: 'recommended' })} />
          <Chip label="Price: Low to High" active={local.sort === 'price_low'} onPress={() => apply({ sort: 'price_low' })} />
          <Chip label="Price: High to Low" active={local.sort === 'price_high'} onPress={() => apply({ sort: 'price_high' })} />
          <Chip label="Top Rated" active={local.sort === 'rating'} onPress={() => apply({ sort: 'rating' })} />
        </View>

        <View style={{ height: 12 }} />
        <PrimaryButton
          label="Show Results"
          onPress={handleShowResults}
          style={{ backgroundColor: colors.skyBottom }}
        />
      </ScrollView>

      <Modal visible={showCalendar} animationType="slide" transparent onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select dates</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <DateRangeCalendar
              startDate={local.startDate ? new Date(local.startDate) : null}
              endDate={local.endDate ? new Date(local.endDate) : null}
              onChange={({ startDate, endDate }) => apply({ startDate, endDate })}
            />
            <View style={{ height: 14 }} />
            <PrimaryButton
              label="Done"
              onPress={() => setShowCalendar(false)}
              style={{ backgroundColor: colors.skyBottom }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.hairline,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  dateText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft, marginTop: 20, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  priceCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14 },
  priceRow: { flexDirection: 'row', gap: 14 },
  priceField: { flex: 1 },
  priceLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline,
  },
  priceValue: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
});
