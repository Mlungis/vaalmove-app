import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

import { useAppContext } from '../AppContext';

export default function BookingSummaryScreen({ navigation, route }){
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding:18}}>
        <Text style={styles.title}>Booking Summary</Text>
        <View style={styles.card}>
          <View style={styles.hero} />
          <Text style={styles.itemTitle}>{vehicle.title || 'Vehicle'}</Text>
          <Text style={styles.itemMeta}>{vehicle.year ? `${vehicle.year} · ${vehicle.fuel} · ${vehicle.transmission}` : ''}</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.row}><Text style={styles.label}>Pickup</Text><Text style={styles.value}>Sat, 24 May 2025 · 08:00</Text></View>
          <View style={styles.row}><Text style={styles.label}>Return</Text><Text style={styles.value}>Sun, 25 May 2025 · 17:00</Text></View>
          <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>Vereeniging, Gauteng</Text></View>
        </View>

        <View style={styles.feesCard}>
          <View style={styles.row}><Text>1 Day Rental</Text><Text>{vehicle.priceDaily ? `R${vehicle.priceDaily}` : 'R--'}</Text></View>
          <View style={styles.row}><Text>Insurance</Text><Text>R100</Text></View>
          <View style={styles.row}><Text>Service Fee</Text><Text>R50</Text></View>
          <View style={[styles.row,{marginTop:8}]}><Text style={{fontFamily:fonts.bodySemi}}>Total</Text><Text style={{color:colors.skyBottom,fontFamily:fonts.bodySemi}}>{vehicle.priceDaily ? `R${vehicle.priceDaily + 150}` : 'R--'}</Text></View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Payment', { id })}><Text style={styles.ctaText}>Proceed to Payment</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily: fonts.display, fontSize:18, color: colors.ink, marginBottom:12},
  card:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius: radius.md, borderWidth:1, borderColor: colors.hairline},
  hero:{height:80, backgroundColor:'rgba(63,141,255,0.12)', borderRadius:10},
  itemTitle:{fontFamily: fonts.bodySemi, marginTop:8},
  itemMeta:{color: colors.muted, marginTop:4, fontSize:12},
  detailCard:{backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding:12, marginTop:12, borderWidth:1, borderColor: colors.hairline},
  row:{flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor: colors.hairline},
  label:{color: colors.muted},
  value:{color: colors.ink, fontFamily: fonts.bodySemi},
  feesCard:{backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding:12, marginTop:12, borderWidth:1, borderColor: colors.hairline},
  cta:{backgroundColor: colors.skyBottom, paddingVertical:14, borderRadius:999, marginTop:18, alignItems:'center'},
  ctaText:{color:'#fff', fontFamily: fonts.bodySemi}
});
