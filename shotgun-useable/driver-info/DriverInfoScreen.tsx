import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme/tokens';
import { DriverHeader } from './DriverHeader';
import { RatingSummary } from './RatingSummary';
import { RideRequestPanel } from './RideRequestPanel';
import { RiderSeats } from './RiderSeats';
import { RouteDetails } from './RouteDetails';
import { VehicleDetails } from './VehicleDetails';

export default function DriverInfoScreen() {
  const [requested, setRequested] = useState(false);
  const show = (title: string, message: string) => Alert.alert(title, message);
  return <ScrollView contentContainerStyle={styles.page}><Text style={styles.kicker}>VERIFIED STUDENTS ONLY</Text><Text style={styles.title}>A ride that fits.</Text><View style={styles.card}><DriverHeader onPress={() => show('Jordan Rivera', 'Driver profile selected.')} /><RouteDetails onPress={() => show('Route', 'Jordan is headed to Northgate.')} /><VehicleDetails onPress={() => show('Vehicle', 'Blue Honda Civic selected.')} /><RatingSummary onPress={() => show('Ratings', 'Jordan has a 4.9 rating from 28 rides.')} /><RiderSeats onPress={() => show('Rider notes', 'Open the rider-notes screen to review Alex and Morgan’s preferences.')} /><RideRequestPanel requested={requested} onRequest={() => { setRequested(true); show('Request sent', 'Your request to ride with Jordan is pending.'); }} /></View><View style={styles.notice}><Text style={styles.noticeText}>✓ Campus email verified · Share trip details after acceptance.</Text></View><Text style={styles.helper}>You control when a ride request is sent.</Text></ScrollView>;
}

const styles = StyleSheet.create({ page: { flexGrow: 1, backgroundColor: '#274D6E', gap: spacing[5], padding: spacing[6] }, kicker: { color: colors.peach, fontSize: 13, fontWeight: '800', letterSpacing: 1.8, marginTop: 16 }, title: { color: colors.white, fontSize: 34, fontWeight: '800' }, card: { backgroundColor: colors.white, borderRadius: radii.xl, gap: 15, padding: spacing[5] }, notice: { backgroundColor: colors.steelSoft, borderRadius: radii.lg, padding: spacing[4] }, noticeText: { color: colors.navy, fontSize: 15, fontWeight: '700', lineHeight: 22 }, helper: { color: colors.steelSoft, fontSize: 14, textAlign: 'center' } });
