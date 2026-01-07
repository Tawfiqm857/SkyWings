import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, Ticket, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BookingWithFlight {
  id: string;
  tracking_code: string;
  passenger_name: string;
  passenger_email: string;
  seat_number: string;
  gate: string | null;
  boarding_time: string | null;
  status: string;
  total_price: number;
  created_at: string;
  flights: {
    id: string;
    flight_number: string;
    airline: string;
    origin: string;
    origin_code: string;
    destination: string;
    destination_code: string;
    departure_time: string;
    arrival_time: string;
    status: string;
    gate: string | null;
    delay_minutes: number | null;
  };
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flights (*)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data as BookingWithFlight[] || []);
    }
    setLoading(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'text-primary bg-primary/10', label: 'Confirmed' };
      case 'checked-in':
        return { color: 'text-success bg-success/10', label: 'Checked In' };
      case 'boarded':
        return { color: 'text-accent bg-accent/10', label: 'Boarded' };
      case 'completed':
        return { color: 'text-muted-foreground bg-muted', label: 'Completed' };
      case 'cancelled':
        return { color: 'text-destructive bg-destructive/10', label: 'Cancelled' };
      default:
        return { color: 'text-muted-foreground bg-muted', label: status };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your flight reservations
            </p>
          </div>

          {/* Bookings list */}
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't made any flight bookings yet
              </p>
              <Button onClick={() => navigate('/search')}>
                <Plane className="w-4 h-4 mr-2" />
                Book a Flight
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const { flights: flight } = booking;
                const departure = formatDateTime(flight.departure_time);
                const statusConfig = getStatusConfig(booking.status);
                const hasDelay = flight.delay_minutes && flight.delay_minutes > 0;

                return (
                  <div
                    key={booking.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/track?code=${booking.tracking_code}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Flight info */}
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                          <Plane className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg text-foreground">
                              {flight.origin_code} → {flight.destination_code}
                            </span>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig.color)}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {flight.flight_number} • {booking.passenger_name}
                          </p>
                          {hasDelay && (
                            <div className="flex items-center gap-1 mt-1 text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-xs">Delayed {flight.delay_minutes} min</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date and details (includes Price now) */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{departure.date}</span>
                          </div>
                          <p className="font-semibold text-foreground">{departure.time}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Seat</p>
                          <p className="font-semibold text-foreground">{booking.seat_number}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Gate</p>
                          <p className="font-semibold text-foreground">{flight.gate || '--'}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Price</p>
                          <p className="font-semibold text-foreground">{formatPrice(booking.total_price)}</p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      </div>
                    </div>

                    {/* Tracking code */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        Booking Reference: <span className="font-mono font-bold text-foreground">{booking.tracking_code}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
