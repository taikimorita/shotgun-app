import { fixtureNowIso, fixtureRideSeeds } from "./fixtures";
import {
  DEFAULT_DISPLAY_TIMEZONE,
  FixtureRidesService,
  NormalizedRideDraft,
  Place,
  Ride,
  RideFilters,
  RideSeed,
  RidesService,
  RouteSummary,
} from "./types";
import { assertRideDraftIsValid } from "./validation";
import { rideMatchesDiscoveryRoute } from "./routeMatching";

function clonePlace(place: Place): Place {
  return { ...place };
}

function cloneRouteSummary(routeSummary: RouteSummary): RouteSummary {
  return {
    ...routeSummary,
    legDurationsSeconds: routeSummary.legDurationsSeconds?.slice(),
    path: routeSummary.path?.map((point) => ({ ...point })),
  };
}

function cloneRide(ride: Ride): Ride {
  return {
    ...ride,
    driver: { ...ride.driver },
    vehicle: { ...ride.vehicle },
    origin: clonePlace(ride.origin),
    destination: clonePlace(ride.destination),
    stops: ride.stops.map(clonePlace),
    routeSummary: ride.routeSummary ? cloneRouteSummary(ride.routeSummary) : null,
  };
}

function cloneSeed(seed: RideSeed): RideSeed {
  return {
    ...seed,
    driver: { ...seed.driver },
    vehicle: { ...seed.vehicle },
    origin: clonePlace(seed.origin),
    destination: clonePlace(seed.destination),
    stops: seed.stops.map(clonePlace),
    routeSummary: seed.routeSummary ? cloneRouteSummary(seed.routeSummary) : null,
    bookings: seed.bookings.map((booking) => ({ ...booking })),
  };
}

function countAcceptedSeats(bookings: RideSeed["bookings"]) {
  return bookings
    .filter((booking) => booking.status === "accepted")
    .reduce((sum, booking) => sum + booking.seats, 0);
}

function toRide(seed: RideSeed): Ride {
  return {
    id: seed.id,
    driver: { ...seed.driver },
    vehicle: { ...seed.vehicle },
    origin: clonePlace(seed.origin),
    destination: clonePlace(seed.destination),
    stops: seed.stops.map(clonePlace),
    routeSummary: seed.routeSummary ? cloneRouteSummary(seed.routeSummary) : null,
    departureAt: seed.departureAt,
    displayTimezone: seed.displayTimezone ?? DEFAULT_DISPLAY_TIMEZONE,
    capacity: seed.capacity,
    remainingSeats: seed.capacity - countAcceptedSeats(seed.bookings),
    status: seed.status,
    priceCents: seed.priceCents,
    priceSource: seed.priceSource,
    notes: seed.notes,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
  };
}

function matchesFilters(ride: Ride, filters: RideFilters) {
  if (!rideMatchesDiscoveryRoute(ride, filters)) return false;
  if (filters.departureAtGte && ride.departureAt < filters.departureAtGte) {
    return false;
  }
  if (filters.departureAtLte && ride.departureAt > filters.departureAtLte) {
    return false;
  }
  if (typeof filters.maxPriceCents === "number" && ride.priceCents > filters.maxPriceCents) {
    return false;
  }
  if (typeof filters.minimumRemainingSeats === "number" && ride.remainingSeats < filters.minimumRemainingSeats) {
    return false;
  }
  return true;
}

function isFutureRide(ride: Ride, serviceClockIso: string) {
  return ride.status === "scheduled" && ride.departureAt > serviceClockIso;
}

function sortRides(left: Ride, right: Ride) {
  const byDeparture = left.departureAt.localeCompare(right.departureAt);
  if (byDeparture !== 0) {
    return byDeparture;
  }
  const byDestination = left.destination.label.localeCompare(right.destination.label);
  if (byDestination !== 0) {
    return byDestination;
  }
  return left.id.localeCompare(right.id);
}

