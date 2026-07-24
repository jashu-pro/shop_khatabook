import { Platform } from 'react-native';

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  gutter: 16,
  bottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
  maxContentWidth: 800,
};
