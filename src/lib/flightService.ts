import { supabase } from '@/integrations/supabase/client';

export interface DbFlight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  origin_code: string;
  destination: string;
  destination_code: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  aircraft_type: string;
  status: string;
  gate: string | null;
  delay_minutes: number | null;
}

export interface DbBooking {
  id: string;
  user_id: string | null;
  flight_id: string;
  tracking_code: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string | null;
  seat_number: string;
  gate: string | null;
  boarding_time: string | null;
  status: string;
  total_price: number;
  created_at: string;
}

export async function fetchFlights(): Promise<DbFlight[]> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .order('departure_time', { ascending: true });

  if (error) {
    console.error('Error fetching flights:', error);
    return [];
  }

  return data || [];
}

export async function fetchFlightById(id: string): Promise<DbFlight | null> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching flight:', error);
    return null;
  }

  return data;
}

export async function fetchBookingByCode(trackingCode: string): Promise<(DbBooking & { flight: DbFlight }) | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*)
    `)
    .eq('tracking_code', trackingCode.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return data as (DbBooking & { flight: DbFlight }) | null;
}

export async function createBooking(booking: {
  user_id?: string;
  flight_id: string;
  tracking_code: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone?: string;
  seat_number: string;
  gate?: string;
  boarding_time?: string;
  total_price: number;
}): Promise<DbBooking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return data;
}

export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SW';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateBoardingTime(departureTime: string): string {
  const departure = new Date(departureTime);
  departure.setMinutes(departure.getMinutes() - 45);
  return departure.toISOString();
}

export function formatFlightTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFlightDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateDuration(departure: string, arrival: string): string {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  const diffMs = arr.getTime() - dep.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
