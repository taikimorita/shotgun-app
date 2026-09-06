import { calPoly, describeFixtureInventory, downtownSlo, fixtureNowIso, fixtureRideSeeds, sfo } from "../fixtures";
import { createRidesService, fixtureRidesService } from "../service";
import { DEFAULT_DISPLAY_TIMEZONE } from "../types";
import { assertRideDraftIsValid, validateRideDraft } from "../validation";

const service = createRidesService({ now: () => fixtureNowIso, seeds: fixtureRideSeeds });

function fail(message: string): never {
  throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    fail(message ?? `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    fail(message ?? `Expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertOk(value: unknown, message?: string) {
  if (!value) {
    fail(message ?? "Expected value to be truthy.");
  }
}

async function assertRejects(fn: () => Promise<unknown>, message?: string) {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  if (!rejected) {
    fail(message ?? "Expected promise to reject.");
  }
}

function makeDriver(overrides: Partial<typeof baseDriver> = {}) {
  return { ...baseDriver, ...overrides };
}

function makeVehicle(overrides: Partial<typeof baseVehicle> = {}) {
  return { ...baseVehicle, ...overrides };
}

function makeDraft(overrides: Record<string, unknown> = {}) {
  return { ...baseDraft(), ...overrides } as any;
}

const baseDriver = {
  id: "driver-maya-chen",
  name: "Maya Chen",
  initials: "MC",
  verificationStatus: "school_email" as const,
  ratingAverage: 4.9,
  completedRideCount: 28,
};

const baseVehicle = {
  id: "vehicle-maya-outback",
  label: "2022 Subaru Outback · Blue",
  seatCount: 3,
};

function baseDraft() {
  return {
    driver: makeDriver(),
    vehicle: makeVehicle(),
    origin: { ...calPoly },
    destination: { ...sfo },
    stops: [{ ...downtownSlo }],
    routeSummary: { distanceMeters: 370000, durationSeconds: 14400 },
    departureDate: "2026-09-06",
    departureTime: "09:00",
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 3,
    priceCents: 1250,
    priceSource: "suggested",
    notes: "Demo ride" as string | null,
  };
}

async function run() {
  fixtureRidesService.reset();

  const inventory = describeFixtureInventory();
  assertEqual(inventory.length, 4);
  assertEqual(inventory[0].id, "ride-maya-slo-sfo");
  assertEqual(inventory[0].departureAt, "2026-09-06T16:00:00.000Z");
  assertEqual(inventory[0].acceptedSeats, 1);

  const mayaRide = await service.getById("ride-maya-slo-sfo");
  assertEqual(mayaRide?.driver.verificationStatus, "school_email");
  assertEqual(mayaRide?.driver.ratingAverage, 4.9);
  assertEqual(mayaRide?.driver.completedRideCount, 28);

  const allScheduled = await service.list();
  assertEqual(allScheduled.length, 4);
  assertDeepEqual(
    allScheduled.map((ride) => ride.id),
    ["ride-maya-slo-sfo", "ride-jordan-slo-la", "ride-aria-slo-sb", "ride-maya-slo-monterey"],
  );

  const sfoRides = await service.list({ destinationQuery: "sfo" });
  assertDeepEqual(sfoRides.map((ride) => ride.id), ["ride-maya-slo-sfo"]);

  const highFareRides = await service.list({ maxPriceCents: 1000 });
  assertDeepEqual(highFareRides.map((ride) => ride.id), ["ride-aria-slo-sb"]);

  const seatsFiltered = await service.list({ minimumRemainingSeats: 2 });
  assertDeepEqual(
    seatsFiltered.map((ride) => ride.id),
    ["ride-maya-slo-sfo", "ride-jordan-slo-la", "ride-maya-slo-monterey"],
  );

  const dateFiltered = await service.list({
    departureAtGte: "2026-09-06T16:00:00.000Z",
    departureAtLte: "2026-09-06T16:00:00.000Z",
  });
  assertDeepEqual(dateFiltered.map((ride) => ride.id), ["ride-maya-slo-sfo"]);

  const boundaryService = createRidesService({
    now: () => fixtureNowIso,
    seeds: [
      { ...fixtureRideSeeds[0], id: "ride-at-clock", departureAt: fixtureNowIso },
      { ...fixtureRideSeeds[1], id: "ride-before-clock", departureAt: "2026-09-05T17:59:59.000Z" },
      { ...fixtureRideSeeds[2], id: "ride-after-clock", departureAt: "2026-09-05T18:00:01.000Z" },
    ],
  });
  assertDeepEqual((await boundaryService.list()).map((ride) => ride.id), ["ride-after-clock"]);

  const normalizedSummer = assertRideDraftIsValid(makeDraft(), { now: fixtureNowIso });
  assertEqual(normalizedSummer.departureAt, "2026-09-06T16:00:00.000Z");
  assertEqual(normalizedSummer.displayTimezone, DEFAULT_DISPLAY_TIMEZONE);

  const normalizedWinter = assertRideDraftIsValid(
    makeDraft({
      departureDate: "2026-12-06",
      departureTime: "09:00",
      notes: "Winter trip",
    }),
    { now: fixtureNowIso },
  );
  assertEqual(normalizedWinter.departureAt, "2026-12-06T17:00:00.000Z");

  const created = await service.create(makeDraft());
  assertEqual(created.status, "scheduled");
  assertEqual(created.departureAt, "2026-09-06T16:00:00.000Z");
  assertEqual(created.displayTimezone, DEFAULT_DISPLAY_TIMEZONE);
  assertEqual(created.remainingSeats, 3);
  assertEqual(created.driver.verificationStatus, "school_email");

  const createdLookup = await service.getById(created.id);
  assertEqual(createdLookup?.departureAt, "2026-09-06T16:00:00.000Z");
  assertEqual(createdLookup?.remainingSeats, 3);

  const invalidLocalDate = validateRideDraft(
    makeDraft({ departureDate: "2026-02-30", departureTime: "25:00" }),
    { now: fixtureNowIso },
  );
  assertEqual(invalidLocalDate.ok, false);
  if (!invalidLocalDate.ok) {
    assertOk(invalidLocalDate.errors.departureDate);
  }

  const invalidTimezone = validateRideDraft(makeDraft({ displayTimezone: "UTC" }), { now: fixtureNowIso });
  assertEqual(invalidTimezone.ok, false);
  if (!invalidTimezone.ok) {
    assertOk(invalidTimezone.errors.displayTimezone);
  }

  const invalidRating = validateRideDraft(makeDraft({ driver: makeDriver({ ratingAverage: Number.NaN }) }), {
    now: fixtureNowIso,
  });
  assertEqual(invalidRating.ok, false);
  if (!invalidRating.ok) {
    assertOk(invalidRating.errors.driver);
  }

  const coordinateLatitude = validateRideDraft(makeDraft({ origin: { ...calPoly, lat: 91 } }), {
    now: fixtureNowIso,
  });
  assertEqual(coordinateLatitude.ok, false);
  if (!coordinateLatitude.ok) {
    assertOk(coordinateLatitude.errors.origin);
  }

  const coordinateLongitude = validateRideDraft(makeDraft({ destination: { ...sfo, lng: -181 } }), {
    now: fixtureNowIso,
  });
  assertEqual(coordinateLongitude.ok, false);
  if (!coordinateLongitude.ok) {
    assertOk(coordinateLongitude.errors.destination);
  }

  const seatCountTooLarge = validateRideDraft(makeDraft({ vehicle: makeVehicle({ seatCount: 16 }) }), {
    now: fixtureNowIso,
  });
  assertEqual(seatCountTooLarge.ok, false);
  if (!seatCountTooLarge.ok) {
    assertOk(seatCountTooLarge.errors.vehicle);
  }

  const capacityTooLarge = validateRideDraft(
    makeDraft({
      vehicle: makeVehicle({ seatCount: 2 }),
      capacity: 3,
    }),
    { now: fixtureNowIso },
  );
  assertEqual(capacityTooLarge.ok, false);
  if (!capacityTooLarge.ok) {
    assertOk(capacityTooLarge.errors.capacity);
  }

  const notes500 = validateRideDraft(makeDraft({ notes: "a".repeat(500) }), { now: fixtureNowIso });
  assertEqual(notes500.ok, true);

  const notes501 = validateRideDraft(makeDraft({ notes: "a".repeat(501) }), { now: fixtureNowIso });
  assertEqual(notes501.ok, false);
  if (!notes501.ok) {
    assertOk(notes501.errors.notes);
  }

  const edited = await service.update(
    "ride-maya-slo-sfo",
    "driver-maya-chen",
    makeDraft({
      departureTime: "09:30",
      priceCents: 1400,
      priceSource: "driver_set",
      notes: null,
    }),
  );
  assertEqual(edited.departureAt, "2026-09-06T16:30:00.000Z");
  assertEqual(edited.priceCents, 1400);
  assertEqual(edited.priceSource, "driver_set");

  await assertRejects(() =>
    service.update("ride-maya-slo-sfo", "driver-jordan-rivera", {
      driver: {
        id: "driver-jordan-rivera",
        name: "Jordan Rivera",
        initials: "JR",
        verificationStatus: "school_email",
        ratingAverage: 4.8,
        completedRideCount: 16,
      },
      vehicle: {
        id: "vehicle-jordan-crv",
        label: "2021 Honda CR-V · Silver",
        seatCount: 4,
      },
      origin: { ...calPoly },
      destination: { ...sfo },
      stops: [],
      departureDate: "2026-09-06",
      departureTime: "10:00",
      capacity: 4,
      priceCents: 1800,
    }),
  );

  console.log("rides service tests passed");
}

run().catch((error) => {
  console.error(error);
  throw error;
});
