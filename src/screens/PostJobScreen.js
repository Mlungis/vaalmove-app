import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Chip from '../components/Chip';
import PhotoPicker from '../components/PhotoPicker';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const JOB_TYPES = ['Staff Transport', 'School Ride', 'Driver Hire', 'Once-off Move', 'Event Shuttle'];

export default function PostJobScreen({ navigation }) {
  const { addPostedJob } = useAppContext();
  const [jobType, setJobType] = useState(JOB_TYPES[0]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [contact, setContact] = useState('');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const next = {};
    if (!description.trim()) next.description = 'Please describe what you need.';
    if (!budget.trim()) next.budget = 'Add a budget so providers can quote accurately.';
    if (!dateNeeded.trim()) next.dateNeeded = 'Let providers know when you need it.';
    if (photos.length === 0) next.photos = 'Add at least one photo of your vehicle.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setTimeout(() => {
      addPostedJob({ jobType, description, budget, dateNeeded, contact, photos });
      setSubmitting(false);
      Alert.alert('Job posted', 'Local providers can now see your job and photos, and send quotes.', [
        { text: 'OK', onPress: () => navigation.getParent()?.navigate('Bookings') },
      ]);
    }, 500);
  }

  return (
    <View style={styles.container}>
      <Header title="Post a Job" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.subtitle}>Tell us what transport you need and providers near you will send quotes.</Text>

        <Text style={styles.label}>Job Type</Text>
        <View style={styles.chipRow}>
          {JOB_TYPES.map((t) => (
            <Chip key={t} label={t} active={jobType === t} onPress={() => setJobType(t)} />
          ))}
        </View>

        <Text style={styles.label}>Photos of your vehicle</Text>
        <PhotoPicker
          photos={photos}
          onChange={(next) => { setPhotos(next); if (errors.photos) setErrors((e) => ({ ...e, photos: null })); }}
          error={errors.photos}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea, errors.description && styles.inputError]}
          placeholder="e.g. Need a 15-seater Quantum for a school trip on Friday morning..."
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={(t) => { setDescription(t); if (errors.description) setErrors((e) => ({ ...e, description: null })); }}
          multiline
          numberOfLines={4}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

        <Text style={styles.label}>Budget (per day)</Text>
        <View style={[styles.input, errors.budget && styles.inputError, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={{ color: colors.muted, fontFamily: fonts.bodySemi }}>R</Text>
          <TextInput
            style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginLeft: 6 }}
            placeholder="1200"
            placeholderTextColor={colors.muted}
            value={budget}
            onChangeText={(t) => { setBudget(t); if (errors.budget) setErrors((e) => ({ ...e, budget: null })); }}
            keyboardType="number-pad"
          />
        </View>
        {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}

        <Text style={styles.label}>Date needed</Text>
        <TextInput
          style={[styles.input, errors.dateNeeded && styles.inputError]}
          placeholder="e.g. Friday, 30 May 2025"
          placeholderTextColor={colors.muted}
          value={dateNeeded}
          onChangeText={(t) => { setDateNeeded(t); if (errors.dateNeeded) setErrors((e) => ({ ...e, dateNeeded: null })); }}
        />
        {errors.dateNeeded ? <Text style={styles.errorText}>{errors.dateNeeded}</Text> : null}

        <Text style={styles.label}>Contact number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="082 000 0000"
          placeholderTextColor={colors.muted}
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        <View style={{ height: 8 }} />
        <PrimaryButton
          label="Post Job"
          onPress={handleSubmit}
          loading={submitting}
          style={{ backgroundColor: colors.skyBottom }}
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.skyBottom} />
          <Text style={styles.infoText}>Providers typically respond within a few hours with quotes you can compare.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  subtitle: { color: colors.muted, marginBottom: 18, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft, marginBottom: 8, marginTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.hairline, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  textarea: { height: 100, textAlignVertical: 'top' },
  errorText: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 11.5, marginTop: 6 },
  infoBox: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.blueBg, padding: 12, borderRadius: radius.md, marginTop: 18, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.skyBottom, lineHeight: 17 },
});
