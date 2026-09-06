import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';
import { AccommodationDetail } from './AccommodationDetail';
import { DestinationDetail } from './DestinationDetail';
import { RideNoteDetail } from './RideNoteDetail';
import { RiderAvatar } from './RiderAvatar';

export type Rider = { initials: string; name: string; destination: string; note: string; accommodation: string };
type Props = { rider: Rider; onAction: (label: string, value: string) => void };

export function RiderNoteCard({ rider, onAction }: Props) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View notes for ${rider.name}`} onPress={() => onAction('Rider', rider.name)} style={styles.card}><View style={styles.header}><RiderAvatar initials={rider.initials} onPress={() => onAction('Profile', rider.name)} /><Text style={styles.name}>{rider.initials} · {rider.name}</Text></View><DestinationDetail value={rider.destination} onPress={() => onAction('Destination', rider.destination)} /><RideNoteDetail value={rider.note} onPress={() => onAction('Ride note', rider.note)} /><AccommodationDetail value={rider.accommodation} onPress={() => onAction('Accommodation', rider.accommodation)} /></Pressable>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.white, borderRadius: radii.xl, gap: 14, padding: spacing[5] }, header: { flexDirection: 'row', alignItems: 'center', gap: 16 }, name: { color: colors.ink, fontSize: 23, fontWeight: '800' } });
