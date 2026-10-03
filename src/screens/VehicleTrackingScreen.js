import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Linking, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Alert } from '../lib/alerts';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { useAppContext } from '../AppContext';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, shadow } from '../theme';
import { shareMessage } from '../lib/share';

let MapView;
let Marker;
let Polyline;

if (Platform.OS !== 'web') {
  const mapLib = require('react-native-maps');
  MapView = mapLib.default;
  Marker = mapLib.Marker;
  Polyline = mapLib.Polyline;
}

const WEB_MAP_ZOOM = 14;
const WEB_TILE_SIZE = 256;
const LOCATION_FRESHNESS_MS = 120000;

function coordinateToPixel(coordinate, zoom) {
  const scale = WEB_TILE_SIZE * (2 ** zoom);
  const latitude = Math.max(-85.0511, Math.min(85.0511, coordinate.latitude));
  const sin = Math.sin((latitude * Math.PI) / 180);
  return {
    x: ((coordinate.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function WebMap({ tracking, ownLocation, onOpenMap }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const provider = tracking.driverLocation;
  const customer = tracking.customerLocation;
  const coordinates = [provider, customer, ownLocation].filter(Boolean);
  const center = coordinates.length
    ? {
      latitude: coordinates.reduce((sum, point) => sum + point.latitude, 0) / coordinates.length,
      longitude: coordinates.reduce((sum, point) => sum + point.longitude, 0) / coordinates.length,
    }
    : null;

  if (!center) return null;

  const latitudeSpread = Math.max(...coordinates.map((point) => point.latitude))
    - Math.min(...coordinates.map((point) => point.latitude));
  const longitudeSpread = Math.max(...coordinates.map((point) => point.longitude))
    - Math.min(...coordinates.map((point) => point.longitude));
  const spread = Math.max(latitudeSpread * 1.7, longitudeSpread, 0.01);
  const zoom = Math.max(5, Math.min(WEB_MAP_ZOOM, Math.floor(Math.log2(360 / spread)) - 1));
  const centerPixel = coordinateToPixel(center, zoom);
  const minTileX = Math.floor((centerPixel.x - size.width / 2) / WEB_TILE_SIZE) - 1;
  const maxTileX = Math.floor((centerPixel.x + size.width / 2) / WEB_TILE_SIZE) + 1;
  const minTileY = Math.floor((centerPixel.y - size.height / 2) / WEB_TILE_SIZE) - 1;
  const maxTileY = Math.floor((centerPixel.y + size.height / 2) / WEB_TILE_SIZE) + 1;
  const tiles = [];

  for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
    for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
      const left = size.width / 2 + (tileX * WEB_TILE_SIZE) - centerPixel.x;
      const top = size.height / 2 + (tileY * WEB_TILE_SIZE) - centerPixel.y;
      tiles.push(
        <Image
          key={`${tileX}-${tileY}`}
          source={{ uri: `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png` }}
          style={[styles.webTile, { left, top }]}
        />,
      );
    }
  }

  function markerStyle(coordinate) {
    const pixel = coordinateToPixel(coordinate, zoom);
    return {
      left: size.width / 2 + pixel.x - centerPixel.x - 15,
      top: size.height / 2 + pixel.y - centerPixel.y - 15,
    };
  }

  return (
    <TouchableOpacity
      style={styles.webMap}
      activeOpacity={0.9}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
      onPress={onOpenMap}
    >
      {tiles}
      {provider ? (
        <View style={[styles.webMarker, styles.driverMarker, markerStyle(provider)]}>
          <Ionicons name="car" size={14} color="#fff" />
        </View>
      ) : null}
      {customer ? (
        <View style={[styles.webMarker, styles.customerMarker, markerStyle(customer)]}>
          <Ionicons name="person" size={14} color="#fff" />
        </View>
      ) : null}
      {ownLocation ? (
        <View style={[styles.webMarker, styles.ownMarker, markerStyle(ownLocation)]}>
          <Ionicons name="locate" size={14} color="#fff" />
        </View>
      ) : null}
      <View style={styles.webMapBadge}>
        <Text style={styles.webMapBadgeText}>© OpenStreetMap contributors · Tap to open</Text>
      </View>
    </TouchableOpacity>
  );
}

function isFreshLocation(location) {
  return location && Date.now() - new Date(location.recordedAt).getTime() < LOCATION_FRESHNESS_MS;
}

export default function VehicleTrackingScreen({ navigation, route }) {
  const isFocused = useIsFocused();
  const {
    session,
    getVehicleById,
    getVehicleTracking,
    bookings,
    startVehicleConversation,
    addTrackingLocation,
    refreshTrackingLocations,
    removeTrackingLocations,
  } = useAppContext();
  const requestedId = route?.params?.id || route?.params?.vehicleId;
  const requestedBookingId = route?.params?.bookingId;
  const booking = bookings.find((item) => item.id === requestedBookingId)
    || bookings.find((item) => item.vehicleId === requestedId && ['upcoming', 'active'].includes(item.status))
    || bookings.find((item) => ['upcoming', 'active'].includes(item.status));
  const id = requestedId || booking?.vehicleId;
  const vehicle = getVehicleById(id) || {};
  const tracking = getVehicleTracking(id, booking?.id);
  const isProvider = Boolean(booking && vehicle.providerId === session?.user?.id);
  const isRenter = Boolean(booking && booking.renterId === session?.user?.id);
  const canShare = Boolean(
    booking && ['confirmed', 'active'].includes(booking.rawStatus) && (isProvider || isRenter),
  );
  const [showOwnLocation, setShowOwnLocation] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [ownLocation, setOwnLocation] = useState(null);
  const [sharingBusy, setSharingBusy] = useState(false);
  const mapRef = useRef(null);
  const isSharingRef = useRef(false);
  const priorBookingIdRef = useRef(booking?.id);
  isSharingRef.current = isSharing;

  const stopSharingOutsideScreen = useCallback((bookingId) => {
    if (!bookingId || !isSharingRef.current) return;
    isSharingRef.current = false;
    setIsSharing(false);
    removeTrackingLocations(bookingId).catch((error) => {
      if (isFocused) {
        Alert.alert('Could not stop location sharing', error?.message || 'Please try again.');
      }
    });
  }, [isFocused, removeTrackingLocations]);

  useEffect(() => {
    const previousBookingId = priorBookingIdRef.current;
    if (previousBookingId && previousBookingId !== booking?.id) {
      stopSharingOutsideScreen(previousBookingId);
      setShowOwnLocation(false);
      setOwnLocation(null);
    }
    priorBookingIdRef.current = booking?.id;
  }, [booking?.id, stopSharingOutsideScreen]);

  useEffect(() => {
    if (!isFocused) stopSharingOutsideScreen(booking?.id);
  }, [booking?.id, isFocused, stopSharingOutsideScreen]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') stopSharingOutsideScreen(booking?.id);
    });
    return () => subscription.remove();
  }, [booking?.id, stopSharingOutsideScreen]);

  useEffect(() => {
    if (!booking?.id) return undefined;
    const channel = supabase
      .channel(`tracking-${booking.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_locations', filter: `booking_id=eq.${booking.id}` },
        () => refreshTrackingLocations(booking.id).catch((error) => {
          Alert.alert('Could not refresh locations', error?.message || 'Please try again.');
        }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [booking?.id, refreshTrackingLocations]);

  useEffect(() => {
    if (!isFocused || (!showOwnLocation && !isSharing)) return undefined;
    let mounted = true;
    let subscription;
    let lastSentAt = 0;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
      (position) => {
        if (!mounted) return;
        const coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          recordedAt: new Date(position.timestamp).toISOString(),
        };
        setOwnLocation(coordinate);
        if (isSharingRef.current && Date.now() - lastSentAt >= 10000) {
          lastSentAt = Date.now();
          addTrackingLocation(booking.id, position).catch((error) => {
            stopSharingOutsideScreen(booking.id);
            Alert.alert('Location sharing stopped', error?.message || 'Your latest location could not be shared.');
          });
        }
      },
    ).then((watcher) => {
      if (mounted) subscription = watcher;
      else watcher.remove();
    }).catch((error) => {
      if (!mounted) return;
      if (isSharingRef.current) stopSharingOutsideScreen(booking.id);
      Alert.alert('Could not read your location', error?.message || 'Check your device location settings.');
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [addTrackingLocation, booking?.id, isFocused, isSharing, showOwnLocation, stopSharingOutsideScreen]);

  const mapCoordinates = [
    isFreshLocation(tracking?.driverLocation) ? tracking.driverLocation : null,
    isFreshLocation(tracking?.customerLocation) ? tracking.customerLocation : null,
    showOwnLocation || isSharing ? ownLocation : null,
  ].filter(Boolean);
  const mapRegion = mapCoordinates.length
    ? (() => {
      const latitudes = mapCoordinates.map((point) => point.latitude);
      const longitudes = mapCoordinates.map((point) => point.longitude);
      const latitudeSpread = Math.max(...latitudes) - Math.min(...latitudes);
      const longitudeSpread = Math.max(...longitudes) - Math.min(...longitudes);
      return {
        latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
        longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
        latitudeDelta: Math.max(0.04, latitudeSpread * 1.5),
        longitudeDelta: Math.max(0.05, longitudeSpread * 1.5),
      };
    })()
    : null;

  useEffect(() => {
    if (mapRegion) mapRef.current?.animateToRegion(mapRegion, 500);
  }, [mapRegion?.latitude, mapRegion?.longitude]);

  async function requestLocationPermission() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status === 'granted') return true;
    Alert.alert(
      'Location permission needed',
      'Allow location access in your device settings to show or share your position.',
      permission.canAskAgain
        ? [{ text: 'OK' }]
        : [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
    );
    return false;
  }

  async function handleShowOwnLocation() {
    if (isSharing) return;
    if (showOwnLocation) {
      setShowOwnLocation(false);
      if (!isSharing) setOwnLocation(null);
      return;
    }
    try {
      if (!(await requestLocationPermission())) return;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setOwnLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        recordedAt: new Date(position.timestamp).toISOString(),
      });
      setShowOwnLocation(true);
    } catch (error) {
      Alert.alert('Could not read your location', error?.message || 'Check your device location settings.');
    }
  }

  async function beginSharing() {
    setSharingBusy(true);
    try {
      if (!(await requestLocationPermission())) return;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await addTrackingLocation(booking.id, position);
      setOwnLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        recordedAt: new Date(position.timestamp).toISOString(),
      });
      setShowOwnLocation(true);
      setIsSharing(true);
    } catch (error) {
      Alert.alert('Could not start location sharing', error?.message || 'Please try again.');
    } finally {
      setSharingBusy(false);
    }
  }

  function handleStartSharing() {
    Alert.alert(
      'Share your live location?',
      'Your precise location will be visible to the other person on this confirmed booking while the Live Tracking screen is open. You can stop sharing at any time.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Continue', onPress: () => { void beginSharing(); } },
      ],
    );
  }

  async function handleStopSharing() {
    setSharingBusy(true);
    isSharingRef.current = false;
    setIsSharing(false);
    try {
      await removeTrackingLocations(booking.id);
    } catch (error) {
      Alert.alert('Could not remove shared location', error?.message || 'Your latest location may remain visible briefly.');
    } finally {
      setSharingBusy(false);
    }
  }

  function handleShare() {
    shareMessage(
      'LexRidesZA trip update',
      `${vehicle.title || 'Your booking'} is ${tracking?.status?.toLowerCase() || 'being tracked'}${tracking?.eta ? ` and expected in ${tracking.eta}` : ''}.`,
    );
  }

  async function handleCallDriver() {
    try {
      if (isProvider || !tracking?.providerPhone) {
        const conversationId = await startVehicleConversation(id);
        if (conversationId) {
          navigation.getParent()?.navigate('Messages', {
            screen: 'ChatThread',
            params: { id: conversationId },
          });
        }
        return;
      }
      await Linking.openURL(`tel:${tracking.providerPhone}`);
    } catch (error) {
      Alert.alert('Could not contact provider', error?.message || 'Please try again.');
    }
  }

  async function handleOpenMap() {
    const coordinate = tracking?.driverLocation || tracking?.customerLocation || ownLocation;
    if (!coordinate) return;
    const { latitude, longitude } = coordinate;
    try {
      await Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`);
    } catch (error) {
      Alert.alert('Could not open map', error?.message || 'Please try again.');
    }
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Header title="Live Tracking" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="location-outline"
          title="No trackable booking"
          subtitle="Location sharing is available to the renter and provider after a booking is confirmed."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Live Tracking" subtitle={vehicle.title || 'Vehicle'} onBack={() => navigation.goBack()} />

      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          mapCoordinates.length ? (
            <WebMap
              tracking={{
                ...tracking,
                driverLocation: isFreshLocation(tracking?.driverLocation) ? tracking.driverLocation : null,
                customerLocation: isFreshLocation(tracking?.customerLocation) ? tracking.customerLocation : null,
              }}
              ownLocation={showOwnLocation || isSharing ? ownLocation : null}
              onOpenMap={handleOpenMap}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={32} color={colors.muted} />
              <Text style={styles.mapPlaceholderText}>Enable your location or wait for a participant to share.</Text>
            </View>
          )
        ) : mapCoordinates.length ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            region={mapRegion}
            showsCompass
            showsUserLocation={showOwnLocation || isSharing}
            showsMyLocationButton={showOwnLocation || isSharing}
          >
            {tracking.route.length > 1 ? (
              <Polyline coordinates={tracking.route} strokeColor={colors.skyBottom} strokeWidth={4} />
            ) : null}
            {isFreshLocation(tracking.driverLocation) ? (
              <Marker
                coordinate={tracking.driverLocation}
                title={isProvider ? 'Your location' : 'Provider'}
                pinColor="#2FA85B"
              />
            ) : null}
            {isFreshLocation(tracking.customerLocation) ? (
              <Marker
                coordinate={tracking.customerLocation}
                title={isRenter ? 'Your location' : 'Customer'}
                pinColor="#14459E"
              />
            ) : null}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={32} color={colors.muted} />
            <Text style={styles.mapPlaceholderText}>Enable your location or wait for a participant to share.</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, shadow.soft]}>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{tracking.status}</Text>
          </View>
          <Text style={styles.updated}>
            {tracking.lastUpdated ? `Updated ${tracking.lastUpdated}` : 'Waiting for location'}
          </Text>
        </View>

        <Text style={styles.shareHeading}>Booking location sharing</Text>
        <Text style={styles.shareDescription}>
          Each person chooses whether to share. Updates are visible only to this booking's renter and provider while this screen is open.
        </Text>
        <View style={styles.sharingActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleShowOwnLocation}
            disabled={sharingBusy}
          >
            <Ionicons name={showOwnLocation || isSharing ? 'locate' : 'locate-outline'} size={16} color={colors.skyBottom} />
            <Text style={styles.secondaryBtnText}>
              {isSharing ? 'Sharing your location' : showOwnLocation ? 'Hide my location' : 'Show my location'}
            </Text>
          </TouchableOpacity>
          {canShare ? (
            <TouchableOpacity
              style={isSharing ? styles.stopSharingBtn : styles.primaryBtn}
              onPress={isSharing ? handleStopSharing : handleStartSharing}
              disabled={sharingBusy}
            >
              <Ionicons name={isSharing ? 'stop-circle-outline' : 'radio-outline'} size={16} color={isSharing ? colors.danger : '#fff'} />
              <Text style={isSharing ? styles.stopSharingText : styles.primaryBtnText}>
                {sharingBusy ? 'Please wait…' : isSharing ? 'Stop sharing' : 'Share live location'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.sharingUnavailable}>
              {isProvider || isRenter
                ? 'Location sharing starts after this booking is confirmed.'
                : 'Only this booking’s renter and provider can share locations.'}
            </Text>
          )}
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>ETA</Text>
            <Text style={styles.metricValue}>{tracking.eta || 'Not available'}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Speed</Text>
            <Text style={styles.metricValue}>{tracking.speed || 'Not available'}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Driver</Text>
            <Text style={styles.metricValue}>{tracking.driverName}</Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>Pickup</Text>
          <Text style={styles.routeText}>{tracking.pickup}</Text>
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>Destination</Text>
          <Text style={styles.routeText}>{tracking.dropoff || 'Not provided'}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={16} color={colors.skyBottom} />
            <Text style={styles.secondaryBtnText}>Share trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleCallDriver}>
            <Ionicons name={!isProvider && tracking.providerPhone ? 'call-outline' : 'chatbubble-outline'} size={16} color={colors.skyBottom} />
            <Text style={styles.secondaryBtnText}>
              {isProvider ? 'Message renter' : tracking.providerPhone ? 'Call provider' : 'Message provider'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.getParent()?.navigate('Home', { screen: 'DriverDashboard' })}>
            <Ionicons name="analytics-outline" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  mapWrap: { flex: 1, minHeight: 250 },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, minHeight: 250, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EDF2', padding: 24 },
  mapPlaceholderText: { marginTop: 10, textAlign: 'center', color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  webMap: { flex: 1, minHeight: 250, overflow: 'hidden', backgroundColor: '#DCE9D5' },
  webTile: { position: 'absolute', width: WEB_TILE_SIZE, height: WEB_TILE_SIZE },
  webMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  driverMarker: { backgroundColor: '#2FA85B' },
  customerMarker: { backgroundColor: '#14459E' },
  ownMarker: { backgroundColor: colors.skyBottom },
  webMapBadge: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  webMapBadgeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.inkSoft },
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, margin: 16, marginTop: -8, padding: 16, borderWidth: 1, borderColor: colors.hairline },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusPill: { backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: colors.success, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  updated: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  shareHeading: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink, marginBottom: 4 },
  shareDescription: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.muted },
  sharingActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 12 },
  sharingUnavailable: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metric: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, padding: 10, marginHorizontal: 4 },
  metricLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.muted },
  metricValue: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink, marginTop: 4 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 10, marginTop: 6 },
  routeLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  routeText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink, flex: 1, textAlign: 'right' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  secondaryBtn: { flexBasis: '40%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.blueBg, borderRadius: radius.md, paddingVertical: 12 },
  secondaryBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.skyBottom },
  primaryBtn: { flexBasis: '40%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.skyBottom, borderRadius: radius.md, paddingVertical: 12 },
  primaryBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: '#fff' },
  stopSharingBtn: { flexBasis: '40%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.dangerBg, borderRadius: radius.md, paddingVertical: 12 },
  stopSharingText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.danger },
});
