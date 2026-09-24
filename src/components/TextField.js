import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius } from '../theme';

export default function TextField({
  label,
  icon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError]}>
        {icon ? <Ionicons name={icon} size={17} color="rgba(255,255,255,0.8)" /> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.55)"
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={rightIcon} size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: { borderColor: '#FFB4B4' },
  inputFocused: { borderColor: '#E8D5B2', backgroundColor: 'rgba(255,255,255,0.22)' },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: '#fff',
    paddingVertical: 2,
  },
  errorText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: '#FFD9D9',
    marginTop: 5,
  },
});
