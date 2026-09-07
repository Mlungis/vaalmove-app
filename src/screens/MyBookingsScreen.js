import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../components/Chip';
import BookingCard from '../components/BookingCard';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'jobs', label: 'Job Posts' },
];

export default function MyBookingsScreen({ navigation }) {
  const { bookings, getVehicleById, cancelBooking, postedJobs } = useAppContext();
  const [tab, setTab] = useState('upcoming');

  const items = tab === 'jobs' ? [] : bookings.filter((b) => b.status === tab);

  function handleCancel(booking) {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep booking', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBooking(booking.id) },
    ]);
  }

  function goToVehicle(vehicleId) {
    navigation.navigate('Home', { screen: 'VehicleDetails', params: { id: vehicleId } });
  }

  function goToTracking(booking) {
    navigation.navigate('Home', { screen: 'VehicleTracking', params: { id: booking.vehicleId } });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('Home', { screen: 'PostJob' })}>
          <Ionicons name="add" size={16} color={colors.skyBottom} />
          <Text style={styles.postBtnText}>Post a Job</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={{ paddingRight: 8 }}>
        {TABS.map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 6, flexGrow: 1 }}>
        {tab === 'jobs' ? (
          postedJobs.length === 0 ? (
            <EmptyState
              icon="briefcase-outline"
              title="No job posts yet"
              subtitle="Post a job and providers near you will send quotes."
            />
          ) : (
            postedJobs.map((j) => (
              <View key={j.id} style={[styles.jobCard, shadow.soft]}>
                {j.photos?.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {j.photos.map((uri) => (
                      <Image key={uri} source={{ uri }} style={styles.jobPhoto} />
                    ))}
                  </ScrollView>
                ) : null}
                <View style={styles.jobHeaderRow}>
                  <Text style={styles.jobType}>{j.jobType}</Text>
                  <View style={styles.jobStatus}><Text style={styles.jobStatusText}>Open</Text></View>
                </View>
                <Text style={styles.jobDescription} numberOfLines={2}>{j.description}</Text>
                <View style={styles.jobMetaRow}>
                  <Text style={styles.jobMeta}>Budget: R{j.budget}/day</Text>
                  <Text style={styles.jobMeta}>{j.dateNeeded}</Text>
                </View>
              </View>
            ))
          )
        ) : items.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No ${tab} bookings`}
            subtitle={tab === 'upcoming' ? 'Browse vehicles and book your next ride.' : 'Bookings will show up here.'}
          />
        ) : (
          items.map((b) => {
            const vehicle = getVehicleById(b.vehicleId) || {};
            return (
              <BookingCard
                key={b.id}
                booking={b}
                vehicle={vehicle}
                onPress={() => goToVehicle(b.vehicleId)}
                onTrack={() => goToTracking(b)}
                onCancel={() => handleCancel(b)}
                onRebook={() => goToVehicle(b.vehicleId)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, paddingBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  postBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.blueBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  postBtnText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.skyBottom },
  tabRow: { paddingHorizontal: 18, flexGrow: 0 },
  jobCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 14 },
  jobPhoto: { width: 90, height: 70, borderRadius: 10, marginRight: 8 },
  jobHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobType: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  jobStatus: { backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  jobStatusText: { color: colors.success, fontFamily: fonts.bodySemi, fontSize: 10.5 },
  jobDescription: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, marginBottom: 8 },
  jobMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  jobMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5 },
});
