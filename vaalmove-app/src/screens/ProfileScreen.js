import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen(){
  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding:18}}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={{marginLeft:12}}>
            <Text style={{fontFamily:fonts.bodySemi}}>Lesedi Moraba</Text>
            <Text style={{color:colors.muted}}>lesedi@example.com</Text>
          </View>
        </View>

        <View style={{height:12}} />
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}><Ionicons name="person-outline" size={18} color={colors.skyBottom} /><Text style={styles.menuText}>Personal Information</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}><Ionicons name="card-outline" size={18} color={colors.skyBottom} /><Text style={styles.menuText}>Payment Methods</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}><Ionicons name="location-outline" size={18} color={colors.skyBottom} /><Text style={styles.menuText}>Saved Locations</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}><Ionicons name="notifications-outline" size={18} color={colors.skyBottom} /><Text style={styles.menuText}>Notifications</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem,{borderBottomWidth:0}]}><Ionicons name="settings-outline" size={18} color={colors.skyBottom} /><Text style={styles.menuText}>Settings</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logout}><Text style={{color:'#E65252', fontFamily:fonts.bodySemi}}>Logout</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor: colors.surface},
  title:{fontFamily:fonts.display, fontSize:20, color: colors.ink},
  profileCard:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius:12, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor: colors.hairline},
  avatar:{width:56, height:56, borderRadius:28, backgroundColor:'rgba(63,141,255,0.12)'},
  menuCard:{backgroundColor: colors.surfaceAlt, marginTop:12, borderRadius:12, padding:6, borderWidth:1, borderColor: colors.hairline},
  menuItem:{flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor: colors.hairline, paddingHorizontal:8},
  menuText:{fontFamily: fonts.bodySemi, marginLeft:4},
  logout:{backgroundColor: colors.surfaceAlt, padding:12, borderRadius:12, marginTop:18, alignItems:'center', borderWidth:1, borderColor: colors.hairline}
});
