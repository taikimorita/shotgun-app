import { useEffect, useMemo, useState } from "react";
import { currentUser, rides } from "../data/fixtures";
import { mockBookingService } from "../services/mockBookingService";
import { Booking, BookingView } from "../types/booking";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = mockBookingService.subscribe((next) => {
      setBookings(next);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const views = useMemo<BookingView[]>(
    () => bookings.flatMap((booking) => {
      const ride = rides.find((item) => item.id === booking.rideId);
      return ride ? [{ ...booking, ride }] : [];
    }),
    [bookings],
  );

  return {
    loading,
    bookings: views,
    riderBookings: views.filter((booking) => booking.riderId === currentUser.id),
    driverRequests: views.filter((booking) => booking.ride.driverId === currentUser.id),
  };
}
