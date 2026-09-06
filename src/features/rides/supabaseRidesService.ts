import { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../types/database';
import { DEFAULT_DISPLAY_TIMEZONE, type DriverSummary, type Place, type Ride, type RideFilters, type RideDraftInput, type RideSeed, type RidesService, type RouteSummary, type VehicleSummary } from './types';

export type RideListingRow = Database['public']['Views']['ride_listings']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type VehiclePublicRow = Database['public']['Views']['vehicles_public']['Row'];
type RideStopRow = Database['public']['Tables']['ride_stops']['Row'];

export interface SupabaseRideQuerySource {
  listRideListings(query: { nowIso: string; filters: RideFilters }): Promise<RideListingRow[]>;
  getRideListing(id: string): Promise<RideListingRow | null>;
  getProfiles(ids: string[]): Promise<ProfileRow[]>;
  getVehicles(ids: string[]): Promise<VehiclePublicRow[]>;
  getStops(rideIds: string[]): Promise<RideStopRow[]>;
}

function fail(message: string): never {
  throw new Error(message);
}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function compareRides(left: Ride, right: Ride) {
  const byDeparture = left.departureAt.localeCompare(right.departureAt);
  if (byDeparture !== 0) return byDeparture;
  const byDestination = left.destination.label.localeCompare(right.destination.label);
  if (byDestination !== 0) return byDestination;
  return left.id.localeCompare(right.id);
}

function deriveInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.length === 0 ? name.slice(0, 2).toUpperCase() : parts.map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase();
}

function mapDriver(profile: ProfileRow): DriverSummary {
  return {
    id: profile.id,
    name: profile.first_name,
    initials: deriveInitials(profile.first_name),
    verificationStatus: profile.verification_status,
    ratingAverage: profile.rating_average,
    completedRideCount: profile.completed_ride_count,
  };
}

function mapVehicle(vehicle: VehiclePublicRow): VehicleSummary {
  if (vehicle.make == null || vehicle.model == null || vehicle.color == null || vehicle.seat_count == null) {
    fail(`Vehicle ${vehicle.id ?? '(unknown)'} is missing public fields.`);
  }

  return {
    id: vehicle.id ?? fail('Vehicle is missing id.'),
    label: [vehicle.make, vehicle.model, vehicle.color].join(' · '),
    seatCount: vehicle.seat_count,
  };
}

function mapPlaceFromStop(stop: RideStopRow): Place {
  return {
    id: stop.id,
    label: stop.label,
    lat: stop.lat,
    lng: stop.lng,
  };
}

function mapRouteSummary(row: RideListingRow): RouteSummary | null {
  if (row.distance_meters == null || row.duration_seconds == null) {
    return null;
  }

  return {
    distanceMeters: row.distance_meters,
    durationSeconds: row.duration_seconds,
  };
}

