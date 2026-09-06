import { useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { regionForPlaces, uniqueAvailableRoutePoints } from "../mapPresentation";
import type { Place, Ride } from "../types";

type Props = { origin: Place | null; rides: Ride[] };

export function RideDestinationsMap({ origin, rides }: Props) {
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const routePoints = useMemo(() => uniqueAvailableRoutePoints(rides), [rides]);
  const places = useMemo(() => origin ? [origin, ...routePoints] : routePoints, [origin, routePoints]);
  const region = useMemo(() => regionForPlaces(places), [places]);
  const mapKey = places.map((place) => place.id).join(":") || "empty";

  function map(interactive: boolean) {
    return (
      <MapView
        key={`${mapKey}-${interactive ? "full" : "preview"}`}
        accessibilityLabel={`Ride map with ${routePoints.length} available stop${routePoints.length === 1 ? "" : "s"}`}
        initialRegion={region}
        loadingEnabled
        pitchEnabled={interactive}
        pointerEvents={interactive ? "auto" : "none"}
        rotateEnabled={interactive}
        scrollEnabled={interactive}
        showsCompass={interactive}
        style={StyleSheet.absoluteFill}
        zoomEnabled={interactive}
      >
        {origin ? (
          <Marker coordinate={{ latitude: origin.lat, longitude: origin.lng }} description="Ride search starts here" title={origin.label} tracksViewChanges={false}>
            <View style={styles.markerBadge}>
              <Image accessibilityLabel="Your pickup location" source={require("../../../../Images/GradCapOrange.png")} style={styles.markerImage} />
            </View>
          </Marker>
        ) : null}
        {routePoints.map((place) => (
          <Marker
            key={place.id}
            accessibilityLabel={`Available ride stop at ${place.label}`}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            description="Available ride stop or destination"
            pinColor={colors.steel}
            title={place.label}
          />
        ))}
      </MapView>
    );
  }

  return (
    <>
      <View style={styles.preview}>
        {map(false)}
        <Pressable accessibilityLabel="Open interactive ride map" accessibilityRole="button" onPress={() => setExpanded(true)} style={({ pressed }) => [styles.openOverlay, pressed && styles.pressed]}>
          <View style={styles.openPill}><Text style={styles.openText}>Expand map</Text></View>
          <Text style={styles.summary}>{origin?.label ?? "Choose a pickup"} · {routePoints.length} available stop{routePoints.length === 1 ? "" : "s"}</Text>
        </Pressable>
      </View>
      <Modal animationType="slide" onRequestClose={() => setExpanded(false)} presentationStyle="fullScreen" visible={expanded}>
        <View style={styles.fullScreen}>
          {map(true)}
          <View style={[styles.fullHeader, { paddingTop: insets.top + spacing[2] }]} pointerEvents="box-none">
            <View style={styles.fullTitleCard}><Text style={styles.fullTitle}>Ride stops</Text><Text style={styles.fullSubtitle}>Pan, zoom, or tap a marker for details.</Text></View>
            <Pressable accessibilityLabel="Close interactive map" accessibilityRole="button" onPress={() => setExpanded(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Text style={styles.closeText}>Close</Text></Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  preview: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.xl, borderWidth: 1, height: 195, overflow: "hidden" },
  openOverlay: { flex: 1, justifyContent: "space-between", padding: spacing[3] },
  openPill: { alignSelf: "flex-end", backgroundColor: semanticColors.app.surface, borderRadius: radii.pill, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  openText: { color: semanticColors.text.link, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  summary: { alignSelf: "flex-start", backgroundColor: semanticColors.app.surface, borderRadius: radii.md, color: semanticColors.text.primary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, maxWidth: "90%", overflow: "hidden", paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  fullScreen: { backgroundColor: semanticColors.app.background, flex: 1 },
  fullHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3], justifyContent: "space-between", padding: spacing[4] },
  fullTitleCard: { backgroundColor: semanticColors.app.surface, borderRadius: radii.lg, flex: 1, gap: spacing[1], padding: spacing[3] },
  fullTitle: { color: semanticColors.text.primary, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy },
  fullSubtitle: { color: semanticColors.text.muted, fontSize: typography.fontSize.xs },
  markerBadge: { alignItems: "center", backgroundColor: colors.white, borderColor: semanticColors.app.border, borderRadius: radii.pill, borderWidth: 1, height: 42, justifyContent: "center", shadowColor: colors.ink, shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.2, shadowRadius: 3, width: 42 },
  markerImage: { height: 36, width: 36 },
  closeButton: { alignItems: "center", backgroundColor: semanticColors.action.primaryBackground, borderRadius: radii.pill, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing[4] },
  closeText: { color: semanticColors.action.primaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  pressed: { opacity: 0.72 },
});
