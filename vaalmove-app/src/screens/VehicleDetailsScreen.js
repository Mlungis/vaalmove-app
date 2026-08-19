import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../AppContext';

export default function VehicleDetailsScreen({ navigation, route }) {
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={20} color={colors.ink} /></TouchableOpacity>
        <View style={styles.hero} />
        <Text style={styles.title}>{vehicle.title || 'Vehicle'}</Text>
        <Text style={styles.meta}>{vehicle.year ? `${vehicle.year} · ${vehicle.fuel} · ${vehicle.transmission}${vehicle.drivetrain ? ' · ' + vehicle.drivetrain : ''}` : ''}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pricing</Text>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:12}}>
            <Text style={styles.price}>{vehicle.priceDaily ? `R${vehicle.priceDaily}` : 'R--'}</Text>
            <Text style={styles.price}>R4,500</Text>
            <Text style={styles.price}>R15,000</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Includes</Text>
          <Text style={{marginTop:8, color: colors.muted}}>Insurance · Roadside Assist · 150km/day</Text>
        </View>

        <View style={{height: 24}} />
        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => navigation.navigate('CheckAvailability', { id })}><Text style={styles.ctaText}>Check Availability</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  back:{width:36, height:36, borderRadius:18, backgroundColor: colors.surfaceAlt, alignItems:'center', justifyContent:'center'},
  hero:{height:150, borderRadius:14, backgroundColor:'rgba(63,141,255,0.12)', marginTop:12},
  title:{fontFamily: fonts.bodySemi, fontSize:18, color: colors.ink, marginTop:12},
  meta:{color: colors.muted, marginTop:6},
  infoCard:{backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding:12, marginTop:12, borderWidth:1, borderColor: colors.hairline},
  infoTitle:{fontFamily: fonts.bodySemi, color: colors.muted, fontSize:12},
  price:{fontFamily: fonts.bodySemi, color: colors.skyBottom},
  cta:{backgroundColor: colors.skyBottom, paddingVertical:14, borderRadius:999, marginTop:18, alignItems:'center'},
  ctaText:{color: '#fff', fontFamily: fonts.bodySemi}
});
