import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../AppContext';

export default function CheckAvailabilityScreen({ navigation, route }){
  const { getVehicleById } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding:18}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom:12}}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Check Availability</Text>
        <View style={styles.calendarPlaceholder} />

        <View style={styles.pickerRow}>
          <View style={styles.picker}><Text style={styles.pickerLabel}>Pickup Time</Text><Text style={styles.pickerValue}>08:00</Text></View>
          <View style={styles.picker}><Text style={styles.pickerLabel}>Return Time</Text><Text style={styles.pickerValue}>17:00</Text></View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>{vehicle.priceDaily ? `R${vehicle.priceDaily}` : 'R--'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BookingSummary', { id })}><Text style={styles.buttonText}>Book Now</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily: fonts.display, fontSize:18, color: colors.ink, marginBottom:12},
  calendarPlaceholder:{height:260, borderRadius:16, backgroundColor: colors.surfaceAlt, borderWidth:1, borderColor: colors.hairline},
  pickerRow:{flexDirection:'row', gap:12, marginTop:12},
  picker:{flex:1, backgroundColor: colors.surfaceAlt, padding:12, borderRadius:12, borderWidth:1, borderColor: colors.hairline, marginTop:12},
  pickerLabel:{color: colors.muted, fontFamily: fonts.body},
  pickerValue:{color: colors.ink, fontFamily: fonts.bodySemi, marginTop:6},
  totalRow:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:18, paddingHorizontal:4},
  totalLabel:{color: colors.muted, fontFamily: fonts.body},
  totalValue:{fontFamily: fonts.displaySemi, fontSize:20, color: colors.ink},
  button:{backgroundColor: colors.skyBottom, paddingVertical:14, borderRadius:999, marginTop:18, alignItems:'center'},
  buttonText:{color:'#fff', fontFamily:fonts.bodySemi}
});
