import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Linking, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '../lib/alerts';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function ProviderDashboardScreen({ navigation }) {
  const {
    user, session, vehicles, bookings, getVehicleById, updateVehicleStatus,
    setVehicleMapPin, deleteVehicleListing,
  } = useAppContext();
  const myListings = vehicles.filter((v) => v.providerId === session?.user?.id || (user.providerName && v.provider === user.providerName));
  const [activeMap, setActiveMap] = useState(() => Object.fromEntries(myListings.map((v) => [v.id, v.status === 'published'])));
  const [mapPinBusy, setMapPinBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  async function saveCurrentMapPin(vehicle) {
    setMapPinBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Location permission needed',
          'Allow location access to save your current position as this listing’s public pickup pin.',
          permission.canAskAgain
            ? [{ text: 'OK' }]
            : [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open settings', onPress: () => Linking.openSettings() },
            ],
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await setVehicleMapPin(vehicle.id, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      Alert.alert('Pickup pin updated', `${vehicle.title} now has a public pickup pin on the nearby vehicles map.`);
    } catch (error) {
      Alert.alert('Could not update pickup pin', error?.message || 'Please try again.');
    } finally {
      setMapPinBusy(false);
    }
  }

  function confirmMapPinUpdate(vehicle) {
    Alert.alert(
      'Set public pickup pin?',
      'Your current device location will be saved to this listing and shown to anyone browsing the nearby vehicles map. This is a fixed listing location, not live tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: vehicle.latitude != null ? 'Update pin' : 'Add pin', onPress: () => { void saveCurrentMapPin(vehicle); } },
      ],
    );
  }

  function confirmDeleteListing(vehicle) {
    Alert.alert(
      'Permanently delete listing?',
      `“${vehicle.title}” and its photos will be permanently removed. This cannot be undone. Listings with booking history may not be deletable; pause those listings instead.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete permanently', style: 'destructive', onPress: () => { void permanentlyDeleteListing(vehicle); } },
      ],
    );
  }

  async function permanentlyDeleteListing(vehicle) {
    setDeletingId(vehicle.id);
    try {
      const result = await deleteVehicleListing(vehicle.id);
      Alert.alert(
        result.photoCleanupError ? 'Listing deleted with a warning' : 'Listing deleted',
        result.photoCleanupError
          ? 'The listing is gone, but some stored photos could not be removed. Please contact support.'
          : 'The listing and its stored photos were permanently removed.',
      );
    } catch (error) {
      Alert.alert('Could not delete listing', error?.message || 'Please try again.');
    } finally {
      setDeletingId(null);
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
                {v.providerId === session?.user?.id ? (
                  <TouchableOpacity
                    style={styles.mapPinButton}
                    accessibilityRole="button"
                    onPress={() => confirmMapPinUpdate(v)}
                    disabled={mapPinBusy}
                  >
                    <Ionicons name={v.latitude != null ? 'location' : 'location-outline'} size={13} color={colors.skyBottom} />
                    <Text style={styles.mapPinButtonText}>
                      {v.latitude != null ? 'Update public pickup pin' : 'Add public pickup pin'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
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
              {v.providerId === session?.user?.id ? (
                <View style={styles.listingActions}>
                  <TouchableOpacity
                    style={styles.editListingButton}
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('AddListing', { vehicleId: v.id })}
                  >
                    <Ionicons name="create-outline" size={15} color={colors.skyBottom} />
                    <Text style={styles.editListingText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteListingButton}
                    accessibilityRole="button"
                    onPress={() => confirmDeleteListing(v)}
                    disabled={deletingId === v.id}
                  >
                    {deletingId === v.id
                      ? <ActivityIndicator size="small" color={colors.danger} />
                      : <Ionicons name="trash-outline" size={15} color={colors.danger} />}
                    <Text style={styles.deleteListingText}>
                      {deletingId === v.id ? 'Deleting…' : 'Delete permanently'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
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
  listingCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 10, gap: 12 },
  listingImage: { width: 56, height: 56, borderRadius: 12 },
  listingTitle: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink },
  listingMeta: { color: colors.muted, marginTop: 4, fontFamily: fonts.body, fontSize: 11.5 },
  mapPinButton: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 8 },
  mapPinButtonText: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 10.5 },
  listingActions: { flexDirection: 'row', width: '100%', justifyContent: 'flex-end', gap: 16, borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 10, marginTop: 2 },
  editListingButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  editListingText: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  deleteListingButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  deleteListingText: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  listingStatus: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 2 },
  booking: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, marginBottom: 8 },
  bookingTitle: { fontFamily: fonts.bodySemi, fontSize: 13.5, color: colors.ink },
  bookingMeta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
  bookingAmount: { fontFamily: fonts.bodySemi, color: colors.skyBottom },
});
