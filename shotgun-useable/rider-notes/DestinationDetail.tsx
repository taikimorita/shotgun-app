import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function DestinationDetail({ value, onPress }: { value: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View destination: ${value}`} onPress={onPress} style={styles.row}><Text style={styles.icon}>●</Text><View><Text style={styles.label}>Going to</Text><Text style={styles.value}>{value}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 18, alignItems: 'flex-start', paddingVertical: 7 }, icon: { color: colors.navy, fontSize: 20, marginTop: 8, width: 26, textAlign: 'center' }, label: { color: colors.steel, fontSize: 16, fontWeight: '700' }, value: { color: colors.ink, fontSize: 19, fontWeight: '600', marginTop: 4 } });
