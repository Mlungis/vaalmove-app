import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

const { width } = Dimensions.get('window');

export default function VehicleDetailsScreen({ navigation, route }) {
  const { getVehicleById, getVehicleReviews, isFavorite, toggleFavorite } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const reviews = getVehicleReviews(id);
  const providerBadges = vehicle.providerBadges || ['Verified provider'];
  const pricingRules = vehicle.pricingRules || {};
  const gallery = vehicle.gallery && vehicle.gallery.length ? vehicle.gallery : [vehicle.image].filter(Boolean);
  const [activeImage, setActiveImage] = React.useState(0);
  const favorite = isFavorite(id);

  function handleShare() {
    Share.share({
      message: `Check out the ${vehicle.title} on LexRidesZA — R${vehicle.priceDaily}/day.`,
    }).catch(() => {});
  }

  function handleContactProvider() {
    Alert.alert('Message sent', `Your enquiry about the ${vehicle.title} was sent to ${vehicle.provider}.`);
  }

  function handleReportIssue() {
    Alert.alert('Issue reporting', 'A support agent would review this listing for quality and safety checks.');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          {gallery.length ? (
            <Image source={{ uri: gallery[activeImage] }} style={styles.hero} resizeMode="cover" />
          ) : (
            <View style={[styles.hero, { backgroundColor: colors.blueBg }]} />
          )}
          <SafeAreaView style={styles.heroTop} edges={['top']}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={18} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn} onPress={() => toggleFavorite(id)}>
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={18} color={favorite ? colors.danger : colors.ink} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {gallery.length > 1 ? (
            <View style={styles.dotsRow}>
              {gallery.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)} style={[styles.imgDot, i === activeImage && styles.imgDotActive]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{vehicle.title || 'Vehicle'}</Text>
              <Text style={styles.meta}>
                {vehicle.year ? `${vehicle.year} · ${vehicle.fuel || 'N/A'} · ${vehicle.transmission || 'N/A'}${vehicle.drivetrain ? ' · ' + vehicle.drivetrain : ''}` : ''}
              </Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagValue}>R{vehicle.priceDaily}</Text>
              <Text style={styles.priceTagUnit}>/day</Text>
            </View>
          </View>

          <View style={styles.row}>
            <StarRating rating={vehicle.rating} reviews={vehicle.reviews} />
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={13} color={colors.muted} />
              <Text style={styles.locText}>{vehicle.location}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.providerCard, shadow.soft]} onPress={() => navigation.getParent?.().navigate('Messages')}>
            <Avatar initials={(vehicle.provider || '??').slice(0, 2).toUpperCase()} size={44} color={colors.skyMid} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>{vehicle.provider}</Text>
              <Text style={styles.providerMeta}>Usually responds within {vehicle.verification?.businessVerified ? '15 min' : '1 hour'}</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={handleContactProvider}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.skyBottom} />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={[styles.badgeRow, shadow.soft]}>
            {providerBadges.map((badge) => (
              <View key={badge} style={styles.badgeChip}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.availabilityCard, shadow.soft]}>
            <View style={styles.availabilityHeader}>
              <Text style={styles.sectionTitle}>Trust & availability</Text>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
            <Text style={styles.availabilityText}>{vehicle.availabilityNote || 'Available for immediate booking'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaRowLabel}>Verified ID</Text>
              <Text style={styles.metaRowValue}>{vehicle.verification?.idVerified ? 'Yes' : 'Pending'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaRowLabel}>Insurance</Text>
              <Text style={styles.metaRowValue}>{vehicle.verification?.insured ? 'Included' : 'Not included'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={[styles.infoCard, shadow.soft]}>
            <View style={styles.priceGrid}>
              <View style={styles.priceCell}>
                <Text style={styles.priceCellValue}>R{vehicle.priceDaily}</Text>
                <Text style={styles.priceCellLabel}>per day</Text>
              </View>
              <View style={styles.priceCell}>
                <Text style={styles.priceCellValue}>R{vehicle.priceDaily ? Math.round(vehicle.priceDaily * 6 * (1 - (pricingRules.weeklyDiscount || 0) / 100)) : '--'}</Text>
                <Text style={styles.priceCellLabel}>week price</Text>
              </View>
              <View style={styles.priceCell}>
                <Text style={styles.priceCellValue}>R{vehicle.priceDaily ? Math.round(vehicle.priceDaily * 22 * (1 - (pricingRules.weeklyDiscount || 0) / 100)) : '--'}</Text>
                <Text style={styles.priceCellLabel}>month price</Text>
              </View>
            </View>
            <Text style={styles.pricingNote}>Weekend surcharge: {pricingRules.weekendSurcharge || 10}% · {pricingRules.cancellation || 'Standard terms apply'}</Text>
          </View>

          <Text style={styles.sectionTitle}>What's included</Text>
          <View style={[styles.infoCard, shadow.soft]}>
            {['Insurance', 'Roadside assist', '150km/day included'].map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {vehicle.features?.length ? (
            <>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featureWrap}>
                {vehicle.features.map((f) => (
                  <View key={f} style={styles.featureChip}>
                    <MaterialCommunityIcons name="check-bold" size={12} color={colors.skyBottom} />
                    <Text style={styles.featureChipText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews ({vehicle.reviews || 0})</Text>
            <TouchableOpacity onPress={handleReportIssue}>
              <Text style={styles.reportLink}>Report issue</Text>
            </TouchableOpacity>
          </View>
          {reviews.map((r) => (
            <View key={r.id} style={[styles.reviewCard, shadow.soft]}>
              <View style={styles.reviewHeader}>
                <Avatar initials={r.name.slice(0, 2).toUpperCase()} size={32} color={colors.pinkIcon} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <StarRating rating={r.rating} showCount={false} size={11} />
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total from</Text>
          <Text style={styles.footerPrice}>R{vehicle.priceDaily}<Text style={styles.footerUnit}>/day</Text></Text>
        </View>
        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => navigation.navigate('CheckAvailability', { id })}>
          <Text style={styles.ctaText}>Check Availability</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HERO_H = 280;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  heroWrap: { height: HERO_H, backgroundColor: colors.blueBg },
  hero: { width: '100%', height: HERO_H },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  circleBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  dotsRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  imgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  imgDotActive: { backgroundColor: '#fff', width: 18 },
  content: { padding: 18, marginTop: -20, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  meta: { color: colors.muted, marginTop: 6, fontFamily: fonts.body, fontSize: 12.5 },
  priceTag: { alignItems: 'flex-end' },
  priceTagValue: { fontFamily: fonts.display, fontSize: 20, color: colors.skyBottom },
  priceTagUnit: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 20 },
  providerName: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  providerMeta: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  chatBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink, marginBottom: 10, marginTop: 4 },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 18 },
  priceGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  priceCell: { alignItems: 'center', flex: 1 },
  priceCellValue: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.ink },
  priceCellLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  featureText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.blueBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  featureChipText: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.skyBottom },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  reportLink: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.skyBottom },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.successBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.success },
  availabilityCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 18 },
  availabilityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  availabilityText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.hairline },
  metaRowLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted },
  metaRowValue: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.ink },
  pricingNote: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 8, lineHeight: 16 },
  reviewCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 12, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewName: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  reviewText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt, borderTopWidth: 1, borderTopColor: colors.hairline,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24,
  },
  footerLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  footerPrice: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink },
  footerUnit: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  cta: { backgroundColor: colors.skyBottom, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999 },
  ctaText: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 14 },
});
