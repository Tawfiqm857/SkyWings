import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plane, AlertCircle, Printer, Download, CheckCircle, Sparkles, BadgeCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { FlightTicket } from '@/components/FlightTicket';
import { FlightStatus } from '@/components/FlightStatus';
import { fetchBookingByCode, formatFlightTime, calculateDuration } from '@/lib/flightService';
import { Booking } from '@/lib/flightData';

export default function TrackBooking() {
  const [searchParams] = useSearchParams();
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flightId, setFlightId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPaymentTooltip, setShowPaymentTooltip] = useState(true);

  // Auto-hide payment tooltip after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPaymentTooltip(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-search if code is in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setTrackingCode(code);
      handleSearchWithCode(code);
    }
  }, [searchParams]);

  const handleSearchWithCode = async (code: string) => {
    setError('');
    setBooking(null);
    setFlightId(null);
    setIsSearching(true);

    try {
      const found = await fetchBookingByCode(code);

      if (found) {
        const flight = found.flight;
        setFlightId(found.flight_id);
        
        // Transform to the Booking interface expected by FlightTicket
        const bookingData: Booking = {
          id: found.id,
          trackingCode: found.tracking_code,
          flight: {
            id: flight.id,
            airline: flight.airline,
            flightNumber: flight.flight_number,
            origin: flight.origin,
            originCode: flight.origin_code,
            destination: flight.destination,
            destinationCode: flight.destination_code,
            departureTime: formatFlightTime(flight.departure_time),
            arrivalTime: formatFlightTime(flight.arrival_time),
            duration: calculateDuration(flight.departure_time, flight.arrival_time),
            price: Number(flight.price),
            class: 'economy',
            stops: 0,
            aircraft: flight.aircraft_type,
          },
          passenger: {
            firstName: found.passenger_name.split(' ')[0] || '',
            lastName: found.passenger_name.split(' ').slice(1).join(' ') || '',
            email: found.passenger_email,
            phone: found.passenger_phone || '',
            passport: '',
          },
          seat: found.seat_number,
          gate: found.gate || 'TBA',
          boardingTime: found.boarding_time ? formatFlightTime(found.boarding_time) : 'TBA',
          status: found.status as Booking['status'],
          bookedAt: found.created_at,
        };
        setBooking(bookingData);
      } else {
        setError('No booking found with this tracking code. Please check and try again.');
      }
    } catch (err) {
      console.error('Error searching booking:', err);
      setError('An error occurred while searching. Please try again.');
    }

    setIsSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchWithCode(trackingCode);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'checked-in':
        return 'bg-success/10 text-success border-success/20';
      case 'boarded':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-14 no-print">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Real-time Flight Tracking</span>
            </div>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
              <Plane className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5">
              Track Your Booking
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
              Enter your booking reference code to view your flight details and download your boarding pass
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-xl mx-auto mb-14 no-print">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="trackingCode" className="text-base font-semibold">Booking Reference</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="trackingCode"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      placeholder="e.g., FL2578LM"
                      className="text-lg font-mono tracking-widest pl-12 h-14 rounded-xl"
                      maxLength={10}
                    />
                  </div>
                  <Button type="submit" disabled={!trackingCode.trim() || isSearching} size="lg" className="h-14 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25">
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-xl mx-auto mb-10 no-print">
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Booking Result */}
          {booking && (
            <div className="max-w-4xl mx-auto animate-slide-up">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-8 no-print">
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Booking Status</p>
                  <TooltipProvider>
                    <Tooltip open={showPaymentTooltip}>
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold border cursor-default ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2">
                        <BadgeCheck className="w-4 h-4" />
                        <span>Payment Confirmed</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Flight Status with Real-time Updates */}
              {flightId && (
                <div className="mb-10 no-print">
                  <FlightStatus flightId={flightId} bookingId={booking.id} />
                </div>
              )}

              {/* Ticket */}
              <div className="mb-10">
                <FlightTicket booking={booking} />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 no-print">
                <Button variant="default" size="lg" className="flex-1 h-14 rounded-xl font-semibold shadow-lg shadow-primary/25" onClick={handlePrint}>
                  <Printer className="w-5 h-5 mr-3" />
                  Print Boarding Pass
                </Button>
                <Button variant="outline" size="lg" className="flex-1 h-14 rounded-xl font-semibold">
                  <Download className="w-5 h-5 mr-3" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
