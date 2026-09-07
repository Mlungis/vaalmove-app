import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
  const { user, updateUser } = useAppContext();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  function handleSave() {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Name and email are required.');
      return;
    }
    updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), initials: initialsFor(name) });
    Alert.alert('Saved', 'Your personal information has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      <Header title="Personal Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32, alignItems: 'center' }}>
        <TouchableOpacity style={styles.avatarWrap} onPress={() => Alert.alert('Change photo', 'Photo upload is not available in this preview build.')}>
          <Avatar initials={initialsFor(name)} size={84} color={colors.skyMid} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: '100%' }}>
          <Text style={styles.label}>Full name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.muted} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.muted} />

          <Text style={styles.label}>Phone number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.muted} />

          <View style={{ height: 10 }} />
          <PrimaryButton label="Save changes" onPress={handleSave} style={{ backgroundColor: colors.skyBottom }} />
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
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.body, fontSize: 14, color: colors.ink, borderWidth: 1, borderColor: colors.hairline,
  },
});
