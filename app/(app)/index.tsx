import { Text, View } from 'react-native';

import { Avatar, Badge, Button, Card, Screen, StatusPill } from '@/src/components';
import { useSession } from '@/src/auth/SessionProvider';

export default function HomeScreen() {
  const { session, signOut } = useSession();
  const email = session?.user.email ?? 'student';
  const initials = email.slice(0, 1);

  return (
    <Screen>
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar label={initials} />
            <View>
              <Text style={{ color: '#667085', fontSize: 13 }}>Signed in as</Text>
              <Text style={{ color: '#17202a', fontSize: 15, fontWeight: '600' }}>{email}</Text>
            </View>
          </View>
          <Badge>School email</Badge>
        </View>
        <View style={{ gap: 8 }}>
          <Text style={{ color: '#17202a', fontSize: 30, fontWeight: '700' }}>Find your next ride</Text>
          <Text style={{ color: '#667085', fontSize: 16, lineHeight: 24 }}>Browse scheduled rides from verified students.</Text>
        </View>
        <Card>
          <View style={{ gap: 12 }}>
            <StatusPill tone="neutral">Discovery coming next</StatusPill>
            <Text style={{ color: '#17202a', fontSize: 18, fontWeight: '600' }}>Your ride feed is ready for the rides team.</Text>
            <Text style={{ color: '#667085', lineHeight: 22 }}>The authenticated route is protected by the restored Supabase session.</Text>
          </View>
        </Card>
        <Button onPress={signOut} variant="secondary">Sign out</Button>
      </View>
    </Screen>
  );
}
