import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { useAppContext } from '../AppContext';
import { colors, fonts, radius, shadow } from '../theme';

let MapView;
let Marker;
let Polyline;

if (Platform.OS !== 'web') {
  const mapLib = require('react-native-maps');
  MapView = mapLib.default;
  Marker = mapLib.Marker;
  Polyline = mapLib.Polyline;
}

const WEB_MAP_ZOOM = 12;
const WEB_TILE_SIZE = 256;

function longitudeToTile(longitude, zoom) {
  return Math.floor(((longitude + 180) / 360) * (2 ** zoom));
}

function latitudeToTile(latitude, zoom) {
  const radians = (latitude * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(radians) + (1 / Math.cos(radians))) / Math.PI) / 2) * (2 ** zoom)
  );
}

function WebMap({ tracking, onOpenMap }) {
  const center = tracking.vehicleLocation;
  const centerTileX = longitudeToTile(center.longitude, WEB_MAP_ZOOM);
  const centerTileY = latitudeToTile(center.latitude, WEB_MAP_ZOOM);
  const tiles = [];

  for (let row = -1; row <= 1; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      const tileX = centerTileX + column;
      const tileY = centerTileY + row;
      tiles.push(
        <Image
          key={`${tileX}-${tileY}`}
          source={{ uri: `https://tile.openstreetmap.org/${WEB_MAP_ZOOM}/${tileX}/${tileY}.png` }}
          style={[styles.webTile, { left: (column + 1) * WEB_TILE_SIZE, top: (row + 1) * WEB_TILE_SIZE }]}
        />
      );
    }
  }

  return (
    <TouchableOpacity style={styles.webMap} activeOpacity={0.9} onPress={onOpenMap}>
      {tiles}
      <View style={[styles.webMarker, styles.driverMarker]}>
        <Ionicons name="car" size={14} color="#fff" />
      </View>
      <View style={[styles.webMarker, styles.vehicleMarker]}>
        <Ionicons name="location" size={17} color="#fff" />
      </View>
      <View style={styles.webMapBadge}>
        <Text style={styles.webMapBadgeText}>OpenStreetMap · Tap to open</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VehicleTrackingScreen({ navigation, route }) {
  const { getVehicleById, getVehicleTracking } = useAppContext();
  const id = route?.params?.id || route?.params?.vehicleId;
  const vehicle = getVehicleById(id) || {};
  const tracking = getVehicleTracking(id);

  if (!tracking) {
    return (
      <View style={styles.container}>
        <Header title="Live Tracking" subtitle={vehicle.title || 'Vehicle'} onBack={() => navigation.goBack()} />
        <EmptyState icon="location-outline" title="Tracking is not available" subtitle="Live location updates will appear here when the provider starts tracking this booking." />
      </View>
    );
  }

  const initialRegion = {
    latitude: (tracking.driverLocation.latitude + tracking.vehicleLocation.latitude) / 2,
    longitude: (tracking.driverLocation.longitude + tracking.vehicleLocation.longitude) / 2,
    latitudeDelta: 0.06,
    longitudeDelta: 0.08,
  };

  function handleShare() {
    Share.share({
      message: `${vehicle.title} is ${tracking.status.toLowerCase()} and expected in ${tracking.eta}.`,
    }).catch(() => {});
  }

  function handleCallDriver() {
    Alert.alert('Driver contact', `${tracking.driverName} is on the way and should be with you in ${tracking.eta}.`);
  }

  function handleOpenMap() {
    const { latitude, longitude } = tracking.vehicleLocation;
    Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`);
  }

  return (
    <View style={styles.container}>
      <Header title="Live Tracking" subtitle={vehicle.title || 'Vehicle'} onBack={() => navigation.goBack()} />

      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          <WebMap tracking={tracking} onOpenMap={handleOpenMap} />
        ) : (
          <MapView style={styles.map} initialRegion={initialRegion} showsCompass showsUserLocation>
            <Polyline coordinates={tracking.route} strokeColor={colors.skyBottom} strokeWidth={4} />
            <Marker coordinate={tracking.driverLocation} title={`${tracking.driverName} driver`} pinColor="#2FA85B" />
            <Marker coordinate={tracking.vehicleLocation} title={vehicle.title || 'Vehicle'} pinColor="#14459E" />
          </MapView>
        )}
      </View>

      <View style={[styles.card, shadow.soft]}>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{tracking.status}</Text>
          </View>
          <Text style={styles.updated}>Updated {tracking.lastUpdated}</Text>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>ETA</Text>
            <Text style={styles.metricValue}>{tracking.eta}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Speed</Text>
            <Text style={styles.metricValue}>{tracking.speed}</Text>
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
          <Text style={styles.routeText}>{tracking.dropoff}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={16} color={colors.skyBottom} />
            <Text style={styles.secondaryBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('DriverDashboard')}>
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
  mapWrap: { flex: 1, minHeight: 320 },
  map: { flex: 1 },
  webMap: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    backgroundColor: '#DCE9D5',
  },
  webTile: {
    position: 'absolute',
    width: WEB_TILE_SIZE,
    height: WEB_TILE_SIZE,
  },
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
  driverMarker: {
    left: '43%',
    top: '38%',
    backgroundColor: '#2FA85B',
  },
  vehicleMarker: {
    left: '57%',
    top: '56%',
    backgroundColor: '#14459E',
  },
  webMapBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  webMapBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkSoft,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    margin: 16,
    marginTop: -8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusPill: { backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: colors.success, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  updated: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metric: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, padding: 10, marginHorizontal: 4 },
  metricLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.muted },
  metricValue: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink, marginTop: 4 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 10, marginTop: 6 },
  routeLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  routeText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink, flex: 1, textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.blueBg, borderRadius: radius.md, paddingVertical: 12 },
  secondaryBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.skyBottom },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.skyBottom, borderRadius: radius.md, paddingVertical: 12 },
  primaryBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: '#fff' },
});