function mapRide(row: RideListingRow, context: { drivers: Map<string, ProfileRow>; vehicles: Map<string, VehiclePublicRow>; stops: RideStopRow[] }): Ride {
  const driver = context.drivers.get(row.driver_id);
  if (!driver) {
    fail(`Missing driver profile for ride ${row.id}.`);
  }

  const vehicle = context.vehicles.get(row.vehicle_id);
  if (!vehicle) {
    fail(`Missing vehicle summary for ride ${row.id}.`);
  }

  const rideStops = context.stops
    .filter((stop) => stop.ride_id === row.id)
    .sort((left, right) => left.sequence - right.sequence)
    .map(mapPlaceFromStop);

  if (row.remaining_seats == null) {
    fail(`Ride ${row.id} is missing derived remaining_seats.`);
  }
  if (row.display_timezone !== DEFAULT_DISPLAY_TIMEZONE) {
    fail(`Ride ${row.id} must use ${DEFAULT_DISPLAY_TIMEZONE} as its display timezone.`);
  }

  return {
    id: row.id,
    driver: mapDriver(driver),
    vehicle: mapVehicle(vehicle),
    origin: { id: row.origin_label, label: row.origin_label, lat: row.origin_lat, lng: row.origin_lng },
    destination: { id: row.destination_label, label: row.destination_label, lat: row.destination_lat, lng: row.destination_lng },
    stops: rideStops,
    routeSummary: mapRouteSummary(row),
    departureAt: row.departure_at,
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: row.capacity,
    remainingSeats: row.remaining_seats,
    status: row.status,
    priceCents: row.price_cents,
    priceSource: row.price_source,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function unique(values: string[]) {
  return [...new Set(values)].filter(Boolean);
}

function mutationBlockedError() {
  return new Error(
    'Live Supabase ride create/update is intentionally blocked here because the schema does not expose an atomic ride + ride_stops mutation RPC. Use the fixture service for writes until E adds a safe backend mutation.',
  );
}

function getDefaultSupabaseClient() {
  return require('../../lib/supabase').supabase as SupabaseClient<Database>;
}

export function createSupabaseRideQuerySource(client: SupabaseClient<Database> = getDefaultSupabaseClient()): SupabaseRideQuerySource {
  return {
    async listRideListings({ nowIso, filters }) {
      let query = client
        .from('ride_listings')
        .select('*')
        .eq('status', 'scheduled')
        .gt('departure_at', nowIso);

      if (filters.destinationQuery) {
        query = query.ilike('destination_label', `%${normalizeQuery(filters.destinationQuery)}%`);
      }
      if (filters.departureAtGte) {
        query = query.gte('departure_at', filters.departureAtGte);
      }
      if (filters.departureAtLte) {
        query = query.lte('departure_at', filters.departureAtLte);
      }
      if (typeof filters.maxPriceCents === 'number') {
        query = query.lte('price_cents', filters.maxPriceCents);
      }
      if (typeof filters.minimumRemainingSeats === 'number') {
        query = query.gte('remaining_seats', filters.minimumRemainingSeats);
      }

      query = query.order('departure_at', { ascending: true }).order('destination_label', { ascending: true }).order('id', { ascending: true });

      const { data, error } = await query;
      if (error) fail(error.message);
      return (data ?? []) as RideListingRow[];
    },
    async getRideListing(id: string) {
      const { data, error } = await client.from('ride_listings').select('*').eq('id', id).maybeSingle();
      if (error) fail(error.message);
      return (data as RideListingRow | null | undefined) ?? null;
    },
    async getProfiles(ids: string[]) {
      if (ids.length === 0) return [];
      const { data, error } = await client.from('profiles').select('*').in('id', ids);
      if (error) fail(error.message);
      return (data ?? []) as ProfileRow[];
    },
    async getVehicles(ids: string[]) {
      if (ids.length === 0) return [];
      const { data, error } = await client.from('vehicles_public').select('*').in('id', ids);
      if (error) fail(error.message);
      return (data ?? []) as VehiclePublicRow[];
    },
    async getStops(rideIds: string[]) {
      if (rideIds.length === 0) return [];
      const { data, error } = await client.from('ride_stops').select('*').in('ride_id', rideIds).order('ride_id', { ascending: true }).order('sequence', { ascending: true });
      if (error) fail(error.message);
      return (data ?? []) as RideStopRow[];
    },
  };
}

export function createSupabaseRidesService(options?: { source?: SupabaseRideQuerySource; now?: () => Date | string }): RidesService {
  const source = options?.source ?? createSupabaseRideQuerySource();
  const readClock = () => {
    const value = options?.now ? options.now() : new Date();
    return value instanceof Date ? value : new Date(value);
  };

  async function hydrate(rows: RideListingRow[]) {
    const driverIds = unique(rows.map((row) => row.driver_id));
    const vehicleIds = unique(rows.map((row) => row.vehicle_id));
    const rideIds = rows.map((row) => row.id);

    const [drivers, vehicles, stops] = await Promise.all([
      source.getProfiles(driverIds),
      source.getVehicles(vehicleIds),
      source.getStops(rideIds),
    ]);

    const context = {
      drivers: new Map(drivers.map((driver) => [driver.id, driver] as const)),
      vehicles: new Map(vehicles.map((vehicle) => [vehicle.id ?? '', vehicle] as const)),
      stops,
    };

    return rows.map((row) => mapRide(row, context)).sort(compareRides);
  }

  return {
    async list(filters = {}) {
      const rows = await source.listRideListings({ nowIso: readClock().toISOString(), filters });
      return hydrate(rows);
    },
    async getById(id: string) {
      const row = await source.getRideListing(id);
      if (!row) return null;
      const rides = await hydrate([row]);
      return rides[0] ?? null;
    },
    async create() {
      throw mutationBlockedError();
    },
    async update() {
      throw mutationBlockedError();
    },
  };
}
