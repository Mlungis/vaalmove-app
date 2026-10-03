import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Image, Platform, Linking, PanResponder, ScrollView, AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { CATEGORIES, useAppContext } from '../AppContext';
import { colors, fonts, radius, shadow } from '../theme';

const NEARBY_RADIUS_KM = 50;
const WEB_MAP_SIZE = 256;

function distanceInKm(from, to) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude))
    * Math.cos(radians(to.latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function coordinateToPixel(coordinate, zoom) {
  const scale = WEB_MAP_SIZE * (2 ** zoom);
  const latitude = Math.max(-85.0511, Math.min(85.0511, coordinate.latitude));
  const sin = Math.sin((latitude * Math.PI) / 180);
  return {
    x: ((coordinate.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function WebOsmMap({ vehicles, userLocation, onSelectVehicle }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoomOffset, setZoomOffset] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = React.useRef(panOffset);
  const dragStartRef = React.useRef(panOffset);
  panOffsetRef.current = panOffset;
  const coordinates = vehicles.map((vehicle) => ({
    latitude: vehicle.latitude,
    longitude: vehicle.longitude,
  }));
  if (userLocation) coordinates.push(userLocation);
  const latitudes = coordinates.map((point) => point.latitude);
  const longitudes = coordinates.map((point) => point.longitude);
  const center = coordinates.length
    ? {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    }
    : { latitude: -26.2041, longitude: 28.0473 };
  const latitudeSpread = coordinates.length
    ? Math.max(...coordinates.map((point) => point.latitude)) - Math.min(...coordinates.map((point) => point.latitude))
    : 0.04;
  const longitudeSpread = coordinates.length
    ? Math.max(...coordinates.map((point) => point.longitude)) - Math.min(...coordinates.map((point) => point.longitude))
    : 0.04;
  const spread = Math.max(latitudeSpread * 1.7, longitudeSpread, 0.015);
  const zoom = Math.max(4, Math.min(17, Math.floor(Math.log2(360 / spread)) - 1 + zoomOffset));
  const centerPixel = coordinateToPixel(center, zoom);
  React.useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [center.latitude, center.longitude, zoom]);
  const minTileX = Math.floor((centerPixel.x - size.width / 2) / WEB_MAP_SIZE) - 1;
  const maxTileX = Math.floor((centerPixel.x + size.width / 2) / WEB_MAP_SIZE) + 1;
  const minTileY = Math.max(0, Math.floor((centerPixel.y - size.height / 2) / WEB_MAP_SIZE) - 1);
  const maxTileY = Math.min((2 ** zoom) - 1, Math.floor((centerPixel.y + size.height / 2) / WEB_MAP_SIZE) + 1);
  const tiles = [];

  for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
    for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
      const wrappedX = ((tileX % (2 ** zoom)) + (2 ** zoom)) % (2 ** zoom);
      tiles.push(
        <Image
          key={`${wrappedX}-${tileY}`}
          source={{ uri: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${tileY}.png` }}
          style={{
            position: 'absolute',
            width: WEB_MAP_SIZE,
            height: WEB_MAP_SIZE,
            left: size.width / 2 + tileX * WEB_MAP_SIZE - centerPixel.x + panOffset.x,
            top: size.height / 2 + tileY * WEB_MAP_SIZE - centerPixel.y + panOffset.y,
          }}
        />,
      );
    }
  }

  function markerPosition(coordinate) {
    const pixel = coordinateToPixel(coordinate, zoom);
    return {
      left: size.width / 2 + pixel.x - centerPixel.x - 17,
      top: size.height / 2 + pixel.y - centerPixel.y - 17,
    };
  }

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => { dragStartRef.current = panOffsetRef.current; },
    onPanResponderMove: (_event, gesture) => {
      setPanOffset({
        x: dragStartRef.current.x + gesture.dx,
        y: dragStartRef.current.y + gesture.dy,
      });
    },
  }), []);

  return (
    <View style={styles.webMap} onLayout={(event) => setSize(event.nativeEvent.layout)} {...panResponder.panHandlers}>
      {tiles}
      {vehicles.map((vehicle) => (
        <TouchableOpacity
          key={vehicle.id}
          accessibilityRole="button"
          accessibilityLabel={`${vehicle.title}, R${vehicle.priceDaily} per day`}
          style={[styles.webVehicleMarker, markerPosition(vehicle), { transform: [{ translateX: panOffset.x }, { translateY: panOffset.y }] }]}
          onPress={() => onSelectVehicle(vehicle.id)}
        >
          <Ionicons name="car" size={16} color="#fff" />
        </TouchableOpacity>
      ))}
      {userLocation ? (
        <View style={[styles.webUserDot, markerPosition(userLocation), { transform: [{ translateX: panOffset.x }, { translateY: panOffset.y }] }]} />
      ) : null}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          style={styles.zoomButton}
          onPress={() => setZoomOffset((value) => Math.min(value + 1, 6))}
        >
          <Ionicons name="add" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          style={styles.zoomButton}
          onPress={() => setZoomOffset((value) => Math.max(value - 1, -6))}
        >
          <Ionicons name="remove" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

function createNativeMapHtml(vehicles, userLocation) {
  const mapVehicles = vehicles.map((vehicle) => ({
    id: vehicle.id,
    latitude: vehicle.latitude,
    longitude: vehicle.longitude,
  }));
  const safeJson = (value) => JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const initialCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : mapVehicles.length
      ? [
        mapVehicles.reduce((sum, vehicle) => sum + vehicle.latitude, 0) / mapVehicles.length,
        mapVehicles.reduce((sum, vehicle) => sum + vehicle.longitude, 0) / mapVehicles.length,
      ]
      : [-26.2041, 28.0473];

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;background:#e8edf2}.vehicle-pin{background:#17263d;border:2px solid white;border-radius:22px;color:white;font:20px sans-serif;text-align:center;line-height:36px;width:40px;height:40px;box-shadow:0 2px 8px #0005}.vehicle-pin.selected{background:#b99254}.user-pin{width:18px;height:18px;border:4px solid white;background:#3478f6;border-radius:50%;box-shadow:0 1px 7px #0008}</style></head>
<body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const vehicles=${safeJson(mapVehicles)};
const userLocation=${safeJson(userLocation)};
const map=L.map('map',{zoomControl:true,attributionControl:true}).setView(${safeJson(initialCenter)},${userLocation ? 12 : mapVehicles.length ? 12 : 6});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
const bounds=[];
vehicles.forEach(vehicle=>{
 const icon=L.divIcon({className:'',html:'<div class="vehicle-pin">&#128663;</div>',iconSize:[40,40],iconAnchor:[20,20]});
  const marker=L.marker([vehicle.latitude,vehicle.longitude],{icon}).addTo(map);
  marker.on('click',()=>window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(vehicle.id));
 bounds.push([vehicle.latitude,vehicle.longitude]);
});
if(userLocation){L.marker([userLocation.latitude,userLocation.longitude],{icon:L.divIcon({className:'',html:'<div class="user-pin"></div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map).bindTooltip('You');bounds.push([userLocation.latitude,userLocation.longitude]);}
if(bounds.length>1&&!userLocation)map.fitBounds(bounds,{padding:[32,32],maxZoom:12});
else if(bounds.length>1&&userLocation)map.fitBounds(bounds,{padding:[32,32],maxZoom:14});
</script></body></html>`;
}

export default function NearbyVehiclesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const { vehicles } = useAppContext();
  const [userLocation, setUserLocation] = useState(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const autoRequestAttempted = React.useRef(false);
  const geocodedVehicles = useMemo(
    () => vehicles.filter((vehicle) => (
      vehicle.status === 'published'
      && vehicle.latitude !== null
      && vehicle.latitude !== undefined
      && vehicle.longitude !== null
      && vehicle.longitude !== undefined
      && vehicle.latitude !== ''
      && vehicle.longitude !== ''
      && Number.isFinite(Number(vehicle.latitude))
      && Number.isFinite(Number(vehicle.longitude))
      && Math.abs(Number(vehicle.latitude)) <= 90
      && Math.abs(Number(vehicle.longitude)) <= 180
    )).map((vehicle) => ({
      ...vehicle,
      latitude: Number(vehicle.latitude),
      longitude: Number(vehicle.longitude),
    })),
    [vehicles],
  );
  const nearbyVehicles = useMemo(() => {
    const candidates = userLocation
      ? geocodedVehicles
        .map((vehicle) => ({ ...vehicle, distanceKm: distanceInKm(userLocation, vehicle) }))
        .filter((vehicle) => vehicle.distanceKm <= NEARBY_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm)
      : geocodedVehicles;
    return selectedCategory
      ? candidates.filter((vehicle) => vehicle.category === selectedCategory)
      : candidates;
  }, [geocodedVehicles, selectedCategory, userLocation]);
  const selectedVehicle = nearbyVehicles.find((vehicle) => vehicle.id === selectedId) || null;
  const mapHtml = useMemo(
    () => createNativeMapHtml(nearbyVehicles, userLocation),
    [nearbyVehicles, userLocation],
  );

  const handleFindNearby = useCallback(async () => {
    setLocationBusy(true);
    setLocationError('');
    try {
      if (
        Platform.OS === 'web'
        && typeof window !== 'undefined'
        && !window.isSecureContext
      ) {
        setLocationPermission('unavailable');
        setLocationError('This mobile web preview uses an insecure connection, so the browser blocks GPS. Open the native app preview or use HTTPS to enable location.');
        return;
      }

      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted' && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      setLocationPermission(permission.status);

      if (permission.status !== 'granted') {
        setLocationPermission(permission.canAskAgain ? 'promptable' : 'denied');
        setLocationError(permission.canAskAgain
          ? 'Allow location access to show your position and find nearby vehicles.'
          : Platform.OS === 'web'
            ? 'Location is blocked for this site. Allow it in your browser site settings, then tap Try again.'
            : 'Location access is blocked. Enable it in your device settings, then tap Try again.');
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationPermission('services-disabled');
        setLocationError('Location services are turned off on your device. Turn them on, then tap Try again.');
        return;
      }

      const lastKnownPosition = Platform.OS === 'web'
        ? null
        : await Location.getLastKnownPositionAsync();
      if (lastKnownPosition) {
        setUserLocation({
          latitude: lastKnownPosition.coords.latitude,
          longitude: lastKnownPosition.coords.longitude,
        });
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationError('');
      setSelectedId(null);
    } catch (error) {
      setLocationError(error?.message || 'Could not get a GPS fix. Check that location services are enabled and try again.');
    } finally {
      setLocationBusy(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused && !autoRequestAttempted.current) {
      autoRequestAttempted.current = true;
      const timeout = setTimeout(() => handleFindNearby(), 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [handleFindNearby, isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || !isFocused) return;
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        setLocationPermission(permission.status);
        if (permission.status === 'granted') {
          await handleFindNearby();
        } else if (permission.status === 'denied') {
          setLocationError(permission.canAskAgain
            ? 'Allow location access to show your position and find nearby vehicles.'
            : 'Location access is blocked. Enable it in your device settings, then tap Try again.');
        }
      } catch (error) {
        setLocationError(error?.message || 'Could not refresh your location.');
      }
    });
    return () => subscription.remove();
  }, [handleFindNearby, isFocused]);

  function handleLocationAction() {
    if (locationPermission === 'denied' && Platform.OS === 'web') {
      setLocationError('Allow location for this site in your browser’s address-bar or site settings, then tap Enable location.');
      return;
    }
    if (locationPermission === 'denied' && Platform.OS !== 'web') {
      Linking.openSettings().catch((error) => {
        setLocationError(error?.message || 'Open your device settings and allow location access for LexRidesZA.');
      });
      return;
    }
    handleFindNearby();
  }

  function openVehicle(vehicleId) {
    navigation.navigate('Home', { screen: 'VehicleDetails', params: { id: vehicleId } });
  }

  function selectVehicle(vehicleId) {
    setSelectedId(vehicleId);
    openVehicle(vehicleId);
  }

  return (
    <View style={styles.container}>
      <Header title="Track" subtitle="Your location and nearby vehicles" />
      <View style={styles.toolbar}>
        <View style={styles.countPill}>
          <Ionicons name={userLocation ? 'navigate' : 'car-outline'} size={16} color={colors.skyBottom} />
          <Text style={styles.countText}>
            {userLocation
              ? `${nearbyVehicles.length} vehicle${nearbyVehicles.length === 1 ? '' : 's'} within ${NEARBY_RADIUS_KM} km`
              : locationError
                ? 'Location unavailable'
                : locationBusy
                  ? 'Finding your location…'
                  : 'Enable location to find nearby vehicles'}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.locationButton}
          onPress={handleLocationAction}
          disabled={locationBusy}
        >
          <Ionicons name={userLocation ? 'locate' : 'locate-outline'} size={17} color="#fff" />
          <Text style={styles.locationButtonText}>
            {locationBusy
              ? 'Finding…'
              : locationPermission === 'denied' && Platform.OS !== 'web'
                ? 'Open settings'
                : locationPermission === 'unavailable'
                  ? 'Use HTTPS'
                  : locationPermission === 'denied' && Platform.OS === 'web'
                    ? 'Site settings'
                    : locationPermission === 'services-disabled'
                      ? 'Try again'
                    : userLocation
                      ? 'Refresh area'
                      : 'Enable location'}
          </Text>
        </TouchableOpacity>
      </View>
      {locationError ? (
        <View style={styles.locationNotice} accessibilityRole="alert">
          <Ionicons
            name={locationPermission === 'unavailable' ? 'globe-outline' : 'location-outline'}
            size={18}
            color={colors.warning}
          />
          <Text style={styles.locationNoticeText}>{locationError}</Text>
          <TouchableOpacity
            onPress={locationPermission === 'denied' && Platform.OS === 'web'
              ? () => setLocationError('Allow location for this site in your browser’s address-bar or site settings, then tap Enable location.')
              : locationPermission === 'unavailable'
                ? undefined
              : handleLocationAction}
            disabled={locationBusy || locationPermission === 'unavailable'}
          >
            <Text style={styles.retryText}>
              {locationPermission === 'denied' && Platform.OS !== 'web'
                ? 'Settings'
                : locationPermission === 'denied' && Platform.OS === 'web'
                  ? 'How to allow'
                  : 'Try again'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id,
            )}
          >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {Platform.OS === 'web' ? (
        <WebOsmMap
          vehicles={nearbyVehicles}
          userLocation={userLocation}
          onSelectVehicle={selectVehicle}
        />
      ) : (
        <WebView
          key={`${userLocation?.latitude || 'area'}-${nearbyVehicles.length}`}
          source={{ html: mapHtml }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(event) => selectVehicle(event.nativeEvent.data)}
          style={styles.nativeMap}
          accessibilityLabel="OpenStreetMap with nearby vehicle pickup locations"
        />
      )}

      <View style={[styles.bottomCard, shadow.soft]}>
        {selectedVehicle ? (
          <Pressable style={styles.vehicleSummary} onPress={() => openVehicle(selectedVehicle.id)}>
            {selectedVehicle.image ? (
              <Image source={{ uri: selectedVehicle.image }} style={styles.vehicleImage} />
            ) : (
              <View style={[styles.vehicleImage, styles.imagePlaceholder]}>
                <Ionicons name="car-outline" size={24} color={colors.muted} />
              </View>
            )}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleTitle} numberOfLines={1}>{selectedVehicle.title}</Text>
              <Text style={styles.vehicleLocation} numberOfLines={1}>
                {selectedVehicle.location || 'Pickup location'}
                {Number.isFinite(selectedVehicle.distanceKm) ? ` · ${selectedVehicle.distanceKm.toFixed(1)} km away` : ''}
              </Text>
              <Text style={styles.vehiclePrice}>R{selectedVehicle.priceDaily}/day</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ) : (
          <Text style={styles.hint}>
            {nearbyVehicles.length
              ? 'Tap a vehicle marker to see its pickup point and price.'
              : geocodedVehicles.length
                ? 'No map-pinned vehicles in this area yet. Try refreshing your location or zoom out.'
                : 'Vehicle providers can add a public pickup pin when publishing a listing. Older listings may not have map coordinates yet.'}
          </Text>
        )}
        <Text style={styles.privacyNote}>
          {userLocation
            ? 'Your precise location stays on this device; the map service receives requests for the map area shown.'
            : 'Your device is asking for location access so the map can find nearby vehicles.'}
        </Text>
        <Text style={styles.mapAttribution}>Map data © OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  categoryBar: { flexGrow: 0, flexShrink: 0, maxHeight: 44 },
  categoryContent: { alignItems: 'center', paddingHorizontal: 14, gap: 7, paddingBottom: 8 },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline },
  categoryChipActive: { backgroundColor: colors.skyBottom, borderColor: colors.skyBottom },
  categoryText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.inkSoft },
  categoryTextActive: { color: '#fff' },
  countPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceAlt, paddingHorizontal: 11, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  countText: { flexShrink: 1, fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.inkSoft },
  locationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.skyBottom, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 11 },
  locationButtonText: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: '#fff' },
  locationNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginBottom: 8, padding: 10, borderRadius: radius.sm, backgroundColor: colors.warningBg },
  locationNoticeText: { flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 15, color: colors.inkSoft },
  retryText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.skyBottom },
  webMap: { flex: 1, overflow: 'hidden', backgroundColor: '#e8edf2' },
  nativeMap: { flex: 1, backgroundColor: '#e8edf2' },
  webVehicleMarker: { position: 'absolute', width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.skyBottom, borderColor: '#fff', borderWidth: 2, borderRadius: 18, elevation: 4 },
  webUserDot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#3478f6', borderWidth: 4, borderColor: '#fff', elevation: 4 },
  zoomControls: { position: 'absolute', right: 12, top: 12, gap: 5 },
  zoomButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 6, elevation: 3 },
  attribution: { position: 'absolute', right: 4, bottom: 2, backgroundColor: 'rgba(255,255,255,0.82)', paddingHorizontal: 4, paddingVertical: 2 },
  attributionText: { fontFamily: fonts.body, fontSize: 9, color: colors.inkSoft },
  bottomCard: { backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderTopWidth: 1, borderColor: colors.hairline },
  vehicleSummary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleImage: { width: 58, height: 58, borderRadius: radius.sm },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  vehicleInfo: { flex: 1 },
  vehicleTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  vehicleLocation: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 3 },
  vehiclePrice: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.skyBottom, marginTop: 5 },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.inkSoft },
  privacyNote: { fontFamily: fonts.body, fontSize: 10.5, color: colors.muted, marginTop: 7 },
  mapAttribution: { fontFamily: fonts.body, fontSize: 9.5, color: colors.muted, textAlign: 'right', marginTop: 7 },
});
