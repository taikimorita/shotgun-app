import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function RouteDetails({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="View route to Northgate" onPress={onPress} style={styles.row}><Text style={styles.icon}>⌁</Text><Text style={styles.text}>Same route to Northgate</Text></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 5 }, icon: { color: colors.navy, fontSize: 30, width: 34, textAlign: 'center' }, text: { color: colors.ink, fontSize: 19, fontWeight: '600' } });
