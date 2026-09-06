import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/src/components';
import { supabase } from '@/src/lib/supabase';
import { colors, semanticColors } from '@/src/theme/tokens';

type SubmitAction = 'magicLink' | 'demo' | null;

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [submittingAction, setSubmittingAction] = useState<SubmitAction>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'neutral' | 'error'>('neutral');

  function setFeedback(message: string, tone: 'neutral' | 'error' = 'neutral') {
    setStatusMessage(message);
    setStatusTone(tone);
  }

  function normalizeError(error: unknown) {
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  }

  async function requestMagicLink() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFeedback('Enter your school email to continue.', 'error');
      return;
    }

    setSubmittingAction('magicLink');
    setFeedback('Sending sign-in link...');

    try {
      const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail });

      if (error) {
        setFeedback(normalizeError(error), 'error');
        return;
      }

      setFeedback('Check your email for the sign-in link.');
    } catch (error) {
      setFeedback(normalizeError(error), 'error');
    } finally {
      setSubmittingAction(null);
    }
  }

  async function continueAsMayaDemo() {
    setSubmittingAction('demo');
    setFeedback('Signing in as Maya...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'maya.demo@calpoly.edu',
        password: 'ShotgunDemo!',
      });

      if (error) {
        const setupMessage =
          error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')
            ? 'Demo sign-in is not set up yet. The hosted Supabase project needs maya.demo@calpoly.edu with the documented password.'
            : normalizeError(error);
        setFeedback(setupMessage, 'error');
        return;
      }

      if (!data.session) {
        setFeedback('Demo sign-in did not create a session. Check the hosted Supabase auth setup.', 'error');
        return;
      }

      setFeedback('Signed in as Maya. Loading the app...');
    } catch (error) {
      setFeedback(normalizeError(error), 'error');
    } finally {
      setSubmittingAction(null);
    }
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
            <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '600' }}>Sign in with your school email</Text>
            <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@calpoly.edu" value={email} />
            <Button disabled={submittingAction !== null && submittingAction !== 'magicLink'} loading={submittingAction === 'magicLink'} onPress={requestMagicLink}>
              Send sign-in link
            </Button>
            {__DEV__ ? (
              <Button disabled={submittingAction !== null && submittingAction !== 'demo'} loading={submittingAction === 'demo'} onPress={continueAsMayaDemo} variant="secondary">
                Continue as Maya (demo)
              </Button>
            ) : null}
            {statusMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole={statusTone === 'error' ? 'alert' : 'text'}
                style={{
                  color: statusTone === 'error' ? semanticColors.status.dangerForeground : colors.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {statusMessage}
              </Text>
            ) : null}
            {__DEV__ ? (
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                Demo sign-in uses the fictional hosted account documented in the auth setup and creates a real Supabase session.
              </Text>
            ) : null}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
