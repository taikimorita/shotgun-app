import { StyleSheet, Text, View } from "react-native";
import { BookingStatus } from "../types/booking";
import { radii, semanticColors, spacing, typography } from "../theme/tokens";

const labels: Record<BookingStatus, string> = {
  pending: "Request pending",
  accepted: "Confirmed",
  declined: "Not accepted",
  cancelled: "Cancelled",
};

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  return <View style={[styles.pill, styles[`${status}Pill`]]}><Text style={[styles.text, styles[`${status}Text`]]}>{labels[status]}</Text></View>;
}

const styles = StyleSheet.create({
  pill: { alignSelf: "flex-start", borderRadius: radii.pill, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  pendingPill: { backgroundColor: semanticColors.status.warningBackground },
  acceptedPill: { backgroundColor: semanticColors.status.successBackground },
  declinedPill: { backgroundColor: semanticColors.status.dangerBackground },
  cancelledPill: { backgroundColor: semanticColors.app.surfaceMuted },
  text: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  pendingText: { color: semanticColors.status.warningForeground },
  acceptedText: { color: semanticColors.status.successForeground },
  declinedText: { color: semanticColors.status.dangerForeground },
  cancelledText: { color: semanticColors.text.muted },
});
