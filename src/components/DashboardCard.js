import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { fonts, radius } from '../theme';

export default function DashboardCard({
  Icon,
  iconName,
  label,
  bg,
  iconColor,
  onPress,
  image,
  description,
  accent,
  style,
}) {
  if (image) {
    return (
      <TouchableOpacity activeOpacity={0.9} style={[styles.imageCard, { backgroundColor: bg }]} onPress={onPress}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageInfo}>
          <Text style={styles.imageLabel}>{label}</Text>
          {description ? <Text style={styles.imageDescription}>{description}</Text> : null}
        </View>
        {accent ? <View style={[styles.accentBadge, { backgroundColor: accent }]} /> : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.card, style, { backgroundColor: bg }]} onPress={onPress}>
      <View style={styles.bubble}>
        <Icon name={iconName} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 112,
    borderRadius: radius.lg,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  bubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E2340',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontFamily: fonts.displaySemi,
    fontSize: 14.5,
    color: '#0E2340',
  },
  imageCard: {
    width: 220,
    minHeight: 176,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(14,35,64,0.06)',
  },
  image: {
    width: '100%',
    height: 118,
  },
  imageInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'center',
  },
  imageLabel: {
    fontFamily: fonts.displaySemi,
    fontSize: 15,
    color: '#0E2340',
    marginBottom: 2,
  },
  imageDescription: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: '#4A5C78',
  },
  accentBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 10,
    height: 10,
    borderRadius: 99,
    opacity: 0.9,
  },
});
