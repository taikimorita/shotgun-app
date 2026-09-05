// Hand-maintained until `npx supabase gen types typescript --local` is run.
// Keep this file aligned with supabase/migrations.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VerificationStatus = 'unverified' | 'school_email' | 'manual_review';
export type RideStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type PriceSource = 'suggested' | 'driver_set';
export type ReportCategory = 'safety' | 'conduct' | 'other';
export type ReportStatus = 'open' | 'reviewed';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          avatar_url: string | null;
          school: string | null;
          graduation_year: number | null;
          verification_status: VerificationStatus;
          rating_average: number;
          completed_ride_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          avatar_url?: string | null;
          school?: string | null;
          graduation_year?: number | null;
          verification_status?: VerificationStatus;
          rating_average?: number;
          completed_ride_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          avatar_url?: string | null;
          school?: string | null;
          graduation_year?: number | null;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          owner_id: string;
          make: string;
          model: string;
          color: string;
          plate: string;
          seat_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          make: string;
          model: string;
          color: string;
          plate: string;
          seat_count: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          make?: string;
          model?: string;
          color?: string;
          plate?: string;
          seat_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'vehicles_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rides: {
        Row: {
          id: string;
          driver_id: string;
          vehicle_id: string;
          origin_label: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          display_timezone: string;
          capacity: number;
          status: RideStatus;
          price_cents: number;
          price_source: PriceSource;
          notes: string | null;
          distance_meters: number | null;
          duration_seconds: number | null;
          assumed_mpg: number | null;
          fuel_price_cents_per_gallon: number | null;
          tolls_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          vehicle_id: string;
          origin_label: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          display_timezone?: string;
          capacity: number;
          status?: RideStatus;
          price_cents: number;
          price_source: PriceSource;
          notes?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          assumed_mpg?: number | null;
          fuel_price_cents_per_gallon?: number | null;
          tolls_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          vehicle_id?: string;
          origin_label?: string;
          origin_lat?: number;
          origin_lng?: number;
          destination_label?: string;
          destination_lat?: number;
          destination_lng?: number;
          departure_at?: string;
          display_timezone?: string;
          capacity?: number;
          price_cents?: number;
          price_source?: PriceSource;
          notes?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          assumed_mpg?: number | null;
          fuel_price_cents_per_gallon?: number | null;
          tolls_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'rides_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rides_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
      ride_stops: {
        Row: {
          id: string;
          ride_id: string;
          sequence: number;
          label: string;
          lat: number;
          lng: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          sequence: number;
          label: string;
          lat: number;
          lng: number;
          created_at?: string;
        };
        Update: {
          sequence?: number;
          label?: string;
          lat?: number;
          lng?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'ride_stops_ride_id_fkey';
            columns: ['ride_id'];
            isOneToOne: false;
            referencedRelation: 'rides';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          ride_id: string;
          rider_id: string;
          seats: number;
          status: BookingStatus;
          created_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          ride_id: string;
          rider_id: string;
          seats?: number;
          status?: BookingStatus;
          created_at?: string;
          decided_at?: string | null;
        };
        Update: {
          [key: string]: never;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_ride_id_fkey';
            columns: ['ride_id'];
            isOneToOne: false;
            referencedRelation: 'rides';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_rider_id_fkey';
            columns: ['rider_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ratings: {
        Row: {
          id: string;
          ride_id: string;
          author_id: string;
          subject_id: string;
          stars: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          author_id: string;
          subject_id: string;
          stars: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          [key: string]: never;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          ride_id: string;
          reporter_id: string;
          subject_id: string;
          category: ReportCategory;
          details: string;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          reporter_id: string;
          subject_id: string;
          category: ReportCategory;
          details: string;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: {
          [key: string]: never;
        };
        Relationships: [];
      };
    };
    Views: {
      vehicles_public: {
        Row: {
          id: string | null;
          owner_id: string | null;
          make: string | null;
          model: string | null;
          color: string | null;
          seat_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      ride_listings: {
        Row: Database['public']['Tables']['rides']['Row'] & {
          remaining_seats: number | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      remaining_seats: { Args: { p_ride_id: string }; Returns: number };
      request_booking: { Args: { p_ride_id: string }; Returns: string };
      accept_booking: { Args: { p_booking_id: string }; Returns: number };
      decline_booking: { Args: { p_booking_id: string }; Returns: undefined };
      cancel_booking: { Args: { p_booking_id: string }; Returns: undefined };
      start_ride: { Args: { p_ride_id: string }; Returns: undefined };
      complete_ride: { Args: { p_ride_id: string }; Returns: undefined };
      cancel_ride: { Args: { p_ride_id: string }; Returns: undefined };
      submit_rating: {
        Args: {
          p_ride_id: string;
          p_subject_id: string;
          p_stars: number;
          p_note?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      verification_status: VerificationStatus;
      ride_status: RideStatus;
      booking_status: BookingStatus;
      price_source: PriceSource;
      report_category: ReportCategory;
      report_status: ReportStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** Stable local seed IDs from supabase/seed.sql. Hosted IDs will differ. */
export const localSeedIds = {
  mayaUserId: '11111111-1111-1111-1111-111111111111',
  jordanUserId: '22222222-2222-2222-2222-222222222222',
  fallbackRideId: '33333333-3333-3333-3333-333333333333',
  mayaVehicleId: '44444444-4444-4444-4444-444444444444',
  downtownStopId: '55555555-5555-5555-5555-555555555555',
} as const;
