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
    if (!title.trim()) next.title = 'Give your listing a title.';
    if (!price.trim() || Number(price) <= 0) next.price = 'Enter a valid daily price.';
    if (!pickupLocation.trim()) next.location = 'Add a pickup location.';
    if (photos.length === 0) next.photos = 'Add at least one photo of the vehicle.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await addVehicleListing({
        title: title.trim(),
        category,
        priceDaily: Number(price) || 0,
        year: Number(year) || new Date().getFullYear(),
        fuel: 'Diesel',
        transmission: 'Manual',
        provider: user.providerName,
        location: pickupLocation.trim(),
        image: photos[0],
        gallery: photos,
        minDays: Number(minDays) || 1,
        insurance,
        providerBadges: ['Verified provider', 'Insured', 'Response in 15 min'],
        verification: { idVerified: true, insured: true, businessVerified: true },
        pricingRules: { weekendSurcharge: 10, weeklyDiscount: 8, minDays: Number(minDays) || 1, cancellation: 'Free cancellation up to 48 hours' },
        availabilityNote: 'Available for immediate bookings with instant confirmation.',
    });
    setSubmitting(false);
    if (result) {
      Alert.alert('Listing added', 'Your new vehicle is now live for renters to find.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Could not publish', 'We could not save this listing. Check your connection and try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Add New Listing" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
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
          style={styles.input}
          placeholder="2021"
          placeholderTextColor={colors.muted}
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
          maxLength={4}
        />

        <Text style={styles.label}>Minimum rental days</Text>
        <TextInput
          style={styles.input}
          placeholder="2"
          placeholderTextColor={colors.muted}
          value={minDays}
          onChangeText={setMinDays}
          keyboardType="number-pad"
        />

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
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.hairline, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 11.5, marginTop: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
