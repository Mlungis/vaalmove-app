import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme';

export default function Avatar({ initials = '?', size = 56, color = '#2F7FE0' }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.displaySemi, color: '#fff' },
});
