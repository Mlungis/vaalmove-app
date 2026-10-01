import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function AuthSuccessOverlay({ notice }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.78)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!notice) {
      opacity.setValue(0);
      scale.setValue(0.78);
      checkScale.setValue(0);
      rotation.setValue(0);
      return undefined;
    }

    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 9,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(checkScale, {
          toValue: 1,
          speed: 16,
          bounciness: 12,
          useNativeDriver: true,
        }),
      ]),
    ]);
    const spin = Animated.timing(rotation, {
      toValue: 1,
      duration: 1900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    entrance.start();
    spin.start();

    const exit = Animated.sequence([
      Animated.delay(1720),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    exit.start();

    return () => {
      entrance.stop();
      spin.stop();
      exit.stop();
    };
  }, [notice?.key, opacity, scale, checkScale, rotation]);

  return (
    <Modal visible={Boolean(notice)} transparent animationType="none" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}>
          <LinearGradient
            colors={['#233E60', '#17263D', '#101D31']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.glow} />
            <Animated.View
              style={[
                styles.orbit,
                {
                  transform: [{
                    rotate: rotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.orbitDot} />
            </Animated.View>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                  <Ionicons name="checkmark" size={37} color="#FFFFFF" />
                </Animated.View>
              </View>
            </View>
            <Text style={styles.eyebrow}>LEXRIDESZA</Text>
            <Text style={styles.title}>{notice?.title}</Text>
            <Text style={styles.message}>{notice?.message}</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progress, {
                transform: [{
                  scaleX: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.08, 1],
                  }),
                }],
              }]} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(9, 18, 31, 0.48)',
  },
  cardWrap: { width: '100%', maxWidth: 360, borderRadius: radius.xl, overflow: 'hidden' },
  card: { minHeight: 300, alignItems: 'center', justifyContent: 'center', padding: 28, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    top: -120,
    backgroundColor: 'rgba(142,247,255,0.14)',
    borderRadius: 110,
  },
  orbit: {
    position: 'absolute',
    top: 42,
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(142,247,255,0.42)',
    alignItems: 'center',
  },
  orbitDot: { width: 8, height: 8, borderRadius: 4, marginTop: -4, backgroundColor: '#8EF7FF' },
  iconOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginTop: 4,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(142,247,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(142,247,255,0.42)',
  },
  iconInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.skyMid,
  },
  eyebrow: { color: '#8EF7FF', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 },
  title: { color: '#FFFFFF', fontFamily: fonts.display, fontSize: 23, marginTop: 8, textAlign: 'center' },
  message: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.body, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  progressTrack: { height: 3, width: '72%', marginTop: 24, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)' },
  progress: { flex: 1, backgroundColor: '#8EF7FF', transformOrigin: 'left' },
});
