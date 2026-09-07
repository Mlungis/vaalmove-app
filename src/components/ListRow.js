import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function ListRow({ icon, iconColor, label, meta, onPress, right, danger, noBorder, badge }) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.65 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, noBorder && { borderBottomWidth: 0 }]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: danger ? colors.dangerBg : colors.blueBg }]}>
          <Ionicons name={icon} size={17} color={danger ? colors.danger : (iconColor || colors.skyBottom)} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, danger && { color: colors.danger }]}>{label}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {right !== undefined ? right : (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  badge: {
    backgroundColor: colors.skyBottom,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 4,
  },
  badgeText: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 11 },
});
