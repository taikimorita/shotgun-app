import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';

type Props = { onContinue?: (email: string) => void };

/** Interactive implementation of the leftmost login design. */
export default function LoginScreen({ onContinue }: Props) {
  const [email, setEmail] = useState('');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function continueWithEmail() {
    if (!validEmail) {
      Alert.alert('Enter your university email', 'Use the email address provided by your school.');
      return;
    }
    onContinue?.(email);
    Alert.alert('Verification email sent', `We sent a sign-in link to ${email}.`);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.sky} pointerEvents="none"><Text style={styles.cloud}>☁︎     ☁︎</Text><Text style={styles.campus}>▥    ♜    ▥</Text></View>
      <View style={styles.content}>
        <Text accessibilityRole="image" style={styles.logo}>🎓 🚗</Text>
        <Text style={styles.brand}>SH<Text style={styles.brandAccent}>O</Text>TGUN</Text>
        <View style={styles.road}><Text style={styles.car}>🚙</Text></View>
        <View style={styles.copy}><Text style={styles.title}>Ride with students.</Text><Text style={styles.subtitle}>Verified rideshare for your university.</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>UNIVERSITY EMAIL</Text>
          <View style={[styles.inputWrap, email.length > 0 && !validEmail && styles.inputError]}><Text style={styles.mail}>✉</Text><TextInput accessibilityLabel="University email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@university.edu" placeholderTextColor={colors.textMuted} returnKeyType="go" value={email} onSubmitEditing={continueWithEmail} style={styles.input} /></View>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !validEmail }} disabled={!validEmail} onPress={continueWithEmail} style={({ pressed }) => [styles.button, (!validEmail || pressed) && styles.buttonMuted]}><Text style={styles.buttonText}>Continue</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#5F8FBE' },
  sky: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 140, opacity: 0.22 },
  cloud: { color: colors.white, fontSize: 50, letterSpacing: 22 },
  campus: { color: colors.white, fontSize: 86, letterSpacing: 24 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing[6], paddingBottom: spacing[8] },
  logo: { color: colors.white, fontSize: 34, marginTop: spacing[8], textAlign: 'left' },
  brand: { color: colors.white, fontSize: 40, fontWeight: '900', letterSpacing: 1, marginTop: -68, textAlign: 'center' },
  brandAccent: { color: colors.peach },
  road: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: '115%', height: 210, backgroundColor: '#4F7EA855', borderTopLeftRadius: 120, borderTopRightRadius: 120, marginTop: -80 },
  car: { fontSize: 84 },
  copy: { gap: 8, marginTop: -38 },
  title: { color: colors.white, fontSize: 33, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.white, fontSize: 17, lineHeight: 24 },
  form: { gap: 14 },
  label: { color: colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  inputWrap: { minHeight: 62, alignItems: 'center', flexDirection: 'row', borderRadius: radii.md, backgroundColor: colors.white, paddingHorizontal: spacing[4] },
  inputError: { borderColor: colors.peach, borderWidth: 2 },
  mail: { color: colors.steel, fontSize: 23, marginRight: 12 },
  input: { flex: 1, color: colors.ink, fontSize: 16, paddingVertical: 12 },
  button: { minHeight: 62, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.peach, marginTop: 6 },
  buttonMuted: { opacity: 0.58 },
  buttonText: { color: colors.navy, fontSize: 19, fontWeight: '800' },
});
