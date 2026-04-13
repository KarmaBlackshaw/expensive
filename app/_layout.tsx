import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ExpenseProvider } from '@/context/expense-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ExpenseProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="add-category" />
          <Stack.Screen name="edit-category" />
          <Stack.Screen name="add-transaction" />
          <Stack.Screen name="edit-transaction" />
          <Stack.Screen name="add-planned-expense" />
          <Stack.Screen name="edit-planned-expense" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ExpenseProvider>
  );
}
