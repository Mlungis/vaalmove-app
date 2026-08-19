import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

export default function PostJobScreen({ navigation }){
  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding:18}}>
        <Text style={styles.title}>Post a Job</Text>
        <Text style={styles.subtitle}>Tell us what transport you need</Text>

        <View style={styles.input}><Text style={{color:colors.muted}}>Job Type</Text><Text style={{marginTop:8}}>Staff Transport</Text></View>
        <View style={[styles.input,{height:100}]}><Text style={{color:colors.muted}}>Description</Text><Text style={{marginTop:8,color:colors.muted}}>Need a 15 seater quantum...</Text></View>

        <View style={{height:16}} />
        <TouchableOpacity style={styles.cta} onPress={() => navigation.getParent?.().navigate('Bookings')}><Text style={styles.ctaText}>Post Job</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily: fonts.display, fontSize:18, color: colors.ink},
  subtitle:{color: colors.muted, marginTop:6},
  input:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius: 12, borderWidth:1, borderColor: colors.hairline, marginTop:12},
  cta:{backgroundColor: colors.skyBottom, paddingVertical:14, borderRadius:999, marginTop:18, alignItems:'center'},
  ctaText:{color:'#fff', fontFamily: fonts.bodySemi}
});
