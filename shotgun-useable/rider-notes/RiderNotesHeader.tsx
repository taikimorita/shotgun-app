import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function RiderNotesHeader({ onBack }: { onBack: () => void }) {
  return <View><Pressable accessibilityRole="button" accessibilityLabel="Back to driver details" onPress={onBack} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Rider notes</Text><Text style={styles.subtitle}>Trip details shared by verified riders.</Text></View>;
}

const styles = StyleSheet.create({ back: { color: colors.peach, fontSize: 48, lineHeight: 48, marginBottom: 24 }, title: { color: colors.white, fontSize: 34, fontWeight: '800' }, subtitle: { color: colors.steelSoft, fontSize: 17, marginTop: 10 } });
