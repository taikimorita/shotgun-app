import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function RiderSeats({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="View rider notes for Alex and Morgan" onPress={onPress} style={styles.row}><Text style={styles.people}>♟</Text><View style={styles.avatars}><Text style={[styles.avatar, styles.alex]}>AS</Text><Text style={[styles.avatar, styles.morgan]}>ML</Text></View><Text style={styles.text}>2 seats available</Text></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 }, people: { color: colors.navy, fontSize: 26, width: 34, textAlign: 'center' }, avatars: { flexDirection: 'row' }, avatar: { width: 38, height: 38, borderRadius: 19, textAlign: 'center', paddingTop: 10, marginLeft: -4, color: colors.navy, fontSize: 13, fontWeight: '800', borderWidth: 2, borderColor: colors.white }, alex: { backgroundColor: '#CFE7FF' }, morgan: { backgroundColor: '#E6DAFF' }, text: { color: colors.ink, fontSize: 19, fontWeight: '600' } });
