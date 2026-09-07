// LexRidesZA — design tokens (mirrors the web prototype's design system)

export const colors = {
  // Sky gradient — onboarding / login / signup
  skyTop: '#7FD1F5',
  skyMid: '#3E8FE8',
  skyBottom: '#14459E',

  // App surface
  surface: '#F5F8FC',
  surfaceAlt: '#FFFFFF',
  ink: '#0E2340',
  inkSoft: '#4A5C78',
  muted: '#8593A8',
  hairline: 'rgba(14,35,64,0.08)',
  white: '#FFFFFF',
  danger: '#E65252',
  dangerBg: '#FDECEC',
  success: '#2FA85B',
  successBg: '#E1F5E6',
  warning: '#E08A2B',
  warningBg: '#FCEBD3',
  overlay: 'rgba(10,25,50,0.45)',

  // Dashboard action cards
  blueBg: '#DCEEFB', blueIcon: '#2F7FE0',
  greenBg: '#E1F5E6', greenIcon: '#2FA85B',
  amberBg: '#FCEBD3', amberIcon: '#E08A2B',
  pinkBg: '#F4E1EF', pinkIcon: '#A24FC7',
  cyanBg: '#DFF6F6', cyanIcon: '#1AA3A0',
  goldBg: '#FCF3D6', goldIcon: '#D6A017',
};

export const radius = {
  xl: 28,
  lg: 22,
  md: 16,
  sm: 12,
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
    shadowColor: '#0E2340',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  soft: {
    shadowColor: '#0E2340',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  floating: {
    shadowColor: '#061A3C',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
};
