-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flights table
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  origin TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 180,
  aircraft_type TEXT NOT NULL DEFAULT 'Boeing 737-800',
  status TEXT NOT NULL DEFAULT 'scheduled',
  gate TEXT,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seat_map table for each flight
CREATE TABLE public.seat_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  seat_class TEXT NOT NULL DEFAULT 'economy',
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_modifier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  is_window BOOLEAN NOT NULL DEFAULT false,
  is_aisle BOOLEAN NOT NULL DEFAULT false,
  is_exit_row BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flight_id, seat_number)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flight_id UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  tracking_code TEXT NOT NULL UNIQUE,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  passenger_phone TEXT,
  seat_number TEXT NOT NULL,
  gate TEXT,
  boarding_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flight_updates table for real-time notifications
CREATE TABLE public.flight_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  message TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push_subscriptions table for notifications
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flights policies (public read access)
CREATE POLICY "Anyone can view flights" ON public.flights
  FOR SELECT USING (true);

-- Seat map policies (public read access)
CREATE POLICY "Anyone can view seat map" ON public.seat_map
  FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Flight updates policies (public read for flight updates)
CREATE POLICY "Anyone can view flight updates" ON public.flight_updates
  FOR SELECT USING (true);

-- Push subscriptions policies
CREATE POLICY "Users can manage their subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to mark seat as occupied when booking is created
CREATE OR REPLACE FUNCTION public.mark_seat_occupied()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.seat_map
  SET is_available = false
  WHERE flight_id = NEW.flight_id AND seat_number = NEW.seat_number;
  
  UPDATE public.flights
  SET available_seats = available_seats - 1
  WHERE id = NEW.flight_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.mark_seat_occupied();

-- Enable realtime for flight updates and bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.flights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flight_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Insert sample flights
INSERT INTO public.flights (flight_number, airline, origin, origin_code, destination, destination_code, departure_time, arrival_time, price, gate, status) VALUES
('SW101', 'SkyWings', 'New York', 'JFK', 'Los Angeles', 'LAX', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '5 hours 30 minutes', 299.00, 'A12', 'scheduled'),
('SW202', 'SkyWings', 'Los Angeles', 'LAX', 'Chicago', 'ORD', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '4 hours', 199.00, 'B7', 'scheduled'),
('SW303', 'SkyWings', 'Miami', 'MIA', 'New York', 'JFK', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', 249.00, 'C3', 'scheduled'),
('SW404', 'SkyWings', 'San Francisco', 'SFO', 'Seattle', 'SEA', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '2 hours', 149.00, 'D9', 'scheduled'),
('SW505', 'SkyWings', 'Chicago', 'ORD', 'Miami', 'MIA', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '3 hours 30 minutes', 279.00, 'E5', 'scheduled');

-- Generate seat maps for all flights
INSERT INTO public.seat_map (flight_id, seat_number, seat_class, is_available, price_modifier, is_window, is_aisle, is_exit_row)
SELECT 
  f.id,
  row_letter || seat_num::text,
  CASE 
    WHEN seat_num <= 3 THEN 'first'
    WHEN seat_num <= 8 THEN 'business'
    ELSE 'economy'
  END,
  true,
  CASE 
    WHEN seat_num <= 3 THEN 2.5
    WHEN seat_num <= 8 THEN 1.5
    ELSE 1.0
  END,
  row_letter IN ('A', 'F'),
  row_letter IN ('C', 'D'),
  seat_num = 12
FROM public.flights f
CROSS JOIN (SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) as row_letter) rows
CROSS JOIN generate_series(1, 30) as seat_num;