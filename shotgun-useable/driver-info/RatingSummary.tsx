import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function RatingSummary({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="View Jordan's ratings" onPress={onPress} style={styles.row}><Text style={styles.icon}>★</Text><Text style={styles.text}>4.9 <Text style={styles.star}>★</Text> · 28 rides</Text></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 5 }, icon: { color: colors.navy, fontSize: 27, width: 34, textAlign: 'center' }, text: { color: colors.ink, fontSize: 19, fontWeight: '600' }, star: { color: colors.peach } });
