import { DEFAULT_DISPLAY_TIMEZONE, Ride, RideFilters } from "./types";

export interface DiscoveryFilterValues {
  destinationQuery: string;
  departureDate: string;
  maxPriceDollars: string;
  minimumRemainingSeats: string;
}

export const emptyDiscoveryFilters: DiscoveryFilterValues = {
  destinationQuery: "",
  departureDate: "",
  maxPriceDollars: "",
  minimumRemainingSeats: "",
};

export type DiscoveryFilterErrors = Partial<Record<keyof DiscoveryFilterValues, string>>;

export type DiscoveryFilterResult =
  | { ok: true; filters: RideFilters }
  | { ok: false; errors: DiscoveryFilterErrors };

type LocalDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function calendarDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseCalendarDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > calendarDaysInMonth(year, month)) {
    return null;
  }

  return { year, month, day };
}

function addCalendarDay(date: { year: number; month: number; day: number }) {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function timeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
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

function offsetMinutes(date: Date, timeZone: string) {
  const parts = timeZoneParts(date, timeZone);
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (wallClockAsUtc - date.getTime()) / 60_000;
}

function localPartsMatch(utcMillis: number, local: LocalDateTime, timeZone: string) {
  const parts = timeZoneParts(new Date(utcMillis), timeZone);
  return (
    parts.year === local.year &&
    parts.month === local.month &&
    parts.day === local.day &&
    parts.hour === local.hour &&
    parts.minute === local.minute
  );
}

/** Convert a local wall-clock value to UTC while accounting for timezone offset changes. */
function localDateTimeToUtc(local: LocalDateTime, timeZone: string): string | null {
  const localMillis = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, 0, 0);
  let candidate = localMillis;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (localPartsMatch(candidate, local, timeZone)) {
      return new Date(candidate).toISOString();
    }
    const nextCandidate = localMillis - offsetMinutes(new Date(candidate), timeZone) * 60_000;
    if (nextCandidate === candidate) {
      break;
    }
    candidate = nextCandidate;
  }

  return localPartsMatch(candidate, local, timeZone) ? new Date(candidate).toISOString() : null;
}

function dayBounds(dateValue: string) {
  const date = parseCalendarDate(dateValue);
  if (!date) {
    return null;
  }

  const start = localDateTimeToUtc({ ...date, hour: 0, minute: 0 }, DEFAULT_DISPLAY_TIMEZONE);
  const next = addCalendarDay(date);
  const nextStart = localDateTimeToUtc({ ...next, hour: 0, minute: 0 }, DEFAULT_DISPLAY_TIMEZONE);
  if (!start || !nextStart) {
    return null;
  }

  return {
    departureAtGte: start,
    // The service compares ISO strings inclusively. The final millisecond before
    // the next local midnight preserves the requested calendar-day semantics.
    departureAtLte: new Date(new Date(nextStart).getTime() - 1).toISOString(),
  };
}

function parseMaxPriceCents(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function parseMinimumSeats(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const seats = Number(normalized);
  return Number.isSafeInteger(seats) && seats > 0 ? seats : null;
}

export function validateAndBuildRideFilters(values: DiscoveryFilterValues): DiscoveryFilterResult {
  const errors: DiscoveryFilterErrors = {};
  const filters: RideFilters = {};
  const destinationQuery = values.destinationQuery.trim();
  if (destinationQuery) {
    filters.destinationQuery = destinationQuery;
  }

  const departureDate = values.departureDate.trim();
  if (departureDate) {
    const bounds = dayBounds(departureDate);
    if (!bounds) {
      errors.departureDate = "Enter a valid date in YYYY-MM-DD format.";
    } else {
      Object.assign(filters, bounds);
    }
  }

  const maxPriceDollars = values.maxPriceDollars.trim();
  if (maxPriceDollars) {
    const maxPriceCents = parseMaxPriceCents(maxPriceDollars);
    if (maxPriceCents == null) {
      errors.maxPriceDollars = "Enter a non-negative dollar amount with up to two decimals.";
    } else {
      filters.maxPriceCents = maxPriceCents;
    }
  }

  const minimumRemainingSeats = values.minimumRemainingSeats.trim();
  if (minimumRemainingSeats) {
    const minimumSeats = parseMinimumSeats(minimumRemainingSeats);
    if (minimumSeats == null) {
      errors.minimumRemainingSeats = "Enter a positive whole number of seats.";
    } else {
      filters.minimumRemainingSeats = minimumSeats;
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, filters };
}

export function formatRideDeparture(ride: Ride): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ride.displayTimezone || DEFAULT_DISPLAY_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(ride.departureAt));
}

export function formatRidePrice(ride: Ride): string {
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(ride.priceCents / 100);
  const source = ride.priceSource === "suggested" ? "Suggested" : "Driver set";
  return `${price} / seat · ${source}`;
}

export function isRideRequestable(ride: Ride, now: Date | string = new Date()): boolean {
  const nowDate = now instanceof Date ? now : new Date(now);
  return (
    Number.isFinite(nowDate.getTime()) &&
    ride.status === "scheduled" &&
    ride.remainingSeats > 0 &&
    new Date(ride.departureAt).getTime() > nowDate.getTime()
  );
}
