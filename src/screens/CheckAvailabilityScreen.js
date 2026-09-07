import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import DateRangeCalendar from '../components/DateRangeCalendar';
import { PrimaryButton } from '../components/Buttons';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:00'];

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function CheckAvailabilityScreen({ navigation, route }) {
  const { getVehicleById, getVehicleAvailability, setBookingDraft } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const availability = getVehicleAvailability(id);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(dayAfter);
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnTime, setReturnTime] = useState('17:00');
  const [timeModal, setTimeModal] = useState(null); // 'pickup' | 'return' | null

  const days = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / 86400000))
    : 1;
  const total = (vehicle.priceDaily || 0) * days;

  function toIsoDate(date) {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
  }

  const blockedDates = availability.blockedDates || [];
  const hasConflict = blockedDates.some((dateKey) => {
    if (!(startDate && endDate)) return false;
    const selectedStart = new Date(startDate).setHours(0, 0, 0, 0);
    const selectedEnd = new Date(endDate).setHours(0, 0, 0, 0);
    const compareDate = new Date(dateKey).setHours(0, 0, 0, 0);
    return compareDate >= selectedStart && compareDate <= selectedEnd;
  });

  function handleBook() {
    if (hasConflict) {
      Alert.alert('Not available', 'Selected dates overlap with a booked window. Try another date range.');
      return;
    }
    setBookingDraft({
      vehicleId: id,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      pickupTime,
      returnTime,
      days,
      subtotal: total,
    });
    navigation.navigate('BookingSummary', { id });
  }

  return (
    <View style={styles.container}>
      <Header title="Check Availability" onBack={() => navigation.goBack()} subtitle={vehicle.title} />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={[styles.availabilityBanner, availability.status === 'booked' ? styles.bannerBooked : availability.status === 'limited' ? styles.bannerLimited : styles.bannerAvailable]}>
          <Ionicons name={availability.status === 'booked' ? 'alert-circle' : 'shield-checkmark'} size={16} color={availability.status === 'booked' ? colors.warning : colors.success} />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.availabilityStatus}>{availability.status === 'booked' ? 'Not available' : availability.status === 'limited' ? 'Limited availability' : 'Available now'}</Text>
            <Text style={styles.availabilitySub}>{availability.note || 'Available for booking'}</Text>
          </View>
        </View>

        <DateRangeCalendar
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate: s, endDate: e }) => { setStartDate(s); setEndDate(e); }}
        />

        <View style={styles.selectedDates}>
          <Ionicons name="calendar-outline" size={14} color={colors.skyBottom} />
          <Text style={styles.selectedDatesText}>
            {startDate ? fmtDate(startDate) : 'Select start'} → {endDate ? fmtDate(endDate) : 'Select end'} · {days} day{days === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.pickerRow}>
          <TouchableOpacity style={[styles.picker, shadow.soft]} onPress={() => setTimeModal('pickup')}>
            <Text style={styles.pickerLabel}>Pickup Time</Text>
            <Text style={styles.pickerValue}>{pickupTime}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.picker, shadow.soft]} onPress={() => setTimeModal('return')}>
            <Text style={styles.pickerLabel}>Return Time</Text>
            <Text style={styles.pickerValue}>{returnTime}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, shadow.soft]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>R{vehicle.priceDaily} × {days} day{days === 1 ? '' : 's'}</Text>
            <Text style={styles.summaryValue}>R{total}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>R{total}</Text>
        </View>

        {hasConflict ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Selected dates overlap with a booked window. Try another date range for this vehicle.</Text>
          </View>
        ) : null}

        <PrimaryButton label="Book Now" onPress={handleBook} style={{ backgroundColor: colors.skyBottom }} />
      </ScrollView>

      <Modal visible={!!timeModal} transparent animationType="slide" onRequestClose={() => setTimeModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{timeModal === 'pickup' ? 'Pickup time' : 'Return time'}</Text>
              <TouchableOpacity onPress={() => setTimeModal(null)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TIMES}
              numColumns={3}
              keyExtractor={(t) => t}
              columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
              renderItem={({ item }) => {
                const active = timeModal === 'pickup' ? pickupTime === item : returnTime === item;
                return (
                  <TouchableOpacity
                    style={[styles.timeSlot, active && styles.timeSlotActive]}
                    onPress={() => {
                      if (timeModal === 'pickup') setPickupTime(item); else setReturnTime(item);
                      setTimeModal(null);
                    }}
                  >
                    <Text style={[styles.timeSlotText, active && styles.timeSlotTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  selectedDates: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 2 },
  selectedDatesText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.inkSoft },
  pickerRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  picker: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 14, borderRadius: radius.md },
  pickerLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  pickerValue: { color: colors.ink, fontFamily: fonts.bodySemi, marginTop: 6, fontSize: 16 },
  summaryCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  summaryValue: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 18, paddingHorizontal: 4 },
  totalLabel: { color: colors.muted, fontFamily: fonts.body },
  totalValue: { fontFamily: fonts.displaySemi, fontSize: 22, color: colors.ink },
  availabilityBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, borderWidth: 1, marginBottom: 12 },
  bannerAvailable: { backgroundColor: colors.successBg, borderColor: 'rgba(47, 168, 91, 0.24)' },
  bannerLimited: { backgroundColor: colors.warningBg, borderColor: 'rgba(224, 138, 43, 0.24)' },
  bannerBooked: { backgroundColor: colors.dangerBg, borderColor: 'rgba(230, 82, 82, 0.18)' },
  bannerTextWrap: { flex: 1 },
  availabilityStatus: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.ink },
  availabilitySub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  warningBox: { backgroundColor: colors.warningBg, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(224,138,43,0.25)', padding: 12, marginBottom: 16 },
  warningText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  timeSlot: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center' },
  timeSlotActive: { backgroundColor: colors.skyBottom, borderColor: colors.skyBottom },
  timeSlotText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  timeSlotTextActive: { color: '#fff' },
});
