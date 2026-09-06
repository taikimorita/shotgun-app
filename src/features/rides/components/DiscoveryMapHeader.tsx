import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { MapsService } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { Place, Ride } from "../types";
import { PlacePicker } from "./PlacePicker";
import { RideDestinationsMap } from "./RideDestinationsMap";

type DiscoveryMapHeaderProps = {
  pickup: Place | null;
  destination: Place | null;
  rides: Ride[];
  mapsService: MapsService;
  locationStatus?: "idle" | "loading" | "error";
  locationError?: string;
  disabled?: boolean;
  viewRidesDisabled?: boolean;
  viewRidesLoading?: boolean;
  onPickupChange: (place: Place | null) => void;
  onDestinationChange: (place: Place | null) => void;
  onViewRides: () => void;
  onUseCurrentLocation: () => void;
};

export function DiscoveryMapHeader({
  pickup,
  destination,
  rides,
  mapsService,
  locationStatus = "idle",
  locationError = "",
  disabled = false,
  viewRidesDisabled = false,
  viewRidesLoading = false,
  onPickupChange,
  onDestinationChange,
  onViewRides,
  onUseCurrentLocation,
}: DiscoveryMapHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Image accessibilityLabel="Shotgun logo" source={require("../../../../Images/Logo.png")} style={styles.logoMark} />
        <View>
          <Text style={styles.brand}>SHOTGUN</Text>
          <Text style={styles.brandSub}>Cal Poly ride board</Text>
        </View>
      </View>

      <RideDestinationsMap origin={pickup} rides={rides} />

      <Text style={styles.title}>Where do you need to go?</Text>

      <View style={styles.placeCard}>
        <PlacePicker
          disabled={disabled}
          helperText="Start from campus or choose another pickup."
          label="Pickup"
          service={mapsService}
          onChange={onPickupChange}
          placeholder="Search anywhere"
          value={pickup}
        />
        <Pressable
          accessibilityLabel="Use my current location as pickup"
          accessibilityRole="button"
          accessibilityState={{ busy: locationStatus === "loading", disabled: disabled || locationStatus === "loading" }}
          disabled={disabled || locationStatus === "loading"}
          onPress={onUseCurrentLocation}
          style={({ pressed }) => [styles.locationButton, (pressed || disabled || locationStatus === "loading") && styles.buttonMuted]}
        >
          {locationStatus === "loading" ? <ActivityIndicator color={semanticColors.action.secondaryForeground} /> : <Text style={styles.locationButtonText}>⌖ Use my location</Text>}
        </Pressable>
        {locationStatus === "error" ? <Text accessibilityRole="alert" style={styles.locationError}>{locationError}</Text> : null}
      </View>

      <View style={styles.placeCard}>
        <PlacePicker
          disabled={disabled}
          helperText="Choose where you want to go."
          label="Destination"
          service={mapsService}
          onChange={onDestinationChange}
          placeholder="Search anywhere"
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
  logoMark: { borderRadius: radii.md, height: 48, width: 48 },
  brand: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.label },
  brandSub: { color: colors.textMuted, fontSize: typography.fontSize.xs, marginTop: spacing[1] },
  title: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy, letterSpacing: typography.letterSpacing.tight },
  placeCard: { backgroundColor: semanticColors.app.surface, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing[3], padding: spacing[3] },
  locationButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: semanticColors.action.secondaryBackground, borderColor: semanticColors.action.secondaryBorder, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", justifyContent: "center", minHeight: 44, minWidth: 158, paddingHorizontal: spacing[4] },
  locationButtonText: { color: semanticColors.action.secondaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  locationError: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.sm, lineHeight: 20 },
  viewButton: { alignItems: "center", backgroundColor: colors.steel, borderRadius: radii.md, justifyContent: "center", minHeight: 56, paddingHorizontal: spacing[5] },
  viewButtonText: { color: colors.white, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  buttonMuted: { opacity: 0.55 },
  privacyNote: { color: colors.textMuted, fontSize: typography.fontSize.sm, lineHeight: 20, paddingHorizontal: spacing[4], textAlign: "center" },
});
