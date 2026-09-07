import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['S','M','T','W','T','F','S'];

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DateRangeCalendar({ startDate, endDate, onChange }) {
  const [cursor, setCursor] = useState(() => startOfDay(startDate || new Date()));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function handlePress(day) {
    if (!day || day < today) return;
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: day, endDate: null });
    } else if (day < startDate) {
      onChange({ startDate: day, endDate: null });
    } else {
      onChange({ startDate, endDate: day });
    }
  }

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={16} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={16} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.dowRow}>
        {DOW.map((d, i) => (
          <Text key={i} style={styles.dow}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={idx} style={styles.cell} />;
          const disabled = day < today;
          const isStart = sameDay(day, startDate);
          const isEnd = sameDay(day, endDate);
          const inRange = startDate && endDate && day > startDate && day < endDate;
          return (
            <TouchableOpacity
              key={idx}
              disabled={disabled}
              onPress={() => handlePress(day)}
              style={[
                styles.cell,
                inRange && styles.cellInRange,
                (isStart || isEnd) && styles.cellSelected,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  disabled && styles.cellTextDisabled,
                  (isStart || isEnd) && styles.cellTextSelected,
                ]}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL = 40;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dow: { width: CELL, textAlign: 'center', fontFamily: fonts.bodySemi, fontSize: 11, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginBottom: 2 },
  cellInRange: { backgroundColor: colors.blueBg, borderRadius: 0 },
  cellSelected: { backgroundColor: colors.skyBottom },
  cellText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  cellTextDisabled: { color: colors.hairline },
  cellTextSelected: { color: '#fff', fontFamily: fonts.bodySemi },
});
