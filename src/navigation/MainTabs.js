import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import HomeStack from './HomeStack';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import VehicleTrackingScreen from '../screens/VehicleTrackingScreen';
import { colors, fonts } from '../theme';
import { useAppContext } from '../AppContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home-outline',
  Bookings: 'bookmark-outline',
  Track: 'navigate-outline',
  Messages: 'chatbubble-outline',
  Profile: 'person-outline',
};

function TabIcon({ name, color, size, badge }) {
  return (
    <View>
      <Ionicons name={ICONS[name]} size={size ?? 22} color={color} />
      {badge ? (
        <View style={styles.dot}>
          <Text style={styles.dotText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MainTabs() {
  const { unreadMessages } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.skyBottom,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopColor: colors.hairline,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => (
          <TabIcon
            name={route.name}
            color={color}
            size={size}
            badge={route.name === 'Messages' ? unreadMessages : 0}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Track" component={VehicleTrackingScreen} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#E65252',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dotText: { color: '#fff', fontSize: 9, fontFamily: fonts.bodySemi },
});
