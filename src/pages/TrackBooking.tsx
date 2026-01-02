import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plane, AlertCircle, Printer, Download, CheckCircle } from 'lucide-react';
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
        return 'bg-primary/10 text-primary';
      case 'checked-in':
        return 'bg-success/10 text-success';
      case 'boarded':
        return 'bg-accent/10 text-accent';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12 no-print">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plane className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Track Your Booking
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Enter your booking reference code to view your flight details, real-time status, and download your boarding pass
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-lg mx-auto mb-12 no-print">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Booking Reference</Label>
                <div className="flex gap-2">
                  <Input
                    id="trackingCode"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SW2A3B4C"
                    className="text-lg font-mono tracking-wider"
                    maxLength={10}
                  />
                  <Button type="submit" disabled={!trackingCode.trim() || isSearching}>
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-lg mx-auto mb-8 no-print">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Booking Result */}
          {booking && (
            <div className="max-w-4xl mx-auto animate-slide-up">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6 no-print">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Booking Status</p>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Flight Status with Real-time Updates */}
              {flightId && (
                <div className="mb-8 no-print">
                  <FlightStatus flightId={flightId} bookingId={booking.id} />
                </div>
              )}

              {/* Ticket */}
              <div className="mb-8">
                <FlightTicket booking={booking} />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 no-print">
                <Button variant="default" size="lg" className="flex-1" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Boarding Pass
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
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
