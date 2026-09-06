import { StyleSheet, Text, View } from "react-native";

import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { Ride } from "../types";

type RideFactsProps = {
  ride: Ride;
  compact?: boolean;
};

function timezoneAbbreviation(ride: Ride) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ride.displayTimezone,
    timeZoneName: "short",
  }).formatToParts(new Date(ride.departureAt));
  const zone = parts.find((part) => part.type === "timeZoneName")?.value;
  return zone === "PST" || zone === "PDT" ? zone : "PT";
}

function formatDeparture(ride: Ride) {
  const departure = new Date(ride.departureAt);
  if (Number.isNaN(departure.getTime())) return `Departure time · ${ride.displayTimezone}`;

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: ride.displayTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(departure);
  return `${formatted} ${timezoneAbbreviation(ride)}`;
}

function formatCents(cents: number) {
  const safeCents = Number.isInteger(cents) ? cents : 0;
  const dollars = Math.floor(Math.abs(safeCents) / 100);
  const remainder = String(Math.abs(safeCents) % 100).padStart(2, "0");
  return `${safeCents < 0 ? "-" : ""}$${dollars}.${remainder}`;
}

function RouteLine({ ride, compact }: RideFactsProps) {
  const stops = ride.stops.length > 0 ? ride.stops : [];
  return (
    <View style={styles.routeBlock}>
      <View style={styles.routeColumn} accessibilityLabel="Ride route">
        <View style={styles.routeDot} />
        <View style={styles.routeLine} />
        {stops.map((stop) => (
          <View key={stop.id} style={styles.stopRow}>
            <View style={styles.stopDot} />
            <View style={styles.routeLine} />
          </View>
        ))}
        <View style={[styles.routeDot, styles.destinationDot]} />
      </View>
      <View style={styles.routeLabels}>
        <Text numberOfLines={compact ? 1 : 2} style={styles.placeText}>{ride.origin.label}</Text>
        {stops.map((stop) => (
          <Text key={stop.id} numberOfLines={compact ? 1 : 2} style={styles.stopLabel}>{stop.label}</Text>
        ))}
        <Text numberOfLines={compact ? 1 : 2} style={styles.placeText}>{ride.destination.label}</Text>
      </View>
    </View>
  );
}

export function RideFacts({ ride, compact = false }: RideFactsProps) {
  const rating = ride.driver.ratingAverage == null ? "New" : ride.driver.ratingAverage.toFixed(1);
  const completedRides = ride.driver.completedRideCount == null ? "No completed rides yet" : `${ride.driver.completedRideCount} rides`;
  const verified = ride.driver.verificationStatus === "school_email";

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.departureRow}>
        <Text style={styles.eyebrow}>DEPARTURE</Text>
        <Text style={styles.departureText}>{formatDeparture(ride)}</Text>
      </View>

      <RouteLine ride={ride} compact={compact} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CONTRIBUTION</Text>
          <Text style={styles.detailValue}>{formatCents(ride.priceCents)} <Text style={styles.detailUnit}>/ seat</Text></Text>
          <Text style={styles.detailHelper}>{ride.priceSource === "suggested" ? "Suggested" : "Driver set"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>AVAILABILITY</Text>
          <Text style={styles.detailValue}>{ride.remainingSeats}</Text>
          <Text style={styles.detailHelper}>{ride.remainingSeats === 1 ? "seat left" : "seats left"} · {ride.capacity} total</Text>
        </View>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatar} accessibilityLabel={`Driver ${ride.driver.name}`}>
          <Text style={styles.avatarText}>{ride.driver.initials}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.driverName}>{ride.driver.name}</Text>
          <Text style={styles.driverMeta}>★ {rating} · {completedRides}</Text>
        </View>
        <View style={[styles.verification, !verified && styles.unverified]}>
          <Text style={[styles.verificationText, !verified && styles.unverifiedText]}>{verified ? "✓ School email" : "Email unverified"}</Text>
        </View>
      </View>

      <View style={styles.vehicleRow}>
        <Text style={styles.vehicleIcon}>▣</Text>
        <Text numberOfLines={1} style={styles.vehicleText}>{ride.vehicle.label}</Text>
      </View>

      {!compact && ride.notes ? <Text style={styles.notes}>{ride.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[4] },
  compactContainer: { gap: spacing[3] },
  departureRow: { gap: spacing[1] },
  eyebrow: { color: colors.textMuted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  departureText: { color: colors.ink, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  routeBlock: { flexDirection: "row", gap: spacing[3], minHeight: 74 },
  routeColumn: { alignItems: "center", paddingTop: 5, width: 14 },
  routeDot: { backgroundColor: colors.peach, borderColor: colors.white, borderRadius: radii.pill, borderWidth: 2, height: 12, width: 12 },
  destinationDot: { backgroundColor: colors.navy },
  routeLine: { backgroundColor: colors.borderStrong, flex: 1, minHeight: 12, width: 2 },
  stopRow: { alignItems: "center", flex: 1, width: 14 },
  stopDot: { backgroundColor: colors.steel, borderRadius: radii.pill, height: 7, width: 7 },
  routeLabels: { flex: 1, justifyContent: "space-between" },
  placeText: { color: colors.ink, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  stopLabel: { color: colors.textMuted, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  detailsGrid: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: spacing[3], paddingVertical: spacing[3] },
  detailItem: { flex: 1, gap: spacing[1] },
  detailLabel: { color: colors.textMuted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  detailValue: { color: colors.ink, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.heavy },
  detailUnit: { color: colors.textMuted, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  detailHelper: { color: colors.textMuted, fontSize: typography.fontSize.sm },
  profileRow: { alignItems: "center", flexDirection: "row", gap: spacing[3], minHeight: 44 },
  avatar: { alignItems: "center", backgroundColor: colors.steelSoft, borderRadius: radii.pill, height: 48, justifyContent: "center", width: 48 },
  avatarText: { color: colors.navy, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  profileCopy: { flex: 1, gap: spacing[1] },
  driverName: { color: colors.ink, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  driverMeta: { color: colors.textMuted, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  verification: { backgroundColor: semanticColors.status.successBackground, borderRadius: radii.pill, justifyContent: "center", minHeight: 32, paddingHorizontal: spacing[2] },
  verificationText: { color: semanticColors.status.successForeground, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  unverified: { backgroundColor: semanticColors.status.warningBackground },
  unverifiedText: { color: semanticColors.status.warningForeground },
  vehicleRow: { alignItems: "center", flexDirection: "row", gap: spacing[2], minHeight: 44 },
  vehicleIcon: { color: colors.steel, fontSize: typography.fontSize.lg, width: 24 },
  vehicleText: { color: colors.text, flex: 1, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  notes: { backgroundColor: colors.ice, borderRadius: radii.md, color: colors.text, fontSize: typography.fontSize.sm, lineHeight: 21, padding: spacing[3] },
});
