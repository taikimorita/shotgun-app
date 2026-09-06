import { DEFAULT_DISPLAY_TIMEZONE, RideSeed } from "./types";

export const fixtureNowIso = "2026-09-05T18:00:00.000Z";

export const mayaDriver = {
  id: "driver-maya-chen",
  name: "Maya Chen",
  initials: "MC",
  verificationStatus: "school_email" as const,
  ratingAverage: 4.9,
  completedRideCount: 28,
};

export const jordanDriver = {
  id: "driver-jordan-rivera",
  name: "Jordan Rivera",
  initials: "JR",
  verificationStatus: "school_email" as const,
  ratingAverage: 4.8,
  completedRideCount: 16,
};

export const ariaDriver = {
  id: "driver-aria-thompson",
  name: "Aria Thompson",
  initials: "AT",
  verificationStatus: "school_email" as const,
  ratingAverage: 4.7,
  completedRideCount: 11,
};

export const calPoly = {
  id: "place-cal-poly",
  label: "Cal Poly, San Luis Obispo",
  lat: 35.305,
  lng: -120.6625,
};

export const downtownSlo = {
  id: "place-downtown-slo",
  label: "Downtown San Luis Obispo",
  lat: 35.2828,
  lng: -120.6596,
};

export const sfo = {
  id: "place-sfo",
  label: "San Francisco International Airport (SFO)",
  lat: 37.6166756,
  lng: -122.3881253,
};

export const losAngeles = {
  id: "place-los-angeles",
  label: "Los Angeles, Union Station",
  lat: 34.0562,
  lng: -118.2365,
};

export const santaBarbara = {
  id: "place-santa-barbara",
  label: "Santa Barbara, State Street",
  lat: 34.4208,
  lng: -119.6982,
};

export const monterey = {
  id: "place-monterey",
  label: "Monterey, Cannery Row",
  lat: 36.6177,
  lng: -121.9016,
};

export const fixtureRideSeeds: RideSeed[] = [
  {
    id: "ride-maya-slo-sfo",
    driver: mayaDriver,
    vehicle: {
      id: "vehicle-maya-outback",
      label: "2022 Subaru Outback · Blue",
      seatCount: 3,
    },
    origin: calPoly,
    destination: sfo,
    stops: [downtownSlo],
    routeSummary: {
      distanceMeters: 370000,
      durationSeconds: 14400,
    },
    departureAt: "2026-09-06T16:00:00.000Z",
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 3,
    status: "scheduled",
    priceCents: 1250,
    priceSource: "suggested",
    notes: "One downtown SLO pickup before heading north.",
    bookings: [{ seats: 1, status: "accepted" }, { seats: 1, status: "pending" }],
    createdAt: fixtureNowIso,
    updatedAt: fixtureNowIso,
  },
  {
    id: "ride-jordan-slo-la",
    driver: jordanDriver,
    vehicle: {
      id: "vehicle-jordan-crv",
      label: "2021 Honda CR-V · Silver",
      seatCount: 4,
    },
    origin: calPoly,
    destination: losAngeles,
    stops: [],
    routeSummary: {
      distanceMeters: 329000,
      durationSeconds: 13740,
    },
    departureAt: "2026-09-06T18:30:00.000Z",
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 4,
    status: "scheduled",
    priceCents: 1800,
    priceSource: "driver_set",
    notes: "Leaving promptly. One backpack per rider please.",
    bookings: [{ seats: 1, status: "accepted" }, { seats: 1, status: "accepted" }],
    createdAt: fixtureNowIso,
    updatedAt: fixtureNowIso,
  },
  {
    id: "ride-aria-slo-sb",
    driver: ariaDriver,
    vehicle: {
      id: "vehicle-aria-rav4",
      label: "2020 Toyota RAV4 · Green",
      seatCount: 2,
    },
    origin: calPoly,
    destination: santaBarbara,
    stops: [],
    routeSummary: {
      distanceMeters: 108000,
      durationSeconds: 6480,
    },
    departureAt: "2026-09-07T20:00:00.000Z",
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 2,
    status: "scheduled",
    priceCents: 950,
    priceSource: "suggested",
    notes: "Fast coffee stop if time allows.",
    bookings: [{ seats: 1, status: "accepted" }, { seats: 1, status: "accepted" }],
    createdAt: fixtureNowIso,
    updatedAt: fixtureNowIso,
  },
  {
    id: "ride-maya-slo-monterey",
    driver: mayaDriver,
    vehicle: {
      id: "vehicle-maya-outback",
      label: "2022 Subaru Outback · Blue",
      seatCount: 3,
    },
    origin: calPoly,
    destination: monterey,
    stops: [downtownSlo],
    routeSummary: {
      distanceMeters: 250000,
      durationSeconds: 11400,
    },
    departureAt: "2026-09-08T18:00:00.000Z",
    displayTimezone: DEFAULT_DISPLAY_TIMEZONE,
    capacity: 3,
    status: "scheduled",
    priceCents: 2200,
    priceSource: "suggested",
    notes: "Open to one stop near the 101 on the way out.",
    bookings: [],
    createdAt: fixtureNowIso,
    updatedAt: fixtureNowIso,
  },
];

export function describeFixtureInventory() {
  return fixtureRideSeeds.map((ride) => ({
    id: ride.id,
    destination: ride.destination.label,
    departureAt: ride.departureAt,
    priceCents: ride.priceCents,
    capacity: ride.capacity,
    acceptedSeats: ride.bookings.filter((booking) => booking.status === "accepted").reduce((sum, booking) => sum + booking.seats, 0),
  }));
}
