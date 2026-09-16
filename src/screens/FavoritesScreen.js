import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function FavoritesScreen({ navigation }) {
  const { favoriteVehicles, toggleFavorite } = useAppContext();

  return (
    <View style={styles.container}>
      <Header title="Saved vehicles" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        {favoriteVehicles.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No saved vehicles yet"
            subtitle="Tap the heart icon on any vehicle to save it here."
          />
        ) : (
          favoriteVehicles.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={[styles.card, shadow.soft]}
              activeOpacity={0.85}
              onPress={() => navigation.getParent()?.navigate('Home', { screen: 'VehicleDetails', params: { id: it.id } })}
            >
              <Image source={{ uri: it.image }} style={styles.thumb} />
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>{it.title}</Text>
                <StarRating rating={it.rating} reviews={it.reviews} />
                <Text style={styles.price}>R{it.priceDaily}/day</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(it.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="heart" size={22} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
  body: { flex: 1 },
  title: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink, marginBottom: 4 },
  price: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.skyBottom, marginTop: 4 },
});
