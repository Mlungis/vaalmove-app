import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function MyBookingsScreen({ navigation }) {
  const { bookings, getVehicleById } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>2 upcoming trips</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {bookings.map((b) => {
          const vehicle = getVehicleById(b.vehicleId) || {};
          return (
            <TouchableOpacity key={b.id} style={styles.card} onPress={() => navigation.navigate('BookingSummary', { id: b.vehicleId })}>
              <Image source={{ uri: vehicle.image }} style={styles.thumb} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{vehicle.title || 'Vehicle'}</Text>
                <Text style={styles.itemDate}>{b.pickup ? `${b.pickup.replace('T', ' · ')}` : 'Upcoming'}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.status}>{b.status || 'Confirmed'}</Text>
                  <Text style={styles.amount}>R{b.total || vehicle.priceDaily}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  subtitle: { color: colors.muted, fontFamily: fonts.body, marginTop: 4 },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.hairline },
  thumb: { width: 68, height: 68, borderRadius: 12, marginRight: 12 },
  itemTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
  itemDate: { color: colors.muted, marginTop: 4, fontSize: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  status: { backgroundColor: '#E8F9EE', color: '#1DAA66', fontFamily: fonts.bodySemi, fontSize: 11, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  amount: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 13 },
});
