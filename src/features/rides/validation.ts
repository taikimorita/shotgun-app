import {
  DEFAULT_DISPLAY_TIMEZONE,
  DriverSummary,
  MAX_RIDE_STOPS,
  NormalizedRideDraft,
  Place,
  RideDraftErrors,
  RideDraftInput,
  RouteSummary,
  VerificationStatus,
  VehicleSummary,
  ValidationResult,
} from "./types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

type HelperResult<T> = { value: T } | { error: string };

const VERIFICATION_STATUSES: VerificationStatus[] = ["unverified", "school_email", "manual_review"];

function normalizeNonEmptyText(value: unknown, field: string): HelperResult<string> {
  if (typeof value !== "string") {
    return { error: `${field} is required.` };
  }
  const normalized = value.trim();
  if (!normalized) {
    return { error: `${field} is required.` };
  }
  return { value: normalized };
}

function parseIntegerField(value: number | string, field: string): HelperResult<number> {
  const parsed = typeof value === "number" ? value : Number(value.trim());
  if (!Number.isInteger(parsed)) {
    return { error: `${field} must be an integer.` };
  }
  return { value: parsed };
}

function parseBoundedIntegerField(value: number | string, field: string, min: number, max: number): HelperResult<number> {
  const parsed = typeof value === "number" ? value : Number(value.trim());
  if (!Number.isInteger(parsed)) {
    return { error: `${field} must be an integer.` };
  }
  if (parsed < min || parsed > max) {
    return { error: `${field} must be between ${min} and ${max}.` };
  }
  return { value: parsed };
}

function validateDriver(driver: DriverSummary | undefined | null): HelperResult<DriverSummary> {
  if (!driver || typeof driver !== "object") {
    return { error: "driver is required." };
  }

  const id = normalizeNonEmptyText(driver.id, "driver.id");
  if ("error" in id) {
    return { error: id.error };
  }

  const name = normalizeNonEmptyText(driver.name, "driver.name");
  if ("error" in name) {
    return { error: name.error };
  }

  const initials = normalizeNonEmptyText(driver.initials, "driver.initials");
  if ("error" in initials) {
    return { error: initials.error };
  }

  if (!VERIFICATION_STATUSES.includes(driver.verificationStatus)) {
    return { error: "driver.verificationStatus must be a valid verification status." };
  }
  if (
    driver.ratingAverage != null &&
    (typeof driver.ratingAverage !== "number" ||
      !Number.isFinite(driver.ratingAverage) ||
      driver.ratingAverage < 0 ||
      driver.ratingAverage > 5)
  ) {
    return { error: "driver.ratingAverage must be null or between 0 and 5." };
  }
  if (
    driver.completedRideCount != null &&
    (!Number.isInteger(driver.completedRideCount) || driver.completedRideCount < 0)
  ) {
    return { error: "driver.completedRideCount must be null or a non-negative integer." };
  }

  return {
    value: {
      ...driver,
      id: id.value,
      name: name.value,
      initials: initials.value,
    },
  };
}

function validateVehicle(vehicle: VehicleSummary | undefined | null): HelperResult<VehicleSummary> {
  if (!vehicle || typeof vehicle !== "object") {
    return { error: "vehicle is required." };
  }

  const id = normalizeNonEmptyText(vehicle.id, "vehicle.id");
  if ("error" in id) {
    return { error: id.error };
  }

  const label = normalizeNonEmptyText(vehicle.label, "vehicle.label");
  if ("error" in label) {
    return { error: label.error };
  }

  const seatCount = parseBoundedIntegerField(vehicle.seatCount, "vehicle.seatCount", 1, 15);
  if ("error" in seatCount) {
    return { error: seatCount.error };
  }

  return {
    value: {
      ...vehicle,
      id: id.value,
      label: label.value,
      seatCount: seatCount.value,
    },
  };
}

function validatePlace(place: Place | undefined | null, field: "origin" | "destination" | "stops"): HelperResult<Place> {
  if (!place || typeof place !== "object") {
    return { error: `${field} is required.` };
  }

  const id = normalizeNonEmptyText(place.id, `${field}.id`);
  if ("error" in id) {
    return { error: id.error };
  }

  const label = normalizeNonEmptyText(place.label, `${field}.label`);
  if ("error" in label) {
    return { error: label.error };
  }

  if (!isFiniteNumber(place.lat) || !isFiniteNumber(place.lng)) {
    return { error: `${field} needs valid coordinates.` };
  }
  if (place.lat < -90 || place.lat > 90 || place.lng < -180 || place.lng > 180) {
    return { error: `${field} coordinates must be within valid latitude/longitude bounds.` };
  }

  return {
    value: {
      ...place,
      id: id.value,
      label: label.value,
    },
  };
}

