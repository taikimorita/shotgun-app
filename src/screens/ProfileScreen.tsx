import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/src/auth/SessionProvider';
import { colors, componentTokens, radii, semanticColors, spacing, typography } from '@/src/theme/tokens';

export function ProfileScreen() {
  const { session, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const email = session?.user.email ?? 'Signed-in student';
  const isSchoolEmail = email.toLowerCase().endsWith('@calpoly.edu');
  const isVerified = isSchoolEmail && Boolean(session?.user.email_confirmed_at);
  const displayName =
    session?.user.user_metadata.full_name ??
    session?.user.user_metadata.name ??
    (isSchoolEmail ? email.split('@')[0] : 'Cal Poly student');

  async function handleSignOut() {
    setErrorMessage('');
    setIsSigningOut(true);

    try {
      await signOut();
    } catch {
      setErrorMessage('We couldn’t sign you out. Check your connection and try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACCOUNT</Text>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Your Shotgun identity and trust details.</Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatar} accessibilityLabel="Profile avatar" accessibilityRole="image">
            <Text style={styles.avatarText}>{email.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityName}>{displayName}</Text>
            <Text selectable style={styles.email}>
              {email}
            </Text>
          </View>
        </View>

        <View style={[styles.statusCard, !isVerified && styles.statusCardPending]}>
          <View style={[styles.statusIcon, !isVerified && styles.statusIconPending]}>
            <Text style={styles.statusIconText}>{isVerified ? '✓' : '!'}</Text>
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, !isVerified && styles.statusTitlePending]}>{isVerified ? 'School email verified' : 'School email status'}</Text>
            <Text style={styles.statusBody}>
              {isVerified ? 'Your confirmed Cal Poly email helps the community ride with confidence.' : 'Confirm a Cal Poly email to complete verification.'}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityLabel="Sign out of Shotgun"
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutButton, (pressed || isSigningOut) && styles.buttonMuted]}
        >
          {isSigningOut ? <ActivityIndicator color={semanticColors.action.primaryForeground} /> : <Text style={styles.signOutText}>Sign out</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: semanticColors.app.background, flex: 1 },
  page: { flex: 1, gap: spacing[5], padding: spacing[5] },
  header: { gap: spacing[1] },
  eyebrow: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: semanticColors.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.heavy },
  subtitle: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 21 },
  identityCard: { alignItems: 'center', backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: componentTokens.card.radius, borderWidth: componentTokens.card.borderWidth, flexDirection: 'row', gap: spacing[4], padding: componentTokens.card.padding },
  avatar: { alignItems: 'center', backgroundColor: colors.steelSoft, borderRadius: radii.pill, height: 64, justifyContent: 'center', width: 64 },
  avatarText: { color: semanticColors.text.primary, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy },
  identityCopy: { flex: 1, gap: spacing[1] },
  identityName: { color: semanticColors.text.primary, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  email: { color: semanticColors.text.secondary, fontSize: typography.fontSize.sm },
  statusCard: { alignItems: 'flex-start', backgroundColor: semanticColors.status.successBackground, borderColor: colors.success, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing[3], padding: componentTokens.card.padding },
  statusCardPending: { backgroundColor: semanticColors.status.warningBackground, borderColor: colors.warning },
  statusIcon: { alignItems: 'center', backgroundColor: colors.success, borderRadius: radii.pill, height: 28, justifyContent: 'center', width: 28 },
  statusIconPending: { backgroundColor: colors.warning },
  statusIconText: { color: colors.white, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  statusCopy: { flex: 1, gap: spacing[1] },
  statusTitle: { color: semanticColors.status.successForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  statusTitlePending: { color: semanticColors.status.warningForeground },
  statusBody: { color: semanticColors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 21 },
  errorText: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 21 },
  signOutButton: { alignItems: 'center', backgroundColor: semanticColors.action.primaryBackground, borderRadius: componentTokens.button.radius, justifyContent: 'center', minHeight: componentTokens.button.height, paddingHorizontal: componentTokens.button.horizontalPadding },
  signOutText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  buttonMuted: { opacity: 0.6 },
});
