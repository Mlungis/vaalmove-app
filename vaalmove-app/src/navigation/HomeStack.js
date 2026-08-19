import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SearchFilterScreen from '../screens/SearchFilterScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import CheckAvailabilityScreen from '../screens/CheckAvailabilityScreen';
import BookingSummaryScreen from '../screens/BookingSummaryScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingConfirmedScreen from '../screens/BookingConfirmedScreen';
import PostJobScreen from '../screens/PostJobScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="CheckAvailability" component={CheckAvailabilityScreen} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
    </Stack.Navigator>
  );
}
