import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import ListRow from '../components/ListRow';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, favoriteVehicles, bookings, signOut } = useAppContext();

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }

  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity style={[styles.profileCard, shadow.soft]} onPress={() => navigation.navigate('PersonalInfo')} activeOpacity={0.85}>
          <Avatar initials={user.initials} size={56} color={colors.skyMid} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadow.soft]}>
            <Text style={styles.statValue}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <TouchableOpacity style={[styles.statCard, shadow.soft]} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.statValue}>{favoriteVehicles.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, shadow.soft]}>
            <Text style={styles.statValue}>{user.memberSince}</Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={[styles.menuCard, shadow.soft]}>
          <ListRow icon="person-outline" label="Personal Information" onPress={() => navigation.navigate('PersonalInfo')} />
          <ListRow icon="card-outline" label="Payment Methods" onPress={() => navigation.navigate('PaymentMethods')} />
          <ListRow icon="location-outline" label="Saved Locations" onPress={() => navigation.navigate('SavedLocations')} />
          <ListRow icon="notifications-outline" label="Notification Settings" onPress={() => navigation.navigate('NotificationSettings')} />
          <ListRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} noBorder />
        </View>

        <Text style={styles.sectionLabel}>Business</Text>
        <View style={[styles.menuCard, shadow.soft]}>
          <ListRow icon="stats-chart-outline" label="Provider Dashboard" meta="Manage your listings & earnings" onPress={() => navigation.navigate('ProviderDashboard')} noBorder />
        </View>

        <Text style={styles.sectionLabel}>Support</Text>
        <View style={[styles.menuCard, shadow.soft]}>
          <ListRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} noBorder />
        </View>

        <TouchableOpacity style={[styles.logout, shadow.soft]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={17} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 16 },
  profileCard: { backgroundColor: colors.surfaceAlt, padding: 14, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink },
  email: { color: colors.muted, marginTop: 3, fontFamily: fonts.body, fontSize: 12.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, alignItems: 'center' },
  statValue: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink },
  statLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.muted, marginTop: 4, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted, marginTop: 22, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  menuCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 12 },
  logout: {
    backgroundColor: colors.surfaceAlt, padding: 14, borderRadius: radius.md, marginTop: 26,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  logoutText: { color: colors.danger, fontFamily: fonts.bodySemi },
});
