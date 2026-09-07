import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
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

export default function VehicleTrackingScreen({ navigation, route }) {
  const { getVehicleById, getVehicleTracking } = useAppContext();
  const id = route?.params?.id || route?.params?.vehicleId || 'v1';
  const vehicle = getVehicleById(id) || {};
  const tracking = getVehicleTracking(id);

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

  return (
    <View style={styles.container}>
      <Header title="Live Tracking" subtitle={vehicle.title || 'Vehicle'} onBack={() => navigation.goBack()} />

      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapPlaceholder}>
            <Ionicons name="map-outline" size={30} color={colors.muted} />
            <Text style={styles.webMapText}>Live map preview is available on mobile devices.</Text>
          </View>
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
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F2FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  webMapText: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 13,
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
