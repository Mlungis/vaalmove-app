import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabs from './MainTabs';
import { useAppContext } from '../AppContext';
import LoadingState from '../components/LoadingState';

const Stack = createNativeStackNavigator();

function BackButton({ navigation }) {
  if (!navigation || !navigation.canGoBack()) return null;

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
      <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

export default function RootNavigator() {
  const { session, authLoading } = useAppContext();

  if (authLoading) {
    return <LoadingState label="Securing your private mobility experience..." />;
  }

  return (
    <Stack.Navigator
      key={session ? 'authenticated' : 'guest'}
      initialRouteName={session ? 'Main' : 'Onboarding'}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerBackVisible: false,
        headerLeft: () => <BackButton navigation={navigation} />,
        headerStyle: { backgroundColor: 'transparent' },
      })}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
});
