import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen({ navigation }) {
  const categories = [
    'Cars','Bakkies','Minibuses','Buses','Trucks','Trailers','Construction','Agriculture'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <Ionicons name="add" size={22} color={colors.skyBottom} />
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {categories.map((c) => (
          <TouchableOpacity key={c} style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('SearchResults', { category: c })}>
            <View style={styles.cardTop} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{c}</Text>
              <Text style={styles.cardMeta}>From R300/day</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  grid: { paddingHorizontal: 16, paddingBottom: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000' },
  cardTop: { height: 70, backgroundColor: 'rgba(63,141,255,0.12)' },
  cardBody: { padding: 12 },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  cardMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 6 },
});
