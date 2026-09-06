import { StyleSheet, Text, View } from "react-native";

import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { uniqueRideDestinations } from "../mapPresentation";
import type { Place, Ride } from "../types";

export function RideDestinationsMap({ origin, rides }: { origin: Place | null; rides: Ride[] }) {
  const destinations = uniqueRideDestinations(rides);
  return <View accessibilityLabel="Static ride map fallback" style={styles.preview}><Text style={styles.kicker}>RIDE MAP</Text><Text style={styles.title}>{origin?.label ?? "Choose a pickup"}</Text><Text style={styles.body}>{destinations.length} available destination{destinations.length === 1 ? "" : "s"}: {destinations.map((place) => place.label).join(", ") || "none yet"}</Text></View>;
}

const styles = StyleSheet.create({
  preview: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.xl, borderWidth: 1, gap: spacing[2], height: 195, justifyContent: "flex-end", padding: spacing[4] },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  title: { color: semanticColors.text.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  body: { color: semanticColors.text.muted, fontSize: typography.fontSize.sm, lineHeight: 20 },
});
