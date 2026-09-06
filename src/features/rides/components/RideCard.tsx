import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, componentTokens, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { Ride } from "../types";
import { RideFacts } from "./RideFacts";

type RideCardProps = {
  ride: Ride;
  onPress?: () => void;
  requestable: boolean;
};

export function RideCard({ ride, onPress, requestable }: RideCardProps) {
  const availability = requestable
    ? `${ride.remainingSeats} seat${ride.remainingSeats === 1 ? "" : "s"} available`
    : ride.remainingSeats > 0
      ? "currently unavailable to request"
      : "full";
  const content = (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>RIDE OFFER</Text>
        {!requestable ? <View style={styles.unavailableBadge}><Text style={styles.unavailableText}>{ride.remainingSeats > 0 ? "Unavailable" : "Full"}</Text></View> : null}
      </View>
      <RideFacts ride={ride} compact />
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ride from ${ride.origin.label} to ${ride.destination.label}, ${availability}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: semanticColors.app.surface, borderColor: colors.border, borderRadius: componentTokens.card.radius, borderWidth: componentTokens.card.borderWidth, gap: spacing[4], minHeight: 44, padding: componentTokens.card.padding },
  pressed: { backgroundColor: colors.ice, opacity: 0.88 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 32 },
  kicker: { color: colors.steel, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.label },
  unavailableBadge: { backgroundColor: semanticColors.status.dangerBackground, borderRadius: radii.pill, justifyContent: "center", minHeight: 32, paddingHorizontal: spacing[3] },
  unavailableText: { color: semanticColors.status.dangerForeground, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
});
