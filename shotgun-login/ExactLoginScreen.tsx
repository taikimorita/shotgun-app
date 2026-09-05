import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';

type Props = {
  onSignIn?: (credentials: { email: string; password: string }) => void;
  onForgotPassword?: (email: string) => void;
};

/** Uses the supplied Shotgun reference art unchanged for the branded hero. */
export default function ExactLoginScreen({ onSignIn, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const canSubmit = email.trim().length > 0 && password.length > 0;

  function signIn() {
    if (!canSubmit) return;
    onSignIn?.({ email: email.trim(), password });
    setMessage('Ready to sign in.');
  }

  function forgotPassword() {
    onForgotPassword?.(email.trim());
    setMessage(email.trim() ? `Reset link requested for ${email.trim()}.` : 'Enter your university email to reset your password.');
  }

  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.phone}><View style={styles.hero}><Image accessibilityLabel="Shotgun student rideshare illustration" resizeMode="contain" source={require('./login-reference.png')} style={styles.referenceArt} /></View><View style={styles.form}><Text style={styles.formTitle}>Sign in to ride.</Text><Text style={styles.formSubtitle}>Use your university email to continue.</Text><Text style={styles.label}>UNIVERSITY EMAIL</Text><TextInput accessibilityLabel="University email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@university.edu" placeholderTextColor={colors.textMuted} returnKeyType="next" style={styles.input} value={email} /><View style={styles.passwordHeader}><Text style={styles.label}>PASSWORD</Text><Pressable accessibilityRole="button" onPress={forgotPassword} hitSlop={8}><Text style={styles.forgot}>Forgot password?</Text></Pressable></View><TextInput accessibilityLabel="Password" autoComplete="password" onChangeText={setPassword} placeholder="Create or enter password" placeholderTextColor={colors.textMuted} secureTextEntry returnKeyType="go" onSubmitEditing={signIn} style={styles.input} value={password} /><Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmit }} disabled={!canSubmit} onPress={signIn} style={({ pressed }) => [styles.button, (!canSubmit || pressed) && styles.buttonMuted]}><Text style={styles.buttonText}>Continue</Text></Pressable>{message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}</View></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[5] },
  phone: { width: '100%', maxWidth: 492, overflow: 'hidden', backgroundColor: '#4F7EA8' },
  hero: { height: 470, overflow: 'hidden' },
  referenceArt: { width: '100%', aspectRatio: 492 / 909, position: 'absolute', top: 0 },
  form: { gap: 10, backgroundColor: '#4F7EA8', paddingHorizontal: 36, paddingBottom: 42, paddingTop: 22 },
  formTitle: { color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  formSubtitle: { color: colors.steelSoft, fontSize: 16, lineHeight: 23, marginBottom: 14 },
  label: { color: colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  input: { minHeight: 56, borderRadius: radii.md, backgroundColor: colors.white, color: colors.ink, fontSize: 16, paddingHorizontal: spacing[4] },
  passwordHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  forgot: { color: colors.white, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  button: { minHeight: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.peach, marginTop: 12 },
  buttonMuted: { opacity: 0.58 }, buttonText: { color: colors.navy, fontSize: 19, fontWeight: '800' },
  message: { color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 3 },
});
