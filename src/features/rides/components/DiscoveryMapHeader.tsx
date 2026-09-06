import { Pressable, StyleSheet, Text, View } from "react-native";

import { MapsService } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { Place } from "../types";
import { PlacePicker } from "./PlacePicker";

type DiscoveryMapHeaderProps = {
  pickup: Place | null;
  destination: Place | null;
  mapsService: MapsService;
  disabled?: boolean;
  viewRidesDisabled?: boolean;
  viewRidesLoading?: boolean;
  onPickupChange: (place: Place | null) => void;
  onDestinationChange: (place: Place | null) => void;
  onViewRides: () => void;
};

function placeLabel(place: Place | null, fallback: string) {
  return place?.label ?? fallback;
}

export function DiscoveryMapHeader({
  pickup,
  destination,
  mapsService,
  disabled = false,
  viewRidesDisabled = false,
  viewRidesLoading = false,
  onPickupChange,
  onDestinationChange,
  onViewRides,
}: DiscoveryMapHeaderProps) {
  const pickupLabel = placeLabel(pickup, "Choose a pickup");
  const destinationLabel = placeLabel(destination, "Choose a destination");

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View accessibilityLabel="Shotgun logo" style={styles.logoMark}>
          <Text style={styles.logoGlyph}>↗</Text>
        </View>
        <View>
          <Text style={styles.brand}>SHOTGUN</Text>
          <Text style={styles.brandSub}>Cal Poly ride board</Text>
        </View>
      </View>

      <View
        accessibilityLabel={`Route preview from ${pickupLabel} to ${destinationLabel}`}
        accessibilityRole="image"
        style={styles.mapPreview}
      >
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={styles.routeLine} />
        <View style={[styles.marker, styles.pickupMarker]}>
          <Text style={styles.markerGlyph}>C</Text>
        </View>
        <View style={[styles.marker, styles.destinationMarker]}>
          <Text style={styles.markerGlyph}>⌖</Text>
        </View>
        <View style={styles.mapLabel}>
          <Text style={styles.mapKicker}>ROUTE PREVIEW</Text>
          <Text numberOfLines={1} style={styles.mapRouteText}>
            {pickupLabel} → {destinationLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Where do you need to go?</Text>

      <View style={styles.placeCard}>
        <PlacePicker
          disabled={disabled}
          helperText="Start from campus or choose another pickup."
          label="Pickup"
          service={mapsService}
          onChange={onPickupChange}
          placeholder="Search campus, downtown SLO, or another place"
          value={pickup}
        />
      </View>

      <View style={styles.placeCard}>
        <PlacePicker
          disabled={disabled}
          helperText="Choose where you want to go."
          label="Destination"
          service={mapsService}
          onChange={onDestinationChange}
          placeholder="Search SFO, Los Angeles, or another place"
          value={destination}
        />
      </View>

      <Pressable
        accessibilityLabel="View rides"
        accessibilityRole="button"
        accessibilityState={{ busy: viewRidesLoading, disabled: viewRidesDisabled }}
        disabled={viewRidesDisabled}
        onPress={onViewRides}
        style={({ pressed }) => [styles.viewButton, (pressed || viewRidesDisabled) && styles.buttonMuted]}
      >
        <Text style={styles.viewButtonText}>
          {viewRidesLoading ? "Finding rides…" : destination ? "View rides" : "Choose a destination"}
        </Text>
      </Pressable>

      <Text style={styles.privacyNote}>Your destination is used to find a ride. Participant details are shared after acceptance.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[3] },
  brandRow: { alignItems: "center", flexDirection: "row", gap: spacing[3] },
  logoMark: { alignItems: "center", backgroundColor: colors.steel, borderRadius: radii.md, height: 48, justifyContent: "center", width: 48 },
  logoGlyph: { color: colors.white, fontSize: 28, fontWeight: typography.fontWeight.heavy },
  brand: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.label },
  brandSub: { color: colors.textMuted, fontSize: typography.fontSize.xs, marginTop: spacing[1] },
  mapPreview: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.xl, borderWidth: 1, height: 195, overflow: "hidden", position: "relative" },
  road: { backgroundColor: colors.white, height: 30, opacity: 0.82, position: "absolute", width: "90%" },
  roadOne: { left: "-22%", top: "28%", transform: [{ rotate: "-28deg" }] },
  roadTwo: { right: "-20%", top: "62%", transform: [{ rotate: "22deg" }] },
  roadThree: { left: "-18%", top: "82%", transform: [{ rotate: "18deg" }] },
  routeLine: { backgroundColor: colors.steel, borderRadius: radii.pill, height: 7, left: "25%", position: "absolute", top: "47%", transform: [{ rotate: "-17deg" }], width: "53%" },
  marker: { alignItems: "center", borderColor: colors.white, borderRadius: radii.pill, borderWidth: 4, height: 48, justifyContent: "center", position: "absolute", width: 48 },
  pickupMarker: { backgroundColor: colors.steel, bottom: "25%", left: "16%" },
  destinationMarker: { backgroundColor: colors.peach, right: "15%", top: "17%" },
  markerGlyph: { color: colors.white, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.heavy },
  mapLabel: { bottom: spacing[4], left: spacing[4], maxWidth: "78%", position: "absolute" },
  mapKicker: { color: colors.textMuted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  mapRouteText: { color: colors.ink, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, marginTop: spacing[1] },
  title: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight },
  placeCard: { backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, padding: spacing[3] },
  viewButton: { alignItems: "center", backgroundColor: colors.steel, borderRadius: radii.md, justifyContent: "center", minHeight: 56, paddingHorizontal: spacing[5] },
  viewButtonText: { color: colors.white, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  buttonMuted: { opacity: 0.55 },
  privacyNote: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 20, paddingHorizontal: spacing[4], textAlign: "center" },
});
