import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, colors } from '../theme';

export default function StarRating({ rating = 0, reviews, size = 13, showCount = true }) {
  const full = Math.round(rating);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= full ? 'star' : 'star-outline'}
          size={size}
          color="#E0A425"
          style={{ marginRight: 1 }}
        />
      ))}
      {showCount ? (
        <Text style={styles.text}>
          {rating ? rating.toFixed(1) : 'New'}{reviews ? ` (${reviews})` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { marginLeft: 6, fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSoft },
});
