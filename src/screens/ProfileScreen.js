import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import ListRow from '../components/ListRow';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, favoriteVehicles, bookings, signOut } = useAppContext();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  function handleLogout() {
    setLogoutError('');
    setLogoutVisible(true);
  }

  async function confirmLogout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await signOut();
    } catch (error) {
      setLogoutError(error?.message || 'Could not log out. Please try again.');
      setLoggingOut(false);
    }
  }

  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.eyebrow}>YOUR PRIVATE GARAGE</Text>
        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('PersonalInfo')} activeOpacity={0.85}>
          <Avatar initials={user.initials} size={56} color={colors.skyMid} imageUrl={user.avatarUrl} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#E8D5B2" />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.statValue}>{favoriteVehicles.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.memberSince}</Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          <ListRow icon="person-outline" label="Personal Information" onPress={() => navigation.navigate('PersonalInfo')} />
          <ListRow icon="card-outline" label="Payment Methods" onPress={() => navigation.navigate('PaymentMethods')} />
          <ListRow icon="location-outline" label="Saved Locations" onPress={() => navigation.navigate('SavedLocations')} />
          <ListRow icon="notifications-outline" label="Notification Settings" onPress={() => navigation.navigate('NotificationSettings')} />
          <ListRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} noBorder />
        </View>

        <Text style={styles.sectionLabel}>Business</Text>
        <View style={styles.menuCard}>
          <ListRow icon="stats-chart-outline" label="Provider Dashboard" meta="Manage your listings & earnings" onPress={() => navigation.navigate('ProviderDashboard')} noBorder />
        </View>

        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.menuCard}>
          <ListRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} noBorder />
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={17} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loggingOut) setLogoutVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Log out?</Text>
            <Text style={styles.confirmationText}>You will need to sign in again to access your account.</Text>
            {logoutError ? <Text accessibilityRole="alert" style={styles.logoutError}>{logoutError}</Text> : null}
            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutVisible(false)}
                disabled={loggingOut}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.confirmButton, loggingOut && styles.disabledButton]}
                onPress={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Log out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.skyMid, letterSpacing: 1.6, marginTop: 4, marginBottom: 5 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 18 },
  profileCard: {
    backgroundColor: colors.skyBottom,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#304764',
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontFamily: fonts.bodySemi, fontSize: 16, color: '#F7E8C7' },
  email: { color: '#D7DFEA', marginTop: 3, fontFamily: fonts.bodyMedium, fontSize: 12.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 15, borderRadius: radius.md, borderWidth: 1, borderColor: '#DDD8CD', alignItems: 'center' },
  statValue: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.inkSoft, marginTop: 4, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted, marginTop: 22, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  menuCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: '#DDD8CD', paddingHorizontal: 12 },
  logout: {
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: '#DDD8CD', padding: 14, borderRadius: radius.md, marginTop: 26,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  logoutText: { color: colors.danger, fontFamily: fonts.bodySemi },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,20,35,0.55)', justifyContent: 'center', padding: 24 },
  confirmationCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: 22 },
  confirmationTitle: { color: colors.ink, fontFamily: fonts.displaySemi, fontSize: 19 },
  confirmationText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 8 },
  logoutError: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 18, marginTop: 12 },
  confirmationActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
  cancelButton: { borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface },
  cancelButtonText: { color: colors.inkSoft, fontFamily: fonts.bodySemi, fontSize: 13 },
  confirmButton: { minWidth: 92, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.danger },
  disabledButton: { opacity: 0.7 },
  confirmButtonText: { color: '#FFFFFF', fontFamily: fonts.bodySemi, fontSize: 13 },
});
