import { StyleSheet, Text, View } from "react-native";
import { BookingStatus } from "../types/booking";

const labels: Record<BookingStatus, string> = {
  pending: "Request pending",
  accepted: "Confirmed",
  declined: "Not accepted",
  cancelled: "Cancelled",
};

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  return <View style={[styles.pill, styles[status]]}><Text style={styles.text}>{labels[status]}</Text></View>;
}

const styles = StyleSheet.create({
  pill: { alignSelf: "flex-start", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  pending: { backgroundColor: "#FEF3C7" }, accepted: { backgroundColor: "#DCFCE7" },
  declined: { backgroundColor: "#FEE2E2" }, cancelled: { backgroundColor: "#E5E7EB" },
  text: { color: "#1F2937", fontSize: 12, fontWeight: "700" },
});
