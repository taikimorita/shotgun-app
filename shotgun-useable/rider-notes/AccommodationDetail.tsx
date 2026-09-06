import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function AccommodationDetail({ value, onPress }: { value: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View accommodation: ${value}`} onPress={onPress} style={styles.row}><Text style={styles.icon}>●</Text><View><Text style={styles.label}>Accommodation</Text><Text style={styles.value}>{value}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 18, alignItems: 'flex-start', paddingVertical: 7 }, icon: { color: colors.navy, fontSize: 20, marginTop: 8, width: 26, textAlign: 'center' }, label: { color: colors.steel, fontSize: 16, fontWeight: '700' }, value: { color: colors.ink, fontSize: 19, fontWeight: '600', marginTop: 4 } });
