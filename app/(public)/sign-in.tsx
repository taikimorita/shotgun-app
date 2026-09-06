import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/src/lib/supabase';
import { colors, radii, semanticColors, spacing, typography } from '@/src/theme/tokens';

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

  const magicLinkSubmitting = submittingAction === 'magicLink';
  const demoSubmitting = submittingAction === 'demo';

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.phone}>
          <View style={styles.hero}>
            <Image
              accessibilityLabel="Shotgun student rideshare illustration"
              accessible={false}
              importantForAccessibility="no"
              resizeMode="cover"
              source={require('../../Images/CoverGif.gif')}
              style={styles.heroArt}
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Sign in to ride.</Text>
            <Text style={styles.formSubtitle}>Use your university email to continue.</Text>

            <Text style={styles.label}>UNIVERSITY EMAIL</Text>
            <TextInput
              accessibilityLabel="University email"
              autoCapitalize="none"
              autoComplete="email"
              editable={!submittingAction}
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={requestMagicLink}
              placeholder="you@university.edu"
              placeholderTextColor={colors.textMuted}
              returnKeyType="send"
              style={styles.input}
              value={email}
            />

            <Pressable
              accessibilityLabel="Continue with school email"
              accessibilityRole="button"
              accessibilityState={{ disabled: submittingAction !== null, busy: magicLinkSubmitting }}
              disabled={submittingAction !== null}
              onPress={requestMagicLink}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || submittingAction !== null) && styles.buttonMuted,
              ]}
            >
              {magicLinkSubmitting ? (
                <ActivityIndicator color={semanticColors.action.accentForeground} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </Pressable>

            {__DEV__ ? (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: submittingAction !== null, busy: demoSubmitting }}
                disabled={submittingAction !== null}
                onPress={continueAsMayaDemo}
                style={({ pressed }) => [styles.demoButton, pressed && styles.buttonMuted]}
              >
                {demoSubmitting ? (
                  <ActivityIndicator color={semanticColors.action.secondaryForeground} />
                ) : (
                  <Text style={styles.demoButtonText}>Continue as Maya (demo)</Text>
                )}
              </Pressable>
            ) : null}

            {statusMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole={statusTone === 'error' ? 'alert' : 'text'}
                style={[styles.statusMessage, statusTone === 'error' && styles.errorMessage]}
              >
                {statusMessage}
              </Text>
            ) : null}

            {__DEV__ ? (
              <Text style={styles.demoNote}>
                Demo sign-in uses the fictional hosted account documented in the auth setup and creates a real Supabase session.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.steel,
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: spacing[4],
  },
  phone: {
    backgroundColor: colors.steel,
    maxWidth: 492,
    overflow: 'hidden',
    width: '100%',
  },
  hero: {
    backgroundColor: colors.steel,
    height: 390,
    overflow: 'hidden',
    position: 'relative',
  },
  heroArt: {
    height: '100%',
    width: '100%',
  },
  form: {
    backgroundColor: colors.steel,
    gap: spacing[2],
    paddingBottom: spacing[5],
    paddingHorizontal: spacing[8],
    paddingTop: spacing[4],
  },
  formTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  formSubtitle: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    lineHeight: 23,
    marginBottom: spacing[2],
  },
  label: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 1.4,
    lineHeight: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    color: colors.ink,
    fontSize: typography.fontSize.md,
    minHeight: 56,
    paddingHorizontal: spacing[4],
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: semanticColors.action.accentBackground,
    borderRadius: radii.md,
    justifyContent: 'center',
    marginTop: spacing[2],
    minHeight: 58,
  },
  primaryButtonText: {
    color: semanticColors.action.accentForeground,
    fontSize: 19,
    fontWeight: typography.fontWeight.heavy,
  },
  demoButton: {
    alignItems: 'center',
    backgroundColor: semanticColors.action.secondaryBackground,
    borderColor: semanticColors.action.secondaryBorder,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  demoButtonText: {
    color: semanticColors.action.secondaryForeground,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  buttonMuted: {
    opacity: 0.58,
  },
  statusMessage: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginTop: spacing[1],
  },
  errorMessage: {
    backgroundColor: semanticColors.status.dangerBackground,
    borderRadius: radii.sm,
    color: semanticColors.status.dangerForeground,
    padding: spacing[3],
  },
  demoNote: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
    marginTop: spacing[1],
  },
});
