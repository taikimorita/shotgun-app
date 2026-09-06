import { StyleSheet, Text, View } from "react-native";

import type { MapsService } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import type { Place, RouteSummary } from "../types";

export function RideRouteMap({ places }: { places: Place[]; service: MapsService; onRouteChange?: (route: RouteSummary) => void }) {
  return <View accessibilityRole="image" accessibilityLabel={`Route map from ${places[0].label} to ${places.at(-1)?.label}`} style={styles.container}><Text style={styles.kicker}>ROUTE PREVIEW</Text><Text style={styles.route}>{places.map((place) => place.label).join(" → ")}</Text></View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing[2], minHeight: 150, padding: spacing[4] },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  route: { color: semanticColors.text.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, lineHeight: 24 },
});
