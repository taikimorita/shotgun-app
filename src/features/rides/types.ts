export const DEFAULT_DISPLAY_TIMEZONE = "America/Los_Angeles" as const;
export const MAX_RIDE_STOPS = 4;

export type RideStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type PriceSource = "suggested" | "driver_set";
export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled";
export type VerificationStatus = "unverified" | "school_email" | "manual_review";

export interface Place {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface RouteSummary {
  distanceMeters: number;
  durationSeconds: number;
  path?: Array<{ lat: number; lng: number }>;
}

export interface DriverSummary {
  id: string;
  name: string;
  initials: string;
  verificationStatus: VerificationStatus;
  ratingAverage: number | null;
  completedRideCount: number | null;
}

export interface VehicleSummary {
  id: string;
  label: string;
  seatCount: number;
}

export interface RideBookingSeed {
  seats: 1;
  status: BookingStatus;
}

export interface Ride {
  id: string;
  driver: DriverSummary;
  vehicle: VehicleSummary;
  origin: Place;
  destination: Place;
  stops: Place[];
  routeSummary: RouteSummary | null;
  departureAt: string;
  displayTimezone: typeof DEFAULT_DISPLAY_TIMEZONE;
  capacity: number;
  remainingSeats: number;
  status: RideStatus;
  priceCents: number;
  priceSource: PriceSource;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RideSeed extends Omit<Ride, "remainingSeats"> {
  bookings: RideBookingSeed[];
}

export interface RideDraftInput {
  driver: DriverSummary;
  vehicle: VehicleSummary;
  origin: Place;
  destination: Place;
  stops?: Place[];
  routeSummary?: RouteSummary | null;
  departureDate: string;
  departureTime: string;
  displayTimezone?: string;
  capacity: number | string;
  priceCents: number | string;
  priceSource?: PriceSource;
  notes?: string | null;
}

export interface NormalizedRideDraft {
  driver: DriverSummary;
  vehicle: VehicleSummary;
  origin: Place;
  destination: Place;
  stops: Place[];
  routeSummary: RouteSummary | null;
  departureAt: string;
  displayTimezone: typeof DEFAULT_DISPLAY_TIMEZONE;
  capacity: number;
  priceCents: number;
  priceSource: PriceSource;
  notes: string | null;
}

export interface RideFilters {
  destinationQuery?: string;
  departureAtGte?: string;
  departureAtLte?: string;
  maxPriceCents?: number;
  minimumRemainingSeats?: number;
}

export type RideDraftField =
  | "driver"
  | "vehicle"
  | "origin"
  | "destination"
  | "stops"
  | "routeSummary"
  | "departureDate"
  | "departureTime"
  | "displayTimezone"
  | "capacity"
  | "priceCents"
  | "notes";

export type RideDraftErrors = Partial<Record<RideDraftField, string>>;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: RideDraftErrors };

export interface RidesService {
  list(filters?: RideFilters): Promise<Ride[]>;
  getById(id: string): Promise<Ride | null>;
  create(draft: RideDraftInput): Promise<Ride>;
  update(rideId: string, driverId: string, draft: RideDraftInput): Promise<Ride>;
}

export interface FixtureRidesService extends RidesService {
  reset(): void;
}