function validateRouteSummary(routeSummary: RouteSummary | null | undefined): HelperResult<RouteSummary | null> {
  if (routeSummary == null) {
    return { value: null };
  }
  if (!isFiniteNumber(routeSummary.distanceMeters) || routeSummary.distanceMeters < 0) {
    return { error: "routeSummary.distanceMeters must be a non-negative number." };
  }
  if (!isFiniteNumber(routeSummary.durationSeconds) || routeSummary.durationSeconds < 0) {
    return { error: "routeSummary.durationSeconds must be a non-negative number." };
  }
  if (
    routeSummary.legDurationsSeconds != null &&
    (!Array.isArray(routeSummary.legDurationsSeconds) ||
      !routeSummary.legDurationsSeconds.every((duration) => isFiniteNumber(duration) && duration >= 0))
  ) {
    return { error: "routeSummary.legDurationsSeconds must contain non-negative numbers." };
  }
  return {
    value: {
      ...routeSummary,
      legDurationsSeconds: routeSummary.legDurationsSeconds?.slice(),
    },
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

function parseLocalDateTime(datePart: string, timePart: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timePart);
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  if (hour < 0 || hour > 23) {
    return null;
  }
  if (minute < 0 || minute > 59) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function localPartsMatch(
  utcMillis: number,
  localDateTime: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone: string,
) {
  const parts = getTimeZoneParts(new Date(utcMillis), timeZone);
  return (
    parts.year === localDateTime.year &&
    parts.month === localDateTime.month &&
    parts.day === localDateTime.day &&
    parts.hour === localDateTime.hour &&
    parts.minute === localDateTime.minute
  );
}

function getOffsetMinutes(utcDate: Date, timeZone: string) {
  const parts = getTimeZoneParts(utcDate, timeZone);
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (wallClockAsUtc - utcDate.getTime()) / 60000;
}

function toUtcIso(datePart: string, timePart: string, timeZone: string): string | null {
  const localDateTime = parseLocalDateTime(datePart, timePart);
  if (!localDateTime) {
    return null;
  }

  const localMillis = Date.UTC(localDateTime.year, localDateTime.month - 1, localDateTime.day, localDateTime.hour, localDateTime.minute, 0, 0);
  let candidate = localMillis;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (localPartsMatch(candidate, localDateTime, timeZone)) {
      return new Date(candidate).toISOString();
    }
    const offsetMinutes = getOffsetMinutes(new Date(candidate), timeZone);
    const nextCandidate = localMillis - offsetMinutes * 60_000;
    if (nextCandidate === candidate) {
      break;
    }
    candidate = nextCandidate;
  }

  return localPartsMatch(candidate, localDateTime, timeZone) ? new Date(candidate).toISOString() : null;
}

function comparePlaces(left: Place, right: Place) {
  return left.id === right.id || (Math.abs(left.lat - right.lat) < 0.000001 && Math.abs(left.lng - right.lng) < 0.000001);
}

export function validateRideDraft(
  draft: RideDraftInput,
  options?: { now?: Date | string },
): ValidationResult<NormalizedRideDraft> {
  const errors: RideDraftErrors = {};

  const driver = validateDriver(draft.driver);
  let normalizedDriver: DriverSummary | null = null;
  if ("error" in driver) {
    errors.driver = driver.error;
  } else {
    normalizedDriver = driver.value;
  }

  const vehicle = validateVehicle(draft.vehicle);
  let normalizedVehicle: VehicleSummary | null = null;
  if ("error" in vehicle) {
    errors.vehicle = vehicle.error;
  } else {
    normalizedVehicle = vehicle.value;
  }

  const origin = validatePlace(draft.origin, "origin");
  let normalizedOrigin: Place | null = null;
  if ("error" in origin) {
    errors.origin = origin.error;
  } else {
    normalizedOrigin = origin.value;
  }

  const destination = validatePlace(draft.destination, "destination");
  let normalizedDestination: Place | null = null;
  if ("error" in destination) {
    errors.destination = destination.error;
  } else {
    normalizedDestination = destination.value;
  }

  if (normalizedOrigin && normalizedDestination && comparePlaces(normalizedOrigin, normalizedDestination)) {
    errors.destination = "Destination must differ from origin.";
  }

  const stops = Array.isArray(draft.stops) ? draft.stops : [];
  const normalizedStops: Place[] = [];
  if (stops.length > MAX_RIDE_STOPS) {
    errors.stops = `A ride can have up to ${MAX_RIDE_STOPS} stops.`;
  }
  for (const stop of stops) {
    if (errors.stops) break;
    const validatedStop = validatePlace(stop, "stops");
    if ("error" in validatedStop) {
      errors.stops = validatedStop.error;
      break;
    }
    if (
      (normalizedOrigin && comparePlaces(validatedStop.value, normalizedOrigin)) ||
      (normalizedDestination && comparePlaces(validatedStop.value, normalizedDestination))
    ) {
      errors.stops = "Stops must differ from the origin and destination.";
      break;
    }
    if (normalizedStops.some((existing) => comparePlaces(existing, validatedStop.value))) {
      errors.stops = "Each stop can appear only once.";
      break;
    }
    normalizedStops.push(validatedStop.value);
  }

  const departureTimezone = draft.displayTimezone ?? DEFAULT_DISPLAY_TIMEZONE;
  if (departureTimezone !== DEFAULT_DISPLAY_TIMEZONE) {
    errors.displayTimezone = `displayTimezone must be ${DEFAULT_DISPLAY_TIMEZONE}.`;
  }

  const departureAt =
    typeof draft.departureDate === "string" && typeof draft.departureTime === "string" && !errors.displayTimezone
      ? toUtcIso(draft.departureDate, draft.departureTime, departureTimezone)
      : null;
  if (!departureAt) {
    errors.departureDate = "departureDate and departureTime must be a valid local date and time.";
  } else if (options?.now) {
    const nowIso = options.now instanceof Date ? options.now.toISOString() : new Date(options.now).toISOString();
    if (departureAt <= nowIso) {
      errors.departureDate = "Departure must be in the future.";
    }
  }

  const capacity = parseBoundedIntegerField(draft.capacity, "capacity", 1, 15);
  let normalizedCapacity = 0;
  if ("error" in capacity) {
    errors.capacity = capacity.error;
  } else {
    normalizedCapacity = capacity.value;
  }

  const priceCents = parseIntegerField(draft.priceCents, "priceCents");
  let normalizedPriceCents = 0;
  if ("error" in priceCents) {
    errors.priceCents = priceCents.error;
  } else if (priceCents.value < 0) {
    errors.priceCents = "priceCents cannot be negative.";
  } else {
    normalizedPriceCents = priceCents.value;
  }

  const notes = typeof draft.notes === "string" ? draft.notes.trim() : "";
  if (notes.length > 500) {
    errors.notes = "notes must be 500 characters or fewer.";
  }

  const routeSummary = validateRouteSummary(draft.routeSummary);
  let normalizedRouteSummary: RouteSummary | null = null;
  if ("error" in routeSummary) {
    errors.routeSummary = routeSummary.error;
  } else {
    normalizedRouteSummary = routeSummary.value;
    if (
      normalizedRouteSummary?.legDurationsSeconds &&
      normalizedRouteSummary.legDurationsSeconds.length !== normalizedStops.length + 1
    ) {
      errors.routeSummary = "Route timing must include one duration for each waypoint pair.";
    }
  }

  if (!("error" in capacity) && normalizedVehicle && capacity.value > normalizedVehicle.seatCount) {
    errors.capacity = "capacity cannot exceed the vehicle seat count.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      driver: normalizedDriver!,
      vehicle: normalizedVehicle!,
      origin: normalizedOrigin!,
      destination: normalizedDestination!,
      stops: normalizedStops,
      routeSummary: normalizedRouteSummary,
      departureAt: departureAt!,
      displayTimezone: departureTimezone as typeof DEFAULT_DISPLAY_TIMEZONE,
      capacity: normalizedCapacity,
      priceCents: normalizedPriceCents,
      priceSource: draft.priceSource ?? "suggested",
      notes: notes.length > 0 ? notes : null,
    },
  };
}

export function assertRideDraftIsValid(
  draft: RideDraftInput,
  options?: { now?: Date | string },
): NormalizedRideDraft {
  const result = validateRideDraft(draft, options);
  if (!result.ok) {
    throw new Error(Object.entries(result.errors).map(([field, message]) => `${field}: ${message}`).join("; "));
  }
  return result.value;
}
