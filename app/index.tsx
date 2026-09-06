import { Redirect, type Href } from 'expo-router';

import { LoadingState } from '@/src/components';
import { useSession } from '@/src/auth/SessionProvider';

export default function IndexRoute() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingState label="Restoring session" />;
  }

  const destination = session ? ('/(app)/(tabs)' as Href) : '/(public)/sign-in';
  return <Redirect href={destination} />;
}
