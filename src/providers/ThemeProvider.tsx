import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useThemeStore } from '../store/themeStore';
import { paperLightTheme, paperDarkTheme } from '../theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();

  // Resolve active theme: system or manual toggle
  const resolvedTheme = theme === 'system' ? systemColorScheme : theme;
  const activePaperTheme = resolvedTheme === 'dark' ? paperDarkTheme : paperLightTheme;

  return <PaperProvider theme={activePaperTheme}>{children}</PaperProvider>;
}
