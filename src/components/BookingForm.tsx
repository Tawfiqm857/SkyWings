import { useState } from 'react';
import { User, Mail, Phone, CreditCard, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { createBooking, generateTrackingCode, calculateBoardingTime, DbFlight, formatFlightTime, calculateDuration } from '@/lib/flightService';
import { toast } from 'sonner';

interface Seat {
  id: string;
  seat_number: string;
  seat_class: string;
  price_modifier: number;
}

interface BookingFormProps {
  flight: DbFlight;
  selectedSeat: Seat;
  onComplete: (booking: {
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
  }) => void;
  onBack: () => void;
}

export function BookingForm({ flight, selectedSeat, onComplete, onBack }: BookingFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    passport: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = Number(flight.price) * Number(selectedSeat.price_modifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const trackingCode = generateTrackingCode();
      const boardingTime = calculateBoardingTime(flight.departure_time);

      await createBooking({
        user_id: user?.id,
        flight_id: flight.id,
        tracking_code: trackingCode,
        passenger_name: `${formData.firstName} ${formData.lastName}`,
        passenger_email: formData.email,
        passenger_phone: formData.phone || undefined,
        seat_number: selectedSeat.seat_number,
        gate: flight.gate || 'TBA',
        boarding_time: boardingTime,
        total_price: totalPrice,
      });

      onComplete({
        trackingCode,
        flight,
        passenger: formData,
        seat: selectedSeat.seat_number,
        gate: flight.gate || 'TBA',
        boardingTime,
        totalPrice,
      });

      toast.success('Booking confirmed!');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 animate-slide-up">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Passenger Details</h2>
          <p className="text-muted-foreground">
            Please enter your details exactly as they appear on your passport
          </p>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">{flight.flight_number}</p>
            <p className="text-sm text-muted-foreground">{flight.airline}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              {flight.origin_code} → {flight.destination_code}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFlightTime(flight.departure_time)} - {formatFlightTime(flight.arrival_time)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">Seat {selectedSeat.seat_number}</p>
            <p className="text-2xl font-bold text-foreground">${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="pl-10"
                placeholder="John"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="pl-10"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passport">Passport Number</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="passport"
                value={formData.passport}
                onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                className="pl-10"
                placeholder="A12345678"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="sm:flex-1">
            Back to Seat Selection
          </Button>
          <Button type="submit" variant="accent" size="lg" className="sm:flex-1" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Confirm Booking - ${totalPrice.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
