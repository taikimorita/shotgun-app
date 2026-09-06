import { calPoly, downtownSlo, losAngeles, monterey, santaBarbara, sfo } from "./fixtures";
import { Place, RouteSummary } from "./types";
import { clonePlace, cloneRouteSummary, createRouteKey, MapsService, MockMapsServiceOptions, normalizeMapsQuery } from "../../lib/maps";

type DemoPlace = {
  place: Place;
  aliases: string[];
};

const demoPlaces: DemoPlace[] = [
  { place: calPoly, aliases: ["cal poly", "calpoly", "san luis obispo", "slo", "cal poly slo"] },
  { place: downtownSlo, aliases: ["downtown", "downtown slo", "downtown san luis obispo", "slo"] },
  { place: sfo, aliases: ["sfo", "san francisco international airport", "san francisco airport"] },
  { place: losAngeles, aliases: ["los angeles", "union station", "la"] },
  { place: santaBarbara, aliases: ["santa barbara", "state street", "sb"] },
  { place: monterey, aliases: ["monterey", "cannery row"] },
];

export const defaultDemoPlaces = demoPlaces.map((entry) => clonePlace(entry.place));

const demoRoutes = new Map<string, RouteSummary>([
  [
    createRouteKey([calPoly, downtownSlo, sfo]),
    {
      distanceMeters: 370000,
      durationSeconds: 14400,
    },
  ],
  [
    createRouteKey([calPoly, sfo]),
    {
      distanceMeters: 368000,
      durationSeconds: 13800,
    },
  ],
  [
    createRouteKey([calPoly, downtownSlo]),
    {
      distanceMeters: 22000,
      durationSeconds: 1500,
    },
  ],
  [
    createRouteKey([downtownSlo, sfo]),
    {
      distanceMeters: 347000,
      durationSeconds: 13200,
    },
  ],
]);

function pause(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function scorePlace(place: DemoPlace, query: string) {
  const normalizedLabel = normalizeMapsQuery(place.place.label);
  const exactAlias = place.aliases.find((alias) => normalizeMapsQuery(alias) === query);
  if (normalizedLabel === query) {
    return 0;
  }
  if (exactAlias) {
    return 1;
  }
  const aliasMatch = place.aliases.some((alias) => {
    const normalizedAlias = normalizeMapsQuery(alias);
    return normalizedAlias.includes(query) || query.includes(normalizedAlias);
  });
  if (aliasMatch || normalizedLabel.includes(query) || query.includes(normalizedLabel)) {
    return 2;
  }
  return Number.POSITIVE_INFINITY;
}

function estimateRoute(stops: readonly Place[]): RouteSummary {
  let distanceMeters = 0;
  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];
    const radians = Math.PI / 180;
    const lat1 = previous.lat * radians;
    const lat2 = current.lat * radians;
    const deltaLat = (current.lat - previous.lat) * radians;
    const deltaLng = (current.lng - previous.lng) * radians;
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceMeters += 6371000 * c;
  }

  return {
    distanceMeters: Math.round(distanceMeters),
    durationSeconds: Math.max(300, Math.round((distanceMeters / 1609.344 / 42) * 3600)),
  };
}

function resolveFailure(failureMode: MockMapsServiceOptions["failureMode"], kind: "search" | "route") {
  return failureMode === "all" || failureMode === kind;
}

export function createMockMapsService(options: MockMapsServiceOptions = {}): MapsService {
  const delayMs = options.delayMs ?? 120;
  const failureMode = options.failureMode;

  return {
    async searchPlaces(query: string) {
      if (resolveFailure(failureMode, "search")) {
        throw new Error("Mock maps search is unavailable.");
      }
      await pause(delayMs);

      const normalizedQuery = normalizeMapsQuery(query);
      if (!normalizedQuery) {
        return [];
      }

      return demoPlaces
        .map((entry, index) => ({ entry, index, score: scorePlace(entry, normalizedQuery) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((left, right) => left.score - right.score || left.index - right.index)
        .map(({ entry }) => clonePlace(entry.place));
    },
    async getRoute(stops: Place[]) {
      if (resolveFailure(failureMode, "route")) {
        throw new Error("Mock maps routing is unavailable.");
      }
      await pause(delayMs);

      if (stops.length < 2) {
        throw new Error("At least two places are required to build a route.");
      }

      const exactRoute = demoRoutes.get(createRouteKey(stops));
      const summary = exactRoute ? cloneRouteSummary(exactRoute) : estimateRoute(stops);
      return { ...summary, path: stops.map(({ lat, lng }) => ({ lat, lng })) };
    },
  };
}
