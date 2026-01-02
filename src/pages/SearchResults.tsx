import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, Plane, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { FlightCard } from '@/components/FlightCard';
import { SeatSelection } from '@/components/SeatSelection';
import { BookingForm } from '@/components/BookingForm';
import { FlightTicket } from '@/components/FlightTicket';
import { FlightStatus } from '@/components/FlightStatus';
import { fetchFlights, DbFlight, formatFlightTime, calculateDuration } from '@/lib/flightService';
import { airports } from '@/lib/flightData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, Download, CheckCircle } from 'lucide-react';

type SortOption = 'price-low' | 'price-high' | 'duration' | 'departure';

interface BookingData {
  trackingCode: string;
  flight: DbFlight;
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  seat: string;
  gate: string;
  boardingTime: string;
  totalPrice: number;
}

type ViewState = 'search' | 'seat-selection' | 'booking' | 'confirmation';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [flights, setFlights] = useState<DbFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<DbFlight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [viewState, setViewState] = useState<ViewState>('search');

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const passengers = searchParams.get('passengers') || '1';

  const originAirport = airports.find((a) => a.code === origin);
  const destAirport = airports.find((a) => a.code === destination);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    const data = await fetchFlights();
    setFlights(data);
    setLoading(false);
  };

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'duration':
        const durA = new Date(a.arrival_time).getTime() - new Date(a.departure_time).getTime();
        const durB = new Date(b.arrival_time).getTime() - new Date(b.departure_time).getTime();
        return durA - durB;
      case 'departure':
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      default:
        return 0;
    }
  });

  const handleFlightSelect = (flight: DbFlight) => {
    setSelectedFlight(flight);
    setViewState('seat-selection');
  };

  const handleSeatSelect = (seat: any) => {
    setSelectedSeat(seat);
    setViewState('booking');
  };

  const handleBookingComplete = (bookingData: BookingData) => {
    setBooking(bookingData);
    setViewState('confirmation');
  };

  const handlePrint = () => {
    window.print();
  };

  // Booking confirmation view
  if (viewState === 'confirmation' && booking && selectedFlight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Success Message */}
            <div className="text-center mb-8 animate-fade-in no-print">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Your flight has been booked successfully. Here's your boarding pass.
              </p>
            </div>

            {/* Ticket */}
            <div className="mb-8">
              <FlightTicket 
                booking={{
                  id: booking.trackingCode,
                  trackingCode: booking.trackingCode,
                  flight: {
                    id: selectedFlight.id,
                    airline: selectedFlight.airline,
                    flightNumber: selectedFlight.flight_number,
                    origin: selectedFlight.origin,
                    originCode: selectedFlight.origin_code,
                    destination: selectedFlight.destination,
                    destinationCode: selectedFlight.destination_code,
                    departureTime: formatFlightTime(selectedFlight.departure_time),
                    arrivalTime: formatFlightTime(selectedFlight.arrival_time),
                    duration: calculateDuration(selectedFlight.departure_time, selectedFlight.arrival_time),
                    price: Number(selectedFlight.price),
                    class: 'economy',
                    stops: 0,
                    aircraft: selectedFlight.aircraft_type,
                  },
                  passenger: {
                    firstName: booking.passenger.firstName,
                    lastName: booking.passenger.lastName,
                    email: booking.passenger.email,
                    phone: booking.passenger.phone,
                    passport: '',
                  },
                  seat: booking.seat,
                  gate: booking.gate,
                  boardingTime: formatFlightTime(booking.boardingTime),
                  status: 'confirmed',
                  bookedAt: new Date().toISOString(),
                }} 
              />
            </div>

            {/* Flight Status */}
            <div className="mb-8 no-print">
              <h2 className="text-xl font-bold text-foreground mb-4">Flight Status</h2>
              <FlightStatus flightId={selectedFlight.id} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 no-print">
              <Button variant="default" size="lg" className="flex-1" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Ticket
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6 no-print">
              Your booking reference <span className="font-mono font-bold text-primary">{booking.trackingCode}</span> has been sent to {booking.passenger.email}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Booking form view
  if (viewState === 'booking' && selectedFlight && selectedSeat) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <BookingForm
              flight={selectedFlight}
              selectedSeat={selectedSeat}
              onComplete={handleBookingComplete}
              onBack={() => setViewState('seat-selection')}
            />
          </div>
        </main>
      </div>
    );
  }

  // Seat selection view
  if (viewState === 'seat-selection' && selectedFlight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <SeatSelection
              flightId={selectedFlight.id}
              basePrice={Number(selectedFlight.price)}
              onSelect={handleSeatSelect}
              onBack={() => {
                setViewState('search');
                setSelectedFlight(null);
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // Search results view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {originAirport?.city || 'All Flights'} {destination && `→ ${destAirport?.city || destination}`}
            </h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `${sortedFlights.length} flights found`} · {passengers} passenger{parseInt(passengers) > 1 ? 's' : ''}
            </p>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No flights found</h2>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4">
              {sortedFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={{
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
                  }}
                  onSelect={() => handleFlightSelect(flight)}
                  availableSeats={flight.available_seats}
                  status={flight.status}
                  delayMinutes={flight.delay_minutes}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
