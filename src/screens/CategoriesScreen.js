import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, fonts, radius, shadow } from '../theme';
import { CATEGORIES, useAppContext } from '../AppContext';

export default function CategoriesScreen({ navigation }) {
  const { vehicles } = useAppContext();

  return (
    <View style={styles.container}>
      <Header title="Categories" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((c) => {
          const count = vehicles.filter((v) => v.category === c.id).length;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.card, shadow.soft]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SearchResults', { category: c.id })}
            >
              <View style={styles.cardTop}>
                <MaterialCommunityIcons name={c.icon} size={28} color={colors.skyBottom} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{c.label}</Text>
                <Text style={styles.cardMeta}>{count} available · From R{c.from}/day</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  grid: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, marginBottom: 4, overflow: 'hidden' },
  cardTop: { height: 76, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 12 },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  cardMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 6 },
});
