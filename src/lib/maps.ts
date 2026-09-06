/**
 * Provider-neutral maps boundary. Screens and UI components only import these
 * types; a provider adapter can be swapped in without changing their code.
 */
export type Coordinates = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type Place = Readonly<{
  id: string;
  label: string;
  coordinates: Coordinates;
}>;

export type RouteSummary = Readonly<{
  distanceMeters: number;
  durationSeconds: number;
}>;

export type MapsService = Readonly<{
  searchPlaces(query: string): Promise<readonly Place[]>;
  getRoute(origin: Place, destination: Place): Promise<RouteSummary>;
}>;
