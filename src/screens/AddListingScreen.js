import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Alert } from '../lib/alerts';
import Header from '../components/Header';
import Chip from '../components/Chip';
import PhotoPicker from '../components/PhotoPicker';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius } from '../theme';
import { CATEGORIES, useAppContext } from '../AppContext';

export default function AddListingScreen({ navigation, route }) {
  const { addVehicleListing, editVehicleListing, user, vehicles } = useAppContext();
  const vehicleId = route?.params?.vehicleId;
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [minDays, setMinDays] = useState('2');
  const [pickupLocation, setPickupLocation] = useState('');
  const [addMapPin, setAddMapPin] = useState(false);
  const [insurance, setInsurance] = useState('Full cover');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);

  useEffect(() => {
    if (!vehicle) return;
    setTitle(vehicle.title || '');
    setCategory(vehicle.category || CATEGORIES[0].id);
    setPrice(String(vehicle.priceDaily || ''));
    setYear(vehicle.year ? String(vehicle.year) : '');
    setMinDays(String(vehicle.minDays || 1));
    setPickupLocation(vehicle.location || '');
    setAddMapPin(vehicle.latitude != null && vehicle.longitude != null);
    setInsurance(vehicle.insurance || '');
    setPhotos(vehicle.gallery || (vehicle.image ? [vehicle.image] : []));
  }, [vehicle]);

  async function handleSubmit() {
    const next = {};
    const parsedPrice = Number(price);
    const parsedYear = year.trim() ? Number(year) : new Date().getFullYear();
    const parsedMinDays = Number(minDays);
    if (!title.trim()) next.title = 'Give your listing a title.';
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) next.price = 'Enter a valid daily price.';
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) next.year = 'Enter a year between 1900 and 2100.';
    if (!Number.isInteger(parsedMinDays) || parsedMinDays < 1) next.minDays = 'Enter at least 1 rental day.';
    if (!pickupLocation.trim()) next.location = 'Add a pickup location.';
    if (photos.length === 0) next.photos = 'Add at least one photo of the vehicle.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmissionMessage(null);
    setSubmitting(true);
    try {
      let mapCoordinates = {};
      if (addMapPin && (!vehicle || vehicle.latitude == null || vehicle.longitude == null)) {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'Location permission needed',
            'Allow location access to add a map pin to this public vehicle listing.',
          );
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        mapCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }
      const listing = {
        title: title.trim(),
        category,
        priceDaily: parsedPrice,
        year: parsedYear,
        fuel: vehicle?.fuel || 'Diesel',
        transmission: vehicle?.transmission || 'Manual',
        description: vehicle?.description,
        features: vehicle?.features || [],
        provider: user.providerName,
        location: pickupLocation.trim(),
        latitude: addMapPin ? (mapCoordinates.latitude ?? vehicle?.latitude ?? null) : null,
        longitude: addMapPin ? (mapCoordinates.longitude ?? vehicle?.longitude ?? null) : null,
        image: photos[0],
        gallery: photos,
        minDays: parsedMinDays,
        insurance,
        pricingRules: vehicle?.pricingRules || {
          weekendSurcharge: 0,
          weeklyDiscount: 0,
          minDays: parsedMinDays,
          cancellation: 'Contact provider to confirm cancellation terms',
        },
      };
      if (vehicle) await editVehicleListing(vehicle.id, listing);
      else await addVehicleListing(listing);
      setSubmissionMessage({
        type: 'success',
        text: vehicle
          ? 'Your listing changes have been saved.'
          : 'Your listing was published successfully and is now in Your listings.',
      });
    } catch (error) {
      setSubmissionMessage({
        type: 'error',
        text: error?.message || 'We could not save this listing. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header title={vehicle ? 'Edit your listing' : 'Create a signature listing'} subtitle="Present your vehicle at its best" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.eyebrow}>HOST WITH DISTINCTION</Text>
        <Text style={styles.introTitle}>{vehicle ? 'Update your vehicle details' : 'Add a vehicle to your collection'}</Text>
        <Text style={styles.introText}>Every detail helps guests discover a more considered way to move.</Text>
        <Text style={styles.label}>Photos</Text>
        <PhotoPicker
          photos={photos}
          onChange={(next) => { setPhotos(next); if (errors.photos) setErrors((e) => ({ ...e, photos: null })); }}
          error={errors.photos}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="e.g. Toyota Hilux 2.8 GD6"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={(t) => { setTitle(t); if (errors.title) setErrors((e) => ({ ...e, title: null })); }}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} active={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
        </View>

        <Text style={styles.label}>Price per day (R)</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          placeholder="850"
          placeholderTextColor={colors.muted}
          value={price}
          onChangeText={(t) => { setPrice(t); if (errors.price) setErrors((e) => ({ ...e, price: null })); }}
          keyboardType="number-pad"
        />
        {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}

        <Text style={styles.label}>Year</Text>
        <TextInput
          style={[styles.input, errors.year && styles.inputError]}
          placeholder="2021"
          placeholderTextColor={colors.muted}
          value={year}
          onChangeText={(t) => { setYear(t.replace(/\D/g, '')); if (errors.year) setErrors((e) => ({ ...e, year: null })); }}
          keyboardType="number-pad"
          maxLength={4}
        />
        {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}

        <Text style={styles.label}>Minimum rental days</Text>
        <TextInput
          style={[styles.input, errors.minDays && styles.inputError]}
          placeholder="2"
          placeholderTextColor={colors.muted}
          value={minDays}
          onChangeText={(t) => { setMinDays(t.replace(/\D/g, '')); if (errors.minDays) setErrors((e) => ({ ...e, minDays: null })); }}
          keyboardType="number-pad"
        />
        {errors.minDays ? <Text style={styles.errorText}>{errors.minDays}</Text> : null}

        <Text style={styles.label}>Pickup location</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          placeholder="Vereeniging, Gauteng"
          placeholderTextColor={colors.muted}
          value={pickupLocation}
          onChangeText={(value) => { setPickupLocation(value); if (errors.location) setErrors((e) => ({ ...e, location: null })); }}
        />
        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: addMapPin }}
          style={styles.mapPinOption}
          onPress={() => setAddMapPin((current) => !current)}
        >
          <Ionicons
            name={addMapPin ? 'checkbox' : 'square-outline'}
            size={21}
            color={addMapPin ? colors.skyBottom : colors.muted}
          />
          <View style={styles.mapPinCopy}>
            <Text style={styles.mapPinTitle}>Show this pickup point on the nearby map</Text>
            <Text style={styles.mapPinDescription}>
              If you allow location access, your current position will be saved as a public, fixed map pin for this listing. It is not live tracking.
            </Text>
          </View>
        </Pressable>

        <Text style={styles.label}>Insurance / cover</Text>
        <TextInput
          style={styles.input}
          placeholder="Full cover"
          placeholderTextColor={colors.muted}
          value={insurance}
          onChangeText={setInsurance}
        />

        <View style={{ height: 10 }} />
        {submissionMessage ? (
          <View
            accessibilityRole="alert"
            style={[
              styles.submissionMessage,
              submissionMessage.type === 'success' ? styles.successMessage : styles.failureMessage,
            ]}
          >
            <Text style={[
              styles.submissionMessageText,
              submissionMessage.type === 'success' ? styles.successText : styles.failureText,
            ]}>
              {submissionMessage.text}
            </Text>
          </View>
        ) : null}
        <PrimaryButton
          label={vehicle ? 'Save Changes' : 'Publish Listing'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submissionMessage?.type === 'success'}
          style={{ backgroundColor: colors.skyBottom }}
        />
        {submissionMessage?.type === 'success' ? (
          <PrimaryButton
            label={vehicle ? 'Return to my listings' : 'View my listings'}
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: colors.skyMid, marginTop: 12 }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.skyMid, letterSpacing: 1.6, marginTop: 8 },
  introTitle: { fontFamily: fonts.display, fontSize: 25, color: colors.ink, marginTop: 7 },
  introText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 20, marginTop: 6, marginBottom: 4 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft, marginBottom: 8, marginTop: 18 },
  input: {
    backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.hairline, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 11.5, marginTop: 6 },
  submissionMessage: { borderWidth: 1, borderRadius: radius.md, padding: 12, marginBottom: 12 },
  successMessage: { backgroundColor: '#EAF7EF', borderColor: '#A9D9B8' },
  failureMessage: { backgroundColor: '#FDEDED', borderColor: '#E6B2B2' },
  submissionMessageText: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 19 },
  successText: { color: '#176B35' },
  failureText: { color: colors.danger },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  mapPinOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surfaceAlt },
  mapPinCopy: { flex: 1 },
  mapPinTitle: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.ink },
  mapPinDescription: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.muted, marginTop: 4 },
});
