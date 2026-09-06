import type { Place, Ride } from "./types";

export function uniqueRideDestinations(rides: readonly Ride[]) {
  const seen = new Set<string>();
  return rides.flatMap((ride) => {
    if (ride.status !== "scheduled" || ride.remainingSeats <= 0) return [];
    const key = `${ride.destination.lat.toFixed(5)}:${ride.destination.lng.toFixed(5)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ ...ride.destination }];
  });
}

export const NEAR_DESTINATION_METERS = 80_000;

export function distanceMeters(from: Pick<Place, "lat" | "lng">, to: Pick<Place, "lat" | "lng">) {
  const radians = Math.PI / 180;
  const lat1 = from.lat * radians;
  const lat2 = to.lat * radians;
  const deltaLat = (to.lat - from.lat) * radians;
  const deltaLng = (to.lng - from.lng) * radians;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function rideDistanceToDestination(ride: Pick<Ride, "destination" | "stops">, destination: Place) {
  return Math.min(distanceMeters(ride.destination, destination), ...ride.stops.map((stop) => distanceMeters(stop, destination)));
}

export function ridesNearDestination(
  rides: readonly Ride[],
  destination: Place,
  maxMeters = NEAR_DESTINATION_METERS,
) {
  return rides
    .map((ride) => ({ distance: rideDistanceToDestination(ride, destination), ride }))
    .filter((entry) => entry.distance <= maxMeters)
    .sort((left, right) => left.distance - right.distance || left.ride.departureAt.localeCompare(right.ride.departureAt))
    .map((entry) => entry.ride);
}

export function regionForPlaces(places: readonly Place[]) {
  if (!places.length) return { latitude: 35.305, longitude: -120.6625, latitudeDelta: 0.12, longitudeDelta: 0.12 };
  const lats = places.map((place) => place.lat);
  const lngs = places.map((place) => place.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.12, (maxLat - minLat) * 1.35),
    longitudeDelta: Math.max(0.12, (maxLng - minLng) * 1.35),
  };
}
