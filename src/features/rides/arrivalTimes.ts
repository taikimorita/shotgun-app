import type { Place, RouteSummary } from "./types";

function distanceBetween(left: Place, right: Place) {
  const radians = Math.PI / 180;
  const lat1 = left.lat * radians;
  const lat2 = right.lat * radians;
  const deltaLat = (right.lat - left.lat) * radians;
  const deltaLng = (right.lng - left.lng) * radians;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function proportionalLegDurations(places: readonly Place[], totalDurationSeconds: number) {
  const distances = places.slice(1).map((place, index) => distanceBetween(places[index], place));
  const totalDistance = distances.reduce((total, distance) => total + distance, 0);
  let allocated = 0;
  return distances.map((distance, index) => {
    const duration = index === distances.length - 1
      ? Math.max(0, Math.round(totalDurationSeconds - allocated))
      : Math.round(totalDistance > 0 ? totalDurationSeconds * distance / totalDistance : totalDurationSeconds / distances.length);
    allocated += duration;
    return duration;
  });
}

export function estimateWaypointArrivalTimes(
  departureAt: string,
  places: readonly Place[],
  routeSummary: RouteSummary | null,
) {
  const departureTime = new Date(departureAt).getTime();
  if (!Number.isFinite(departureTime) || places.length < 2 || !routeSummary) return [];

  const legCount = places.length - 1;
  const durations = routeSummary.legDurationsSeconds?.length === legCount
    ? routeSummary.legDurationsSeconds
    : proportionalLegDurations(places, routeSummary.durationSeconds);
  let elapsedSeconds = 0;
  return [departureAt, ...durations.map((duration) => {
    elapsedSeconds += duration;
    return new Date(departureTime + elapsedSeconds * 1000).toISOString();
  })];
}
