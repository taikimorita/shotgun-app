import { Stack } from 'expo-router';

import { SessionProvider } from '@/src/auth/SessionProvider';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </SessionProvider>
  );
}
