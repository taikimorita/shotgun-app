import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

type Props = { onPress?: () => void };

export function DriverHeader({ onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View driver profile" onPress={onPress} style={styles.row}>
      <View style={styles.avatar}><Text style={styles.avatarText}>JR</Text></View>
      <View><Text style={styles.name}>Jordan Rivera</Text><Text style={styles.role}>Driver · Computer Science</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B9D0E5' },
  avatarText: { color: colors.navy, fontSize: 20, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 26, fontWeight: '800' },
  role: { color: colors.textMuted, fontSize: 16, marginTop: 4 },
});
