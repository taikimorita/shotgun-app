import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/src/components';
import { useSession } from '@/src/auth/SessionProvider';

export default function AuthenticatedLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingState label="Restoring session" />;
  }

  if (!session) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="rides/[rideId]" />
    </Stack>
  );
}
