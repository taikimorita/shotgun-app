export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled";

export type Booking = {
  id: string;
  rideId: string;
  riderId: string;
  riderName: string;
  riderInitials: string;
  seats: number;
  status: BookingStatus;
  createdAt: string;
};

export type Ride = {
  id: string;
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverRating: number;
  dateLabel: string;
  departureTime: string;
  origin: string;
  destination: string;
  vehicle: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  notes?: string;
};

export type BookingView = Booking & { ride: Ride };
