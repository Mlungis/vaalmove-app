import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';

const STATUS_STYLE = {
  upcoming: { bg: colors.blueBg, color: colors.skyBottom, label: 'Upcoming' },
  completed: { bg: colors.successBg, color: colors.success, label: 'Completed' },
  cancelled: { bg: colors.dangerBg, color: colors.danger, label: 'Cancelled' },
};

function fmt(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

export default function BookingCard({ booking, vehicle, onPress, onCancel, onRebook, onTrack }) {
  const status = STATUS_STYLE[booking.status] || STATUS_STYLE.upcoming;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, shadow.soft]}>
      <View style={styles.topRow}>
        {vehicle?.image ? (
          <Image source={{ uri: vehicle.image }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.blueBg }]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{vehicle?.title || 'Vehicle'}</Text>
          <Text style={styles.meta}>{fmt(booking.pickup)} – {fmt(booking.dropoff)}</Text>
          <Text style={styles.code}>Booking {booking.code}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.total}>R{booking.total}</Text>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          {booking.status === 'upcoming' && onTrack ? (
            <TouchableOpacity onPress={onTrack}><Text style={styles.track}>Track</Text></TouchableOpacity>
          ) : null}
          {booking.status === 'upcoming' && onCancel ? (
            <TouchableOpacity onPress={onCancel}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          ) : null}
          {booking.status !== 'upcoming' && onRebook ? (
            <TouchableOpacity onPress={onRebook}><Text style={styles.rebook}>Book again</Text></TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 54, height: 54, borderRadius: 12, marginRight: 12 },
  title: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 3 },
  code: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 10.5 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  total: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink },
  track: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.skyBottom },
  cancel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.danger },
  rebook: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.skyBottom },
});
