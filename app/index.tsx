import { Redirect } from 'expo-router';

import { LoadingState } from '@/src/components';
import { useSession } from '@/src/auth/SessionProvider';

export default function IndexRoute() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingState label="Restoring session" />;
  }

  return <Redirect href={session ? '/(app)' : '/(public)/sign-in'} />;
}
