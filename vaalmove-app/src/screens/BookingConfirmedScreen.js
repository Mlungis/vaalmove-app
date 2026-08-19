import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

import { useAppContext } from '../AppContext';

export default function BookingConfirmedScreen({ navigation, route }){
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={{alignItems:'center', paddingTop:60}}>
        <View style={styles.tick} />
        <Text style={styles.title}>Your booking is confirmed!</Text>
        <Text style={styles.sub}>Booking ID: VM2505247846</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.cardMeta}>24 May – 25 May 2025</Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => navigation.getParent?.().navigate('Bookings')}><Text style={styles.ctaText}>View Booking</Text></TouchableOpacity>

        <TouchableOpacity style={{marginTop:14}} onPress={() => navigation.getParent?.().navigate('Home')}><Text style={{color:colors.muted}}>Back to Home</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  tick:{width:120,height:120,borderRadius:60,backgroundColor:'#2FA85B',marginBottom:20},
  title:{fontFamily:fonts.bodySemi, fontSize:18, color: colors.ink, marginTop:12},
  sub:{color: colors.muted, marginTop:6},
  card:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius:12, marginTop:18, borderWidth:1, borderColor: colors.hairline},
  cardTitle:{fontFamily: fonts.bodySemi},
  cardMeta:{color: colors.muted, marginTop:4},
  cta:{backgroundColor: colors.skyBottom, paddingVertical:12, borderRadius:999, marginTop:18, alignItems:'center'},
  ctaText:{color:'#fff', fontFamily: fonts.bodySemi}
});
