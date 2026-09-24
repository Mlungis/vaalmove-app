import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, radius } from '../theme';

const MAX_PHOTOS = 6;

export default function PhotoPicker({ photos = [], onChange, max = MAX_PHOTOS, error }) {
  async function pickFromLibrary() {
    if (photos.length >= max) {
      Alert.alert('Limit reached', `You can add up to ${max} photos.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: max - photos.length,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      onChange([...photos, ...uris].slice(0, max));
    }
  }

  async function takePhoto() {
    if (photos.length >= max) {
      Alert.alert('Limit reached', `You can add up to ${max} photos.`);
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      onChange([...photos, result.assets[0].uri].slice(0, max));
    }
  }

  function handleAdd() {
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function removePhoto(uri) {
    onChange(photos.filter((p) => p !== uri));
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {photos.map((uri) => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(uri)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < max ? (
          <TouchableOpacity style={[styles.addBtn, error && styles.addBtnError]} onPress={handleAdd}>
            <Ionicons name="camera-outline" size={22} color={colors.skyBottom} />
            <Text style={styles.addBtnText}>Add photo</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      <Text style={styles.hint}>
        {photos.length}/{max} photos added{error ? '' : ' · At least 1 required'}
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const SIZE = 84;

const styles = StyleSheet.create({
  thumbWrap: { width: SIZE, height: SIZE, borderRadius: radius.sm, overflow: 'visible' },
  thumb: { width: SIZE, height: SIZE, borderRadius: radius.sm },
  removeBtn: {
    position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  addBtn: {
    width: SIZE, height: SIZE, borderRadius: radius.sm, backgroundColor: colors.blueBg,
    borderWidth: 1.5, borderColor: colors.skyBottom, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addBtnError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  addBtnText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.skyBottom, textAlign: 'center' },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 8 },
  errorText: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.danger, marginTop: 4 },
});
