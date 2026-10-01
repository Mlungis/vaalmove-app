import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Alert } from '../lib/alerts';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PersonalInfoScreen({ navigation }) {
  const { user, updateUser, refreshProfile, uploadAvatar } = useAppContext();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;
    refreshProfile()
      .then((profile) => {
        if (!active || !profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setAvatarUrl(profile.avatarUrl);
      })
      .catch((refreshError) => {
        Alert.alert('Could not load profile', refreshError?.message || 'Please try again.');
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => { active = false; };
  }, [refreshProfile]);

  async function handleChoosePhoto() {
    if (loadingProfile || saving) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const savedUrl = await uploadAvatar(result.assets[0].uri);
    if (!savedUrl) {
      Alert.alert('Could not update photo', 'Check the avatars bucket and policies in Supabase, then try again.');
      return;
    }
    setAvatarUrl(savedUrl);
  }

  async function handleSave() {
    if (loadingProfile || saving) return;
    if (!name.trim() || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ type: 'error', message: 'Enter your full name and a valid email address.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), initials: initialsFor(name) });
      setFeedback({
        type: 'success',
        message: 'Your profile was saved. If you changed your email, check your inbox to confirm the new address.',
      });
    } catch (saveError) {
      setFeedback({ type: 'error', message: saveError?.message || 'Could not save your profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Personal Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32, alignItems: 'center' }}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handleChoosePhoto} disabled={loadingProfile || saving}>
          <Avatar initials={initialsFor(name)} size={84} color={colors.skyMid} imageUrl={avatarUrl} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: '100%' }}>
          <Text style={styles.label}>Full name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} editable={!loadingProfile && !saving} placeholder="Full name" placeholderTextColor={colors.muted} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} editable={!loadingProfile && !saving} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.muted} />

          <Text style={styles.label}>Phone number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} editable={!loadingProfile && !saving} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.muted} />

          {feedback ? (
            <Text style={[styles.feedback, feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
              {feedback.message}
            </Text>
          ) : null}
          <View style={{ height: 10 }} />
          <PrimaryButton
            label="Save changes"
            onPress={handleSave}
            disabled={loadingProfile}
            loading={saving}
            style={{ backgroundColor: colors.skyBottom }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  avatarWrap: { marginBottom: 24, position: 'relative' },
  editBadge: {
    position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.skyBottom,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 2, borderColor: colors.surface,
  },
  editBadgeText: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 9.5 },
  label: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.inkSoft, marginBottom: 7, marginTop: 14 },
  feedback: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 18, marginTop: 14 },
  feedbackError: { color: colors.danger || '#C62828' },
  feedbackSuccess: { color: colors.success || '#2E7D32' },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.body, fontSize: 14, color: colors.ink, borderWidth: 1, borderColor: colors.hairline,
  },
});
