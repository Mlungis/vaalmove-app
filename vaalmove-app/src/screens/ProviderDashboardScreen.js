import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

export default function ProviderDashboardScreen(){
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding:18}}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.banner}><Text style={{color:'#fff', fontFamily:fonts.bodySemi}}>Welcome back, Vaal Bakkies</Text></View>

        <View style={styles.gridRow}>
          <View style={styles.stat}><Text style={{fontFamily:fonts.bodySemi}}>23</Text><Text style={{color:colors.muted}}>Bookings</Text></View>
          <View style={styles.stat}><Text style={{fontFamily:fonts.bodySemi}}>R28,450</Text><Text style={{color:colors.muted}}>Earnings</Text></View>
          <View style={styles.stat}><Text style={{fontFamily:fonts.bodySemi}}>348</Text><Text style={{color:colors.muted}}>Views</Text></View>
        </View>

        <Text style={{marginTop:14, fontFamily:fonts.bodySemi}}>Recent Bookings</Text>
        <View style={{height:12}} />
        <View style={styles.booking}><Text>Toyota Hilux 2.8 GD6</Text><Text style={{color:colors.muted}}>24 May 2025</Text></View>
        <View style={styles.booking}><Text>Ford Ranger 2.2</Text><Text style={{color:colors.muted}}>26 May 2025</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily:fonts.display, fontSize:22, color: colors.ink},
  banner:{backgroundColor: colors.skyBottom, padding:14, borderRadius:12, marginTop:12},
  gridRow:{flexDirection:'row', justifyContent:'space-between', marginTop:12},
  stat:{backgroundColor: colors.surfaceAlt, flex:1, marginRight:8, padding:12, borderRadius:12, borderWidth:1, borderColor: colors.hairline},
  booking:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius:12, borderWidth:1, borderColor: colors.hairline, marginTop:8}
});
