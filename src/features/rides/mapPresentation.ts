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
