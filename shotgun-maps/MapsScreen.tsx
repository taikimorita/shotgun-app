import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';
import { DestinationCard } from './DestinationCard';
import { MapCanvas } from './MapCanvas';
import { PickupCard } from './PickupCard';
import { ViewRidesButton } from './ViewRidesButton';

type Props = { onViewRides?: (route: { pickup: string; destination: string }) => void };

/** Interactive route selection UI based on the middle reference screen. */
export default function MapsScreen({ onViewRides }: Props) {
  const [pickup, setPickup] = useState('Sproul Plaza');
  const [destination, setDestination] = useState('Northgate, Berkeley');
  const [activeStop, setActiveStop] = useState<'pickup' | 'destination'>('pickup');
  const [showResults, setShowResults] = useState(false);
  const viewRides = () => { setShowResults(true); onViewRides?.({ pickup, destination }); };
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.brandRow}><Image accessibilityLabel="Shotgun logo" resizeMode="contain" source={require('./shotgun-logo.png')} style={styles.brand} /></View><MapCanvas activeStop={activeStop} onSelectStop={setActiveStop} /><Text style={styles.title}>Where do you need to go?</Text><PickupCard onChangeText={setPickup} onFocus={() => setActiveStop('pickup')} value={pickup} /><DestinationCard onChangeText={setDestination} onFocus={() => setActiveStop('destination')} value={destination} /><ViewRidesButton onPress={viewRides} />{showResults ? <View accessibilityLiveRegion="polite" style={styles.results}><Text style={styles.resultsTitle}>3 rides found</Text><Text style={styles.resultsBody}>From {pickup} to {destination}</Text></View> : null}<Text style={styles.helper}>Your destination is shared only with your matched driver after you confirm.</Text></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.ice }, content: { flexGrow: 1, gap: spacing[4], padding: spacing[5] }, brandRow: { marginTop: spacing[2] }, brand: { height: 58, width: 210 }, title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.7, marginTop: 4 }, results: { backgroundColor: colors.successSurface, borderRadius: radii.lg, padding: spacing[4] }, resultsTitle: { color: colors.success, fontSize: 17, fontWeight: '800' }, resultsBody: { color: colors.ink, fontSize: 15, marginTop: 4 }, helper: { color: colors.textMuted, fontSize: 14, lineHeight: 20, paddingBottom: spacing[3], textAlign: 'center' } });
