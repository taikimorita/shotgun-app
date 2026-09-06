import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import type { MapsService } from "../../../lib/maps";
import { colors, radii, semanticColors, spacing, typography } from "../../../theme/tokens";
import { regionForPlaces } from "../mapPresentation";
import type { Place, RouteSummary } from "../types";

type Props = { places: Place[]; service: MapsService; onRouteChange?: (route: RouteSummary) => void };

export function RideRouteMap({ places, service, onRouteChange }: Props) {
  const [path, setPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const waypointKey = places.map((place) => place.id).join(":");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    service.getRoute(places).then((route) => {
      if (!active) return;
      setPath(route.path?.length ? route.path : places.map(({ lat, lng }) => ({ lat, lng })));
      setStatus("ready");
      onRouteChange?.(route);
    }).catch(() => {
      if (!active) return;
      setPath(places.map(({ lat, lng }) => ({ lat, lng })));
      setStatus("error");
    });
    return () => { active = false; };
  }, [onRouteChange, places, service, waypointKey]);

  const region = useMemo(() => regionForPlaces(places), [places]);
  const coordinates = path.map(({ lat, lng }) => ({ latitude: lat, longitude: lng }));

  return (
    <View accessibilityLabel={`Route map from ${places[0].label} to ${places.at(-1)?.label}`} style={styles.container}>
      <MapView initialRegion={region} pointerEvents="none" style={StyleSheet.absoluteFill}>
        {coordinates.length > 1 ? <Polyline coordinates={coordinates} strokeColor={colors.steel} strokeWidth={5} /> : null}
        <Marker coordinate={{ latitude: places[0].lat, longitude: places[0].lng }} title={places[0].label} tracksViewChanges={false}>
          <View style={styles.originBadge}><Image source={require("../../../../Images/GradCapOrange.png")} style={styles.originImage} /></View>
        </Marker>
        {places.slice(1, -1).map((stop) => <Marker key={stop.id} coordinate={{ latitude: stop.lat, longitude: stop.lng }} description="Suggested stop" pinColor={colors.steel} title={stop.label} />)}
        <Marker coordinate={{ latitude: places.at(-1)!.lat, longitude: places.at(-1)!.lng }} description="Ride destination" pinColor={colors.navyStrong} title={places.at(-1)!.label} />
      </MapView>
      {status === "loading" ? <View style={styles.status}><ActivityIndicator color={colors.steel} /><Text style={styles.statusText}>Loading route…</Text></View> : null}
      {status === "error" ? <Text accessibilityRole="alert" style={styles.fallback}>Approximate route</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.ice, borderColor: semanticColors.app.border, borderRadius: radii.lg, borderWidth: 1, height: 190, overflow: "hidden" },
  originBadge: { alignItems: "center", backgroundColor: colors.white, borderColor: semanticColors.app.border, borderRadius: radii.pill, borderWidth: 1, height: 38, justifyContent: "center", width: 38 },
  originImage: { height: 32, width: 32 },
  status: { alignItems: "center", alignSelf: "center", backgroundColor: semanticColors.app.surface, borderRadius: radii.pill, flexDirection: "row", gap: spacing[2], marginTop: spacing[3], paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  statusText: { color: semanticColors.text.primary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  fallback: { alignSelf: "flex-end", backgroundColor: semanticColors.app.surface, borderRadius: radii.pill, color: semanticColors.text.muted, fontSize: typography.fontSize.xs, margin: spacing[3], overflow: "hidden", paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
});
