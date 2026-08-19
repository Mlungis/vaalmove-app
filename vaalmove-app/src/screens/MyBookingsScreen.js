import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

import { useAppContext } from '../AppContext';

export default function MyBookingsScreen({ navigation }){
  const { bookings, getVehicleById } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
      <ScrollView contentContainerStyle={{padding:18}}>
        {bookings.map(b => {
          const vehicle = getVehicleById(b.vehicleId) || {};
          return (
            <View key={b.id} style={styles.card}>
              <View style={styles.icon} />
              <View style={{flex:1}}>
                <Text style={styles.itemTitle}>{vehicle.title || 'Vehicle'}</Text>
                <Text style={styles.itemDate}>{b.pickup ? `${b.pickup.split('T')[0]} - ${b.return.split('T')[0]}` : 'Upcoming'}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('BookingSummary', { id: b.vehicleId })}><Text style={{color: colors.skyBottom}}>View Details</Text></TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  header:{padding:18},
  title:{fontFamily: fonts.display, fontSize:18, color: colors.ink},
  card:{backgroundColor: colors.surfaceAlt, borderRadius: 12, padding:12, marginBottom:12, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor: colors.hairline},
  icon:{width:56, height:56, borderRadius:10, backgroundColor:'rgba(63,141,255,0.12)', marginRight:12},
  itemTitle:{fontFamily: fonts.bodySemi},
  itemDate:{color: colors.muted, marginTop:6}
});
