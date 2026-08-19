import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardCard from '../components/DashboardCard';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const quickServices = [
  { label: 'Rent a Vehicle', icon: 'car-outline', bg: colors.blueBg, iconColor: colors.blueIcon },
  { label: 'Staff Transport', icon: 'bus-side', bg: colors.greenBg, iconColor: colors.greenIcon },
  { label: 'School Ride', icon: 'bus-school', bg: colors.amberBg, iconColor: colors.amberIcon },
  { label: 'Driver Hire', icon: 'person-outline', bg: colors.pinkBg, iconColor: colors.pinkIcon },
];

// rideDeals will be sourced from the app context (vehicles) if available
const rideDeals = [];

export default function HomeScreen({ navigation }) {
  const { vehicles } = useAppContext();
  const featured = vehicles || [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#DDEEFC", "rgba(221,238,252,0)"]}
        style={styles.wash}
        pointerEvents="none"
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons name="bus-side" size={18} color="#fff" />
            </View>
            <Text style={styles.brandName}>
              <Text style={styles.brandLex}>Lex</Text>
              RidesZA
            </Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => navigation.getParent?.().navigate('Bookings')}>
            <Ionicons name="notifications-outline" size={17} color={colors.inkSoft} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hello, Lesedi 👋</Text>
          <Text style={styles.greetingSubtitle}>Where are we taking you today?</Text>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={17} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for vehicles, services or routes"
            placeholderTextColor={colors.muted}
          />
        </View>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTag}>Premium pickup</Text>
              <Text style={styles.heroTitle}>Drive in comfort across town</Text>
              <Text style={styles.heroMeta}>Available in Johannesburg • 24/7</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular services</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}><Text style={styles.sectionLink}>See all</Text></Pressable>
          </View>

          <View style={styles.row}>
            {quickServices.slice(0, 2).map((item) => (
              <DashboardCard
                key={item.label}
                Icon={MaterialCommunityIcons}
                iconName={item.icon}
                label={item.label}
                bg={item.bg}
                iconColor={item.iconColor}
                onPress={() => navigation.navigate('SearchResults', { type: item.label })}
              />
            ))}
          </View>

          <View style={styles.row}>
            {quickServices.slice(2).map((item) => (
              <DashboardCard
                key={item.label}
                Icon={MaterialCommunityIcons}
                iconName={item.icon}
                label={item.label}
                bg={item.bg}
                iconColor={item.iconColor}
                onPress={() => navigation.navigate('SearchResults', { type: item.label })}
              />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured rides</Text>
            <Text style={styles.sectionLink}>Trending</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealStrip} contentContainerStyle={{ paddingRight: 8 }}>
            {featured.map((ride) => (
              <DashboardCard
                key={ride.id}
                label={ride.title}
                description={`R${ride.priceDaily}/day`}
                image={ride.image}
                bg="#F5F8FC"
                accent="#39B0FF"
                onPress={() => navigation.navigate('VehicleDetails', { id: ride.id })}
              />
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 210 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.skyMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  brandLex: { color: '#8EF7FF' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { paddingHorizontal: 22, paddingTop: 18 },
  greetingTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  greetingSubtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, color: colors.ink },
  grid: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroCard: {
    height: 200,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#dfeaf8',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,31,58,0.38)',
  },
  heroContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  heroTag: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.84)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.ink,
  },
  sectionLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.skyBottom,
  },
  dealStrip: {
    marginBottom: 8,
    marginTop: 4,
  },
});
