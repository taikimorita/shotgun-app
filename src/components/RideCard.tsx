import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../theme/tokens";
import { Ride } from "../types/booking";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function RideCard({ ride, onPress }: { ride: Ride; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`View ride from ${ride.origin} to ${ride.destination}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>UPCOMING RIDE</Text>
          <Text style={styles.time}>{ride.dateLabel} · {ride.departureTime}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.price}>{formatPrice(ride.pricePerSeat)}</Text>
          <Text style={styles.priceUnit}>per seat</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.routeRail}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>
        <View style={styles.routeLabels}>
          <Text numberOfLines={1} style={styles.place}>{ride.origin}</Text>
          <Text numberOfLines={1} style={styles.place}>{ride.destination}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{ride.driverInitials}</Text></View>
        <View style={styles.metaCopy}>
          <Text style={styles.driver}>{ride.driverName} · ★ {ride.driverRating}</Text>
          <Text style={styles.meta}>{ride.vehicle}</Text>
          <Text style={styles.meta}>{ride.availableSeats} seat{ride.availableSeats === 1 ? "" : "s"} available</Text>
        </View>
        {onPress ? <Text accessibilityElementsHidden style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: semanticColors.app.surface, borderColor: colors.border, borderRadius: componentTokens.card.radius, borderWidth: componentTokens.card.borderWidth, gap: spacing[4], minHeight: 44, padding: componentTokens.card.padding },
  pressed: { backgroundColor: colors.ice, opacity: 0.88 },
  topRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  time: { color: colors.ink, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, marginTop: spacing[1] },
  priceBadge: { alignItems: "flex-end", backgroundColor: colors.peachSoft, borderRadius: radii.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  price: { color: colors.navy, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy },
  priceUnit: { color: colors.textMuted, fontSize: typography.fontSize.xs },
  route: { flexDirection: "row", gap: spacing[3] },
  routeRail: { alignItems: "center", paddingVertical: spacing[1], width: 14 },
  originDot: { backgroundColor: colors.steel, borderRadius: radii.pill, height: 10, width: 10 },
  routeLine: { backgroundColor: colors.borderStrong, flex: 1, minHeight: 22, width: 2 },
  destinationDot: { backgroundColor: colors.peach, borderRadius: radii.pill, height: 10, width: 10 },
  routeLabels: { flex: 1, justifyContent: "space-between", minHeight: 52 },
  place: { color: colors.ink, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  metaRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: spacing[3], paddingTop: spacing[3] },
  avatar: { alignItems: "center", backgroundColor: colors.steelSoft, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  avatarText: { color: colors.navy, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.heavy },
  metaCopy: { flex: 1 },
  driver: { color: colors.ink, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  meta: { color: colors.textMuted, fontSize: typography.fontSize.xs, marginTop: spacing[1] },
  chevron: { color: colors.steel, fontSize: 28, fontWeight: typography.fontWeight.bold },
});
