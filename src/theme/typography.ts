import { Platform } from 'react-native';

export const typography = {
  fonts: Platform.select({
    ios: {
      sans: 'System',
      serif: 'Georgia',
      rounded: 'System',
      mono: 'Courier',
    },
    android: {
      sans: 'sans-serif',
      serif: 'serif',
      rounded: 'sans-serif-condensed',
      mono: 'monospace',
    },
    default: {
      sans: 'System',
      serif: 'System',
      rounded: 'System',
      mono: 'System',
    },
  }),
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    xs: 14,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 26,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '900',
  } as const,
};
