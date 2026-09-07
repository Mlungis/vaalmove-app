import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function SavedLocationsScreen({ navigation }) {
  const { savedLocations, addSavedLocation, removeSavedLocation } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  function handleAdd() {
    if (!label.trim() || !address.trim()) return;
    addSavedLocation({ label: label.trim(), address: address.trim() });
    setLabel(''); setAddress('');
    setShowAdd(false);
  }

  function handleRemove(loc) {
    Alert.alert('Remove location', `Remove "${loc.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSavedLocation(loc.id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Header title="Saved Locations" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        {savedLocations.length === 0 ? (
          <EmptyState icon="location-outline" title="No saved locations" subtitle="Save home, work, or favorite pickup spots." />
        ) : (
          savedLocations.map((l) => (
            <View key={l.id} style={[styles.card, shadow.soft]}>
              <View style={styles.iconWrap}>
                <Ionicons name={l.icon || 'location-outline'} size={17} color={colors.skyBottom} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{l.label}</Text>
                <Text style={styles.meta} numberOfLines={1}>{l.address}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(l)}>
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add-circle-outline" size={18} color={colors.skyBottom} />
          <Text style={styles.addBtnText}>Add location</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add location</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Label (e.g. Gym)" placeholderTextColor={colors.muted} value={label} onChangeText={setLabel} />
            <TextInput style={styles.input} placeholder="Address" placeholderTextColor={colors.muted} value={address} onChangeText={setAddress} />
            <PrimaryButton label="Save location" onPress={handleAdd} style={{ backgroundColor: colors.skyBottom }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 12, gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  meta: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 11.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14, marginTop: 6 },
  addBtnText: { color: colors.skyBottom, fontFamily: fonts.bodySemi, fontSize: 13.5 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 12, borderWidth: 1, borderColor: colors.hairline,
  },
});
