import { MapsService, Place, RouteSummary } from '../../lib/maps';

const MOCK_DELAY_MS = 180;

export const mockPlaces: readonly Place[] = [
  {
    id: 'cal-poly-campus',
    label: 'Cal Poly San Luis Obispo',
    coordinates: { latitude: 35.3050, longitude: -120.6625 },
  },
  {
    id: 'downtown-slo',
    label: 'Downtown San Luis Obispo',
    coordinates: { latitude: 35.2828, longitude: -120.6596 },
  },
  {
    id: 'sfo',
    label: 'San Francisco International Airport',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
  },
] as const;

const demoRoute: RouteSummary = {
  distanceMeters: 370_000,
  durationSeconds: 14_400,
};

function delay() {
  return new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function normalizedTokens(value: string) {
  return value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

function routeKey(origin: Place, destination: Place) {
  return `${origin.id}:${destination.id}`;
}

const routesByPlacePair: Readonly<Record<string, RouteSummary>> = {
  'cal-poly-campus:sfo': demoRoute,
  'sfo:cal-poly-campus': demoRoute,
  'cal-poly-campus:downtown-slo': { distanceMeters: 4_000, durationSeconds: 720 },
  'downtown-slo:cal-poly-campus': { distanceMeters: 4_000, durationSeconds: 720 },
};

function estimatedRoute(origin: Place, destination: Place): RouteSummary {
  // A deterministic local fallback for custom fixture places. Values are still
  // provider-neutral meters and seconds, never display-formatted strings.
  const latitudeDelta = origin.coordinates.latitude - destination.coordinates.latitude;
  const longitudeDelta = origin.coordinates.longitude - destination.coordinates.longitude;
  const distanceMeters = Math.max(1_000, Math.round(Math.hypot(latitudeDelta * 111_000, longitudeDelta * 91_000) / 1_000) * 1_000);
  return { distanceMeters, durationSeconds: Math.round(distanceMeters / 25) };
}

/**
 * Fixture-only service for UI development and deterministic demos.
 * Entering "error" intentionally exercises the picker's error state.
 */
export const mockMapsService: MapsService = {
  async searchPlaces(query) {
    await delay();
    const tokens = normalizedTokens(query);
    if (tokens.includes('error')) {
      throw new Error('Place search is temporarily unavailable.');
    }
    if (tokens.length === 0) return [];

    return mockPlaces.filter((place) => {
      const searchable = `${place.label} ${place.id}`.toLocaleLowerCase();
      return tokens.every((token) => searchable.includes(token));
    });
  },
  async getRoute(origin, destination) {
    await delay();
    return routesByPlacePair[routeKey(origin, destination)] ?? estimatedRoute(origin, destination);
  },
};

export const demoRoutePlaces = {
  origin: mockPlaces[0],
  destination: mockPlaces[2],
} as const;
