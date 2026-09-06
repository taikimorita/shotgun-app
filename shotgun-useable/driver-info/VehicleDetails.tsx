import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function VehicleDetails({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="View vehicle details" onPress={onPress} style={styles.row}><Text style={styles.icon}>🚗</Text><Text style={styles.text}>Blue Honda Civic</Text></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 5 }, icon: { fontSize: 25, width: 34, textAlign: 'center' }, text: { color: colors.ink, fontSize: 19, fontWeight: '600' } });
