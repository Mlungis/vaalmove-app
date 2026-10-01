import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
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
  const [submissionMessage, setSubmissionMessage] = useState(null);

  async function handleSubmit() {
    const next = {};
    const parsedBudget = Number(budget);
    if (!description.trim()) next.description = 'Please describe what you need.';
    if (!budget.trim() || !Number.isFinite(parsedBudget) || parsedBudget <= 0) next.budget = 'Enter a valid daily budget.';
    if (!dateNeeded.trim()) next.dateNeeded = 'Let providers know when you need it.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmissionMessage(null);
    setSubmitting(true);
    try {
      await addPostedJob({
        jobType,
        description: description.trim(),
        budget: parsedBudget,
        dateNeeded: dateNeeded.trim(),
        contact: contact.trim(),
        photos,
      });
      setSubmissionMessage({
        type: 'success',
        text: 'Your job request was posted and saved under Job Posts in My Bookings.',
      });
    } catch (error) {
      setSubmissionMessage({
        type: 'error',
        text: error?.message || 'We could not save your job request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Post a Job" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.subtitle}>Save the transport details you need so you can keep your request and photos together.</Text>

        <Text style={styles.label}>Job Type</Text>
        <View style={styles.chipRow}>
          {JOB_TYPES.map((t) => (
            <Chip key={t} label={t} active={jobType === t} onPress={() => setJobType(t)} />
          ))}
        </View>

        <Text style={styles.label}>Photos (optional)</Text>
        <PhotoPicker
          photos={photos}
          onChange={setPhotos}
          required={false}
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
            keyboardType="decimal-pad"
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
          disabled={submissionMessage?.type === 'success'}
          style={{ backgroundColor: colors.skyBottom }}
        />
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
        {submissionMessage?.type === 'success' ? (
          <PrimaryButton
            label="View Job Posts"
            onPress={() => navigation.getParent()?.navigate('Bookings', { tab: 'jobs' })}
            style={{ backgroundColor: colors.skyMid, marginTop: 12 }}
          />
        ) : null}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.skyBottom} />
          <Text style={styles.infoText}>Your request will appear under Job Posts in My Bookings.</Text>
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
  submissionMessage: { borderWidth: 1, borderRadius: radius.md, padding: 12, marginTop: 12 },
  successMessage: { backgroundColor: '#EAF7EF', borderColor: '#A9D9B8' },
  failureMessage: { backgroundColor: '#FDEDED', borderColor: '#E6B2B2' },
  submissionMessageText: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 19 },
  successText: { color: '#176B35' },
  failureText: { color: colors.danger },
  infoBox: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.blueBg, padding: 12, borderRadius: radius.md, marginTop: 18, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.skyBottom, lineHeight: 17 },
});
