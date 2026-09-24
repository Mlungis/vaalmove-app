import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import Chip from '../components/Chip';
import PhotoPicker from '../components/PhotoPicker';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius } from '../theme';
import { CATEGORIES, useAppContext } from '../AppContext';

export default function AddListingScreen({ navigation }) {
  const { addVehicleListing, user } = useAppContext();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [minDays, setMinDays] = useState('2');
  const [pickupLocation, setPickupLocation] = useState('');
  const [insurance, setInsurance] = useState('Full cover');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    let result = null;
    let submissionError = false;
    try {
      result = await addVehicleListing({
          title: title.trim(),
          category,
          priceDaily: parsedPrice,
          year: parsedYear,
          fuel: 'Diesel',
          transmission: 'Manual',
          provider: user.providerName,
          location: pickupLocation.trim(),
          image: photos[0],
          gallery: photos,
          minDays: parsedMinDays,
          insurance,
          providerBadges: ['Verified provider', 'Insured', 'Response in 15 min'],
          verification: { idVerified: true, insured: true, businessVerified: true },
          pricingRules: { weekendSurcharge: 10, weeklyDiscount: 8, minDays: parsedMinDays, cancellation: 'Free cancellation up to 48 hours' },
          availabilityNote: 'Available for immediate bookings with instant confirmation.',
      });
    } catch (error) {
      submissionError = true;
      Alert.alert('Could not publish', error?.message || 'We could not save this listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
    if (result) {
      Alert.alert('Listing added', 'Your new vehicle is now live for renters to find.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else if (!submissionError) {
      Alert.alert('Could not publish', 'We could not save this listing. Check your connection and try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Create a signature listing" subtitle="Present your vehicle at its best" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.eyebrow}>HOST WITH DISTINCTION</Text>
        <Text style={styles.introTitle}>Add a vehicle to your collection</Text>
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

        <Text style={styles.label}>Insurance / cover</Text>
        <TextInput
          style={styles.input}
          placeholder="Full cover"
          placeholderTextColor={colors.muted}
          value={insurance}
          onChangeText={setInsurance}
        />

        <View style={{ height: 10 }} />
        <PrimaryButton
          label="Publish Listing"
          onPress={handleSubmit}
          loading={submitting}
          style={{ backgroundColor: colors.skyBottom }}
        />
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
