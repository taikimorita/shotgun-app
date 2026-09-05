import { Alert, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/src/theme/tokens';
import { RiderNoteCard, type Rider } from './RiderNoteCard';
import { RiderNotesHeader } from './RiderNotesHeader';

const riders: Rider[] = [
  { initials: 'AS', name: 'Alex S.', destination: 'Northgate, Berkeley', note: 'Quiet ride, please.', accommodation: 'Fragrance-free preferred' },
  { initials: 'ML', name: 'Morgan L.', destination: 'Downtown Berkeley', note: 'One small backpack.', accommodation: 'No accommodations needed' },
];

export default function RiderNotesScreen() {
  const show = (label: string, value: string) => Alert.alert(label, value);
  return <ScrollView contentContainerStyle={styles.page}><RiderNotesHeader onBack={() => show('Back', 'Return to the driver details screen.')} />{riders.map((rider) => <RiderNoteCard key={rider.initials} rider={rider} onAction={show} />)}<Text style={styles.helper}>Shown only to confirmed ride participants.</Text></ScrollView>;
}

const styles = StyleSheet.create({ page: { flexGrow: 1, backgroundColor: '#274D6E', gap: spacing[5], padding: spacing[6] }, helper: { color: colors.steelSoft, fontSize: 14, textAlign: 'center', marginTop: 6 } });
