import type { Place, Ride, RideFilters } from "./types";

export const DISCOVERY_PROXIMITY_METERS = 10_000;

function distanceMeters(left: Pick<Place, "lat" | "lng">, right: Pick<Place, "lat" | "lng">) {
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

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isNearby(left: Place, right: Place) {
  return distanceMeters(left, right) <= DISCOVERY_PROXIMITY_METERS;
}

export function rideMatchesDiscoveryRoute(ride: Ride, filters: RideFilters) {
  if (filters.pickupPlace && !isNearby(ride.origin, filters.pickupPlace)) return false;

  const routePoints = [...ride.stops, ride.destination];
  if (filters.routePointPlace) {
    return routePoints.some((place) => isNearby(place, filters.routePointPlace!));
  }
  if (filters.destinationQuery) {
    const query = normalizeQuery(filters.destinationQuery);
    return routePoints.some((place) => normalizeQuery(place.label).includes(query));
  }
  return true;
}
