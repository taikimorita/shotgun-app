import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/tokens';

type Props = { initials: string; onPress: () => void };

export function RiderAvatar({ initials, onPress }: Props) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${initials} profile`} onPress={onPress} style={[styles.avatar, initials === 'AS' ? styles.alex : styles.morgan]}><Text style={styles.text}>{initials}</Text></Pressable>;
}

const styles = StyleSheet.create({ avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }, alex: { backgroundColor: '#CFE7FF' }, morgan: { backgroundColor: '#E6DAFF' }, text: { color: colors.navy, fontSize: 22, fontWeight: '800' } });