function createClock(now: (() => Date | string) | undefined) {
  return () => {
    const value = now ? now() : new Date(fixtureNowIso);
    return value instanceof Date ? value : new Date(value);
  };
}

function applyDraft(
  ride: RideSeed,
  normalizedDraft: NormalizedRideDraft,
  updatedAt: string,
): RideSeed {
  return {
    ...ride,
    driver: { ...normalizedDraft.driver },
    vehicle: { ...normalizedDraft.vehicle },
    origin: clonePlace(normalizedDraft.origin),
    destination: clonePlace(normalizedDraft.destination),
    stops: normalizedDraft.stops.map(clonePlace),
    routeSummary: normalizedDraft.routeSummary ? cloneRouteSummary(normalizedDraft.routeSummary) : null,
    departureAt: normalizedDraft.departureAt,
    displayTimezone: normalizedDraft.displayTimezone,
    capacity: normalizedDraft.capacity,
    priceCents: normalizedDraft.priceCents,
    priceSource: normalizedDraft.priceSource,
    notes: normalizedDraft.notes,
    updatedAt,
  };
}

export function createRidesService(options?: { now?: () => Date | string; seeds?: RideSeed[] }): FixtureRidesService {
  const readClock = createClock(options?.now);
  const initialSeeds = (options?.seeds ?? fixtureRideSeeds).map(cloneSeed);
  let rides = initialSeeds;
  let createdCount = 0;

  function snapshot() {
    return rides.map(toRide).sort(sortRides).map(cloneRide);
  }

  return {
    async list(filters = {}) {
      const serviceClockIso = readClock().toISOString();
      return snapshot().filter((ride) => isFutureRide(ride, serviceClockIso) && matchesFilters(ride, filters));
    },
    async getById(id: string) {
      const ride = snapshot().find((item) => item.id === id);
      return ride ?? null;
    },
    async create(draft) {
      const normalized = assertRideDraftIsValid(draft, { now: readClock() });
      const nowIso = readClock().toISOString();
      const record: RideSeed = {
        id: `ride-created-${createdCount + 1}`,
        driver: { ...normalized.driver },
        vehicle: { ...normalized.vehicle },
        origin: clonePlace(normalized.origin),
        destination: clonePlace(normalized.destination),
        stops: normalized.stops.map(clonePlace),
        routeSummary: normalized.routeSummary ? cloneRouteSummary(normalized.routeSummary) : null,
        departureAt: normalized.departureAt,
        displayTimezone: normalized.displayTimezone,
        capacity: normalized.capacity,
        status: "scheduled",
        priceCents: normalized.priceCents,
        priceSource: normalized.priceSource,
        notes: normalized.notes,
        bookings: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      createdCount += 1;
      rides = [...rides, record];
      return cloneRide(toRide(record));
    },
    async update(rideId: string, driverId: string, draft) {
      const current = rides.find((ride) => ride.id === rideId);
      if (!current) {
        throw new Error("Ride not found.");
      }
      if (current.driver.id !== driverId || draft.driver.id !== driverId) {
        throw new Error("Only the driver can edit this ride.");
      }
      if (current.status !== "scheduled") {
        throw new Error("Only scheduled rides can be edited.");
      }

      const normalized = assertRideDraftIsValid(draft, { now: readClock() });
      const acceptedSeats = countAcceptedSeats(current.bookings);
      if (normalized.capacity < acceptedSeats) {
        throw new Error("capacity cannot be lower than already accepted seats.");
      }

      const updatedAt = readClock().toISOString();
      const updated = applyDraft(current, normalized, updatedAt);
      rides = rides.map((ride) => (ride.id === rideId ? updated : ride));
      return cloneRide(toRide(updated));
    },
    reset() {
      rides = initialSeeds.map(cloneSeed);
      createdCount = 0;
    },
  };
}

export const fixtureRidesService = createRidesService({ now: () => fixtureNowIso });
