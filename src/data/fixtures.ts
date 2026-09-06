import { fixtureRideSeeds, mayaDriver } from "../features/rides/fixtures";
import { Booking, Ride } from "../types/booking";

export const currentUser = {
  id: mayaDriver.id,
  name: mayaDriver.name,
  initials: mayaDriver.initials,
};

function formatDeparture(departureAt: string, timeZone: string) {
  const departure = new Date(departureAt);
  return {
    dateLabel: new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(departure),
    departureTime: new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(departure),
  };
}

export const rides: Ride[] = fixtureRideSeeds.map((ride) => {
  const acceptedSeats = ride.bookings
    .filter((booking) => booking.status === "accepted")
    .reduce((sum, booking) => sum + booking.seats, 0);

  return {
    id: ride.id,
    driverId: ride.driver.id,
    driverName: ride.driver.name,
    driverInitials: ride.driver.initials,
    driverRating: ride.driver.ratingAverage ?? 0,
    ...formatDeparture(ride.departureAt, ride.displayTimezone),
    origin: ride.origin.label,
    destination: ride.destination.label,
    vehicle: ride.vehicle.label,
    pricePerSeat: ride.priceCents / 100,
    totalSeats: ride.capacity,
    availableSeats: ride.capacity - acceptedSeats,
    notes: ride.notes ?? undefined,
  };
});

export const initialBookings: Booking[] = [
  {
    id: "booking-pending",
    rideId: "ride-maya-slo-sfo",
    riderId: "rider-sam",
    riderName: "Sam Patel",
    riderInitials: "SP",
    seats: 1,
    status: "pending",
    createdAt: "2026-09-05T19:00:00Z",
  },
  {
    id: "booking-declined",
    rideId: "ride-maya-slo-sfo",
    riderId: "rider-olivia",
    riderName: "Olivia Kim",
    riderInitials: "OK",
    seats: 1,
    status: "declined",
    createdAt: "2026-09-05T18:30:00Z",
  },
];
