import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SearchFilterScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Search Vehicles</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={styles.searchBox}>
          <Text style={styles.inputPlaceholder}>Bakkie · Vereeniging · 24-25 May</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.rowItem}><Text style={styles.rowLabel}>Location</Text><Text style={styles.rowValue}>Vereeniging</Text></View>
          <View style={styles.rowItem}><Text style={styles.rowLabel}>Date</Text><Text style={styles.rowValue}>24 May – 25 May</Text></View>
        </View>

        <View style={styles.optionsCard}>
          <Text style={styles.optionText}>Vehicle Type</Text>
          <Text style={styles.optionValue}>Bakkie</Text>
        </View>

        <View style={{ height: 20 }} />
        <View style={styles.footerAction}>
          <TouchableOpacity onPress={() => navigation.navigate('SearchResults')}>
            <Text style={styles.resultsCount}>Show 24 Results</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  searchBox: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, marginBottom: 12 },
  inputPlaceholder: { color: colors.muted, fontFamily: fonts.body },
  cardRow: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.hairline },
  rowItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  rowValue: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 15, marginTop: 6 },
  optionsCard: { backgroundColor: colors.surfaceAlt, marginTop: 12, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.hairline },
  optionText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  optionValue: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 15, marginTop: 6 },
  footerAction: { marginTop: 18, alignItems: 'center' },
  resultsCount: { backgroundColor: colors.skyBottom, color: colors.white, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, fontFamily: fonts.bodySemi }
});
