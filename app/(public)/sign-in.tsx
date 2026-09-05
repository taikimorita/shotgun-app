import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/src/components';
import { supabase } from '@/src/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestMagicLink() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert('Email required', 'Enter your school email to continue.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Unable to sign in', error.message);
      return;
    }

    Alert.alert('Check your email', 'Use the sign-in link sent to your school email.');
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: '#17202a', fontSize: 32, fontWeight: '700' }}>Shotgun</Text>
          <Text style={{ color: '#667085', fontSize: 16, lineHeight: 24 }}>Find a trusted ride with your campus community.</Text>
        </View>
        <Card>
          <View style={{ gap: 14 }}>
            <Text style={{ color: '#17202a', fontSize: 18, fontWeight: '600' }}>Sign in with your school email</Text>
            <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@calpoly.edu" value={email} />
            <Button loading={isSubmitting} onPress={requestMagicLink}>Send sign-in link</Button>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
