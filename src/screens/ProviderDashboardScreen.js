import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function ProviderDashboardScreen({ navigation }) {
  const { user, session, vehicles, bookings, getVehicleById, updateVehicleStatus } = useAppContext();
  const myListings = vehicles.filter((v) => v.providerId === session?.user?.id || (user.providerName && v.provider === user.providerName));
  const [activeMap, setActiveMap] = useState(() => Object.fromEntries(myListings.map((v) => [v.id, v.status === 'published'])));

  useEffect(() => {
    setActiveMap(Object.fromEntries(myListings.map((vehicle) => [vehicle.id, vehicle.status === 'published'])));
  }, [myListings.map((vehicle) => `${vehicle.id}:${vehicle.status}`).join('|')]);

  const providerBookings = bookings
    .filter((b) => myListings.some((v) => v.id === b.vehicleId))
    .slice(0, 5);

  const earnings = providerBookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total : 0), 0);

  async function toggleActive(id) {
    const nextActive = !activeMap[id];
    if (await updateVehicleStatus(id, nextActive ? 'published' : 'paused')) {
      setActiveMap((current) => ({ ...current, [id]: nextActive }));
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Provider Dashboard" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Welcome back, {user.providerName}</Text>
          <Text style={styles.bannerSubtitle}>Here's how your listings are performing</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.stat, shadow.soft]}>
            <Text style={styles.statValue}>{myListings.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={[styles.stat, shadow.soft]}>
            <Text style={styles.statValue}>R{earnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={[styles.stat, shadow.soft]}>
            <Text style={styles.statValue}>{providerBookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your listings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddListing')}>
            <Text style={styles.link}>+ Add new</Text>
          </TouchableOpacity>
        </View>

        {myListings.length === 0 ? (
          <EmptyState icon="car-outline" title="No listings yet" subtitle="Add your first vehicle to start earning." />
        ) : (
          myListings.map((v) => (
            <View key={v.id} style={[styles.listingCard, shadow.soft]}>
              <Image source={{ uri: v.image }} style={styles.listingImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listingTitle} numberOfLines={1}>{v.title}</Text>
                <Text style={styles.listingMeta}>R{v.priceDaily}/day · {v.rating ? v.rating.toFixed(1) : 'New'} ★</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Switch
                  value={activeMap[v.id]}
                  onValueChange={() => toggleActive(v.id)}
                  trackColor={{ false: colors.hairline, true: colors.skyMid }}
                  thumbColor="#fff"
                />
                <Text style={styles.listingStatus}>{activeMap[v.id] ? 'Active' : 'Paused'}</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Recent bookings</Text>
        {providerBookings.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No bookings yet" />
        ) : (
          providerBookings.map((b) => {
            const v = getVehicleById(b.vehicleId) || {};
            return (
              <View key={b.id} style={[styles.booking, shadow.soft]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingTitle}>{v.title}</Text>
                  <Text style={styles.bookingMeta}>{new Date(b.pickup).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </View>
                <Text style={styles.bookingAmount}>R{b.total}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  banner: { backgroundColor: colors.skyBottom, padding: 16, borderRadius: radius.md },
  bannerTitle: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 15 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 14 },
  stat: { backgroundColor: colors.surfaceAlt, flex: 1, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  statValue: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink },
  statLabel: { color: colors.muted, marginTop: 4, fontFamily: fonts.body, fontSize: 11 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink, marginTop: 22, marginBottom: 10 },
  link: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 12.5 },
  listingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 10, gap: 12 },
  listingImage: { width: 56, height: 56, borderRadius: 12 },
  listingTitle: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink },
  listingMeta: { color: colors.muted, marginTop: 4, fontFamily: fonts.body, fontSize: 11.5 },
  listingStatus: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 2 },
  booking: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, marginBottom: 8 },
  bookingTitle: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink },
  bookingMeta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
  bookingAmount: { fontFamily: fonts.bodySemi, color: colors.skyBottom },
});
