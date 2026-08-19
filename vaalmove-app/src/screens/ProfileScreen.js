import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function ProfileScreen({ navigation }) {
  const menuItems = [
    { label: 'Personal Information', icon: 'person-outline', action: () => Alert.alert('Profile', 'Your personal profile is ready for integration.') },
    { label: 'Payment Methods', icon: 'card-outline', action: () => Alert.alert('Payment', 'Saved cards are available for future payments.') },
    { label: 'Saved Locations', icon: 'location-outline', action: () => Alert.alert('Locations', 'Saved homes and offices are ready to sync.') },
    { label: 'Notifications', icon: 'notifications-outline', action: () => Alert.alert('Notifications', 'Push notifications are configured in the demo.') },
    { label: 'Provider Dashboard', icon: 'business-outline', action: () => navigation.navigate('ProviderDashboard') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 18 }}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>Lesedi Moraba</Text>
            <Text style={styles.email}>lesedi@example.com</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.getParent?.().navigate('Home')}>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statValue}>14</Text><Text style={styles.statLabel}>Trips</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>4.9</Text><Text style={styles.statLabel}>Rating</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>R8.6k</Text><Text style={styles.statLabel}>Spent</Text></View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={item.label} style={[styles.menuItem, index === menuItems.length - 1 && { borderBottomWidth: 0 }]} onPress={item.action}>
              <Ionicons name={item.icon} size={18} color={colors.skyBottom} />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={() => navigation.getParent?.().navigate('Home')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  profileCard: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.hairline, marginTop: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(63,141,255,0.12)' },
  name: { fontFamily: fonts.bodySemi, color: colors.ink },
  email: { color: colors.muted, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 14 },
  statBox: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md, marginRight: 8, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center' },
  statValue: { fontFamily: fonts.displaySemi, color: colors.ink },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 4 },
  menuCard: { backgroundColor: colors.surfaceAlt, marginTop: 12, borderRadius: radius.md, padding: 6, borderWidth: 1, borderColor: colors.hairline },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingHorizontal: 10 },
  menuText: { fontFamily: fonts.bodySemi, marginLeft: 12, color: colors.ink },
  logout: { backgroundColor: '#FFF1F1', padding: 12, borderRadius: radius.md, marginTop: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(230,82,82,0.15)' },
  logoutText: { color: '#E65252', fontFamily: fonts.bodySemi },
});
