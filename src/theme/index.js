// LexRidesZA — private mobility design system

export const colors = {
  // Champagne and midnight palette — onboarding / login / primary actions
  skyTop: '#E8D5B2',
  skyMid: '#B99254',
  skyBottom: '#17263D',

  // App surface
  surface: '#F4F0E8',
  surfaceAlt: '#FFFDF8',
  ink: '#142238',
  inkSoft: '#536174',
  muted: '#8C8D8A',
  hairline: 'rgba(20,34,56,0.11)',
  white: '#FFFFFF',
  danger: '#B85050',
  dangerBg: '#F7E8E4',
  success: '#477C62',
  successBg: '#E5EEE7',
  warning: '#B47A37',
  warningBg: '#F4E9D4',
  overlay: 'rgba(10,20,35,0.55)',

  // Dashboard action cards
  blueBg: '#E8E3D8', blueIcon: '#9B773E',
  greenBg: '#E5EEE7', greenIcon: '#477C62',
  amberBg: '#F4E9D4', amberIcon: '#B47A37',
  pinkBg: '#EEE4E3', pinkIcon: '#956866',
  cyanBg: '#E2ECEA', cyanIcon: '#477C73',
  goldBg: '#F2E4C6', goldIcon: '#A8792F',
};

export const radius = {
  xl: 32,
  lg: 24,
  md: 18,
  sm: 13,
  pill: 999,
};

export const fonts = {
  display: 'PlusJakartaSans_800ExtraBold',
  displaySemi: 'PlusJakartaSans_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
};

export const shadow = {
  card: {
    shadowColor: '#17263D',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#17263D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#17263D',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};
