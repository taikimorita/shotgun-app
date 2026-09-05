import { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}>;

export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Button({ children, onPress, disabled = false, loading = false, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[`button_${variant}`], (pressed || disabled || loading) && styles.buttonMuted]}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#17202a'} /> : <Text style={styles.buttonText}>{children}</Text>}
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor="#718096" {...props} style={[styles.input, props.style]} />;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ children }: PropsWithChildren) {
  return <View style={styles.badge}><Text style={styles.badgeText}>{children}</Text></View>;
}

export function Avatar({ label, size = 48 }: { label: string; size?: number }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}><Text style={styles.avatarText}>{label.slice(0, 1).toUpperCase()}</Text></View>;
}

export function StatusPill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' }>) {
  return <View style={[styles.statusPill, styles[`status_${tone}`]]}><Text style={styles.statusText}>{children}</Text></View>;
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <View style={styles.state}><ActivityIndicator /><Text style={styles.stateText}>{label}</Text></View>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <View style={styles.state}><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateText}>{message}</Text>{action}</View>;
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return <View style={styles.state}><Text style={styles.errorTitle}>Something went wrong</Text><Text style={styles.stateText}>{message}</Text>{action}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#f7f8fa' },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingHorizontal: 16 },
  button_primary: { backgroundColor: '#17202a' },
  button_secondary: { backgroundColor: '#e7ebef' },
  button_danger: { backgroundColor: '#b42318' },
  buttonMuted: { opacity: 0.55 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#c8d0d8', borderRadius: 8, paddingHorizontal: 14, color: '#17202a', backgroundColor: '#ffffff', fontSize: 16 },
  card: { borderRadius: 8, borderWidth: 1, borderColor: '#e0e5ea', backgroundColor: '#ffffff', padding: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#e7ebef', paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#344054', fontSize: 12, fontWeight: '600' },
  avatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9e2ec' },
  avatarText: { color: '#17202a', fontSize: 18, fontWeight: '700' },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  status_neutral: { backgroundColor: '#e7ebef' },
  status_success: { backgroundColor: '#d1fadf' },
  status_warning: { backgroundColor: '#fef0c7' },
  status_danger: { backgroundColor: '#fee4e2' },
  statusText: { color: '#344054', fontSize: 12, fontWeight: '600' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateTitle: { color: '#17202a', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errorTitle: { color: '#b42318', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  stateText: { color: '#667085', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
