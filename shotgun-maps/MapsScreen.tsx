import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { DestinationCard } from './DestinationCard';
import { MapCanvas } from './MapCanvas';
import { PickupCard } from './PickupCard';
import { ViewRidesButton } from './ViewRidesButton';

type Props = { onMapPress?: () => void; onPickupPress?: () => void; onDestinationPress?: () => void; onViewRides?: () => void };

/** The exact middle reference screen, with transparent interactive targets over its visible controls. */
export default function MapsScreen({ onMapPress, onPickupPress, onDestinationPress, onViewRides }: Props) {
  const [announcement, setAnnouncement] = useState('');
  const activate = (label: string, callback?: () => void) => { setAnnouncement(`${label} selected.`); callback?.(); };
  return <ImageBackground accessibilityLabel="Shotgun route selection" resizeMode="contain" source={require('./maps-reference.png')} style={styles.screen}><View pointerEvents="box-none" style={styles.targets}><MapCanvas onPress={() => activate('Map', onMapPress)} /><PickupCard onPress={() => activate('Pickup', onPickupPress)} /><DestinationCard onPress={() => activate('Destination', onDestinationPress)} /><ViewRidesButton onPress={() => activate('View rides', onViewRides)} /><Text accessibilityLiveRegion="polite" style={styles.announcement}>{announcement}</Text></View></ImageBackground>;
}

const styles = StyleSheet.create({ screen: { flex: 1, width: '100%', aspectRatio: 492 / 909 }, targets: { ...StyleSheet.absoluteFillObject }, announcement: { opacity: 0, position: 'absolute' } });
