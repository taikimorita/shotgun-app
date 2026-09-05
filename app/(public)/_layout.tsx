import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/src/components';
import { useSession } from '@/src/auth/SessionProvider';

export default function PublicLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingState label="Restoring session" />;
  }

  if (session) {
    return <Redirect href="/(app)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
