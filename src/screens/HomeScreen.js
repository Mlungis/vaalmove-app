import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardCard from '../components/DashboardCard';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const quickServices = [
  { label: 'Rent a Vehicle', icon: 'car-outline', bg: colors.blueBg, iconColor: colors.blueIcon, category: null },
  { label: 'Staff Transport', icon: 'bus-side', bg: colors.greenBg, iconColor: colors.greenIcon, category: 'minibuses' },
  { label: 'School Ride', icon: 'bus-school', bg: colors.amberBg, iconColor: colors.amberIcon, category: 'minibuses' },
  { label: 'Driver Hire', icon: 'person-outline', bg: colors.pinkBg, iconColor: colors.pinkIcon, category: null },
];

export default function HomeScreen({ navigation }) {
  const { vehicles, bookings, unreadNotifications, user } = useAppContext();
  const [query, setQuery] = React.useState('');
  const firstName = (user?.name || 'there').split(' ')[0];
  const trackableBooking = bookings.find((booking) => ['upcoming', 'active'].includes(booking.status));

  function handleSearchSubmit() {
    navigation.navigate('SearchFilter', { query });
  }

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
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Favorites')}>
              <Ionicons name="heart-outline" size={17} color={colors.inkSoft} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={17} color={colors.inkSoft} />
              {unreadNotifications > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hello, {firstName} 👋</Text>
          <Text style={styles.greetingSubtitle}>Where are we taking you today?</Text>
        </View>

        <Pressable style={styles.search} onPress={() => navigation.navigate('SearchFilter', { query })}>
          <Ionicons name="search" size={17} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for vehicles, services or routes"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </Pressable>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.heroCard} onPress={() => navigation.navigate('SearchResults')}>
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
              <Text style={styles.heroMeta}>{vehicles.length ? 'Available near you' : 'Listings from local providers appear here'}</Text>
            </View>
          </Pressable>

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
                onPress={() =>
                  item.label === 'Post a Job'
                    ? navigation.navigate('PostJob')
                    : navigation.navigate('SearchResults', { category: item.category })
                }
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
                onPress={() =>
                  item.label === 'Driver Hire'
                    ? navigation.navigate('PostJob')
                    : navigation.navigate('SearchResults', { category: item.category })
                }
              />
            ))}
          </View>

          <Pressable
            style={styles.trackBanner}
            onPress={() => trackableBooking
              ? navigation.navigate('VehicleTracking', { id: trackableBooking.vehicleId })
              : navigation.navigate('Bookings')}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.trackBannerTitle}>Live dispatch</Text>
              <Text style={styles.trackBannerSubtitle}>
                {trackableBooking ? 'Track your driver and vehicle location in real time.' : 'Your live tracking updates will appear here after booking.'}
              </Text>
            </View>
            <View style={styles.trackBadge}>
              <Ionicons name="navigate-outline" size={17} color={colors.skyBottom} />
            </View>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured rides</Text>
            <Pressable onPress={() => navigation.navigate('SearchResults')}>
              <Text style={styles.sectionLink}>Trending</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealStrip} contentContainerStyle={{ paddingRight: 8 }}>
            {vehicles.map((ride) => (
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

          <View style={styles.postJobBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.postJobTitle}>Need custom transport?</Text>
              <Text style={styles.postJobSubtitle}>Post a job and let providers come to you.</Text>
            </View>
            <Pressable style={styles.postJobBtn} onPress={() => navigation.navigate('PostJob')}>
              <Text style={styles.postJobBtnText}>Post a Job</Text>
            </Pressable>
          </View>
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
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E65252',
    borderWidth: 1,
    borderColor: '#fff',
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
  trackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
  },
  trackBannerTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink },
  trackBannerSubtitle: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 4 },
  trackBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postJobBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.skyBottom,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 18,
  },
  postJobTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: '#fff' },
  postJobSubtitle: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  postJobBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 12,
  },
  postJobBtnText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.skyBottom },
});
