import { Plane, Clock, ArrowRight, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  aircraft: string;
}

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  availableSeats?: number;
  status?: string;
  delayMinutes?: number | null;
}

export function FlightCard({ flight, onSelect, availableSeats, status, delayMinutes }: FlightCardProps) {
  const isDelayed = delayMinutes && delayMinutes > 0;
  const seatsLow = availableSeats !== undefined && availableSeats < 10;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 card-hover animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Airline Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-inner">
            <Plane className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">{flight.airline}</p>
            <p className="text-sm text-muted-foreground">{flight.flightNumber} · {flight.aircraft}</p>
            {isDelayed && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-destructive" />
                <span className="text-xs text-destructive font-medium">Delayed {delayMinutes}min</span>
              </div>
            )}
          </div>
        </div>

        {/* Flight Times */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground tracking-tight">{flight.departureTime}</p>
            <p className="text-sm font-semibold text-muted-foreground">{flight.originCode}</p>
          </div>

          <div className="flex flex-col items-center flex-1 max-w-[220px]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Clock className="w-4 h-4" />
              {flight.duration}
            </div>
            <div className="relative w-full h-[3px] bg-gradient-to-r from-primary/30 via-accent/50 to-accent/30 mt-3 rounded-full">
              <div className="flight-path-line absolute inset-0 rounded-full" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
              <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary transform rotate-90 drop-shadow-lg" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
            </div>
            <Badge 
              variant={flight.stops === 0 ? "secondary" : "outline"} 
              className={cn(
                "mt-3 font-semibold",
                flight.stops === 0 && "bg-green-500/10 text-green-600 border-green-500/20"
              )}
            >
              {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </Badge>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-foreground tracking-tight">{flight.arrivalTime}</p>
            <p className="text-sm font-semibold text-muted-foreground">{flight.destinationCode}</p>
          </div>
        </div>

        {/* Price & Book */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">from</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${flight.price}</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          {availableSeats !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              seatsLow ? "text-orange-500" : "text-muted-foreground"
            )}>
              <Users className="w-3 h-3" />
              {availableSeats} seats left
            </div>
          )}
          <Button 
            variant="accent" 
            onClick={() => onSelect(flight)}
            className="shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
          >
            Select Flight
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
