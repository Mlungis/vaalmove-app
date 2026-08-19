import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const DATE_OPTIONS = ['20 Aug', '21 Aug', '22 Aug', '23 Aug'];
const TIME_OPTIONS = ['08:00', '10:30', '13:00', '17:00'];

export default function CheckAvailabilityScreen({ navigation, route }) {
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const [pickupDate, setPickupDate] = useState('20 Aug');
  const [returnDate, setReturnDate] = useState('21 Aug');
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnTime, setReturnTime] = useState('17:00');

  const total = (vehicle.priceDaily || 850) + 240;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 18 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.title}>Check Availability</Text>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Select trip dates</Text>
            <Text style={styles.calendarBadge}>Available</Text>
          </View>
          <View style={styles.tagRow}>
            {DATE_OPTIONS.map((date) => (
              <TouchableOpacity
                key={date}
                style={[styles.tag, date === pickupDate && styles.tagActive]}
                onPress={() => setPickupDate(date)}
              >
                <Text style={[styles.tagText, date === pickupDate && styles.tagTextActive]}>{date}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.caption}>Return date</Text>
          <View style={styles.tagRow}>
            {DATE_OPTIONS.slice(1).map((date) => (
              <TouchableOpacity
                key={date}
                style={[styles.tag, date === returnDate && styles.tagActive]}
                onPress={() => setReturnDate(date)}
              >
                <Text style={[styles.tagText, date === returnDate && styles.tagTextActive]}>{date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.pickerRow}>
          <View style={styles.picker}>
            <Text style={styles.pickerLabel}>Pickup time</Text>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity key={time} style={[styles.timeChip, time === pickupTime && styles.timeChipActive]} onPress={() => setPickupTime(time)}>
                  <Text style={[styles.timeText, time === pickupTime && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.pickerRow}>
          <View style={styles.picker}>
            <Text style={styles.pickerLabel}>Return time</Text>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity key={time} style={[styles.timeChip, time === returnTime && styles.timeChipActive]} onPress={() => setReturnTime(time)}>
                  <Text style={[styles.timeText, time === returnTime && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>R{total}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BookingSummary', { id, pickupDate, returnDate, pickupTime, returnTime })}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  backButton: { marginBottom: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 12 },
  calendarCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.hairline },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarTitle: { fontFamily: fonts.bodySemi, color: colors.ink },
  calendarBadge: { color: '#1DAA66', fontFamily: fonts.bodySemi, fontSize: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: '#F2F7FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(20,69,158,0.10)' },
  tagActive: { backgroundColor: colors.skyBottom },
  tagText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  tagTextActive: { color: '#fff' },
  caption: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginBottom: 10 },
  pickerRow: { marginTop: 14 },
  picker: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  pickerLabel: { color: colors.muted, fontFamily: fonts.body },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  timeChip: { backgroundColor: '#F4F7FC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  timeChipActive: { backgroundColor: '#DFF2FF' },
  timeText: { color: colors.ink, fontFamily: fonts.bodySemi, fontSize: 12 },
  timeTextActive: { color: colors.skyBottom },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingHorizontal: 4 },
  totalLabel: { color: colors.muted, fontFamily: fonts.body },
  totalValue: { fontFamily: fonts.displaySemi, fontSize: 24, color: colors.ink },
  button: { backgroundColor: colors.skyBottom, paddingVertical: 14, borderRadius: 999, marginTop: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontFamily: fonts.bodySemi },
});
