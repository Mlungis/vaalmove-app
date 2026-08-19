import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

import { useAppContext } from '../AppContext';

export default function PaymentScreen({ navigation, route }){
  const { getVehicleById, addBooking } = useAppContext();
  const id = route?.params?.id;
  const vehicle = getVehicleById(id) || {};
  const total = vehicle.priceDaily ? vehicle.priceDaily + 150 : 1000;

  function handlePay() {
    // simple mock booking creation
    addBooking({ vehicleId: id, pickup: '2025-05-24T08:00', return: '2025-05-25T17:00', total });
    navigation.navigate('BookingConfirmed', { id });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding:18}}>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.amountCard}><Text style={styles.amount}>{`R${total}`}</Text></View>

        <View style={styles.methodsCard}>
          <View style={styles.method}><Text style={styles.methodLabel}>Card</Text><Text style={styles.methodMeta}>Visa / Mastercard</Text></View>
          <View style={styles.method}><Text style={styles.methodLabel}>Instant EFT</Text><Text style={styles.methodMeta}>Bank EFT transfer</Text></View>
          <View style={styles.method}><Text style={styles.methodLabel}>Bank Transfer</Text><Text style={styles.methodMeta}>Manual transfer</Text></View>
          <View style={styles.method}><Text style={styles.methodLabel}>Wallet Balance</Text><Text style={styles.methodMeta}>R501 available</Text></View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={handlePay}><Text style={styles.ctaText}>Pay Now</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily: fonts.display, fontSize:18, color: colors.ink},
  amountCard:{backgroundColor: colors.surfaceAlt, padding:18, borderRadius: radius.md, marginTop:12, borderWidth:1, borderColor: colors.hairline},
  amount:{fontFamily: fonts.displaySemi, fontSize:24, color: colors.ink},
  methodsCard:{marginTop:18, backgroundColor: colors.surfaceAlt, padding:12, borderRadius: radius.md, borderWidth:1, borderColor: colors.hairline},
  method:{paddingVertical:12, borderBottomWidth:1, borderBottomColor: colors.hairline},
  methodLabel:{fontFamily: fonts.bodySemi},
  methodMeta:{color: colors.muted, marginTop:6},
  cta:{backgroundColor: colors.skyBottom, paddingVertical:14, borderRadius:999, marginTop:18, alignItems:'center'},
  ctaText:{color:'#fff', fontFamily: fonts.bodySemi}
});
