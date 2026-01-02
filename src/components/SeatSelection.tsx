import { useState, useEffect } from 'react';
import { Users, Crown, Briefcase, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Seat {
  id: string;
  seat_number: string;
  seat_class: string;
  is_available: boolean;
  price_modifier: number;
  is_window: boolean;
  is_aisle: boolean;
  is_exit_row: boolean;
}

interface SeatSelectionProps {
  flightId: string;
  basePrice: number;
  onSelect: (seat: Seat) => void;
  onBack: () => void;
}

export function SeatSelection({ flightId, basePrice, onSelect, onBack }: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [flightId]);

  const fetchSeats = async () => {
    const { data, error } = await supabase
      .from('seat_map')
      .select('*')
      .eq('flight_id', flightId)
      .order('seat_number');

    if (error) {
      console.error('Error fetching seats:', error);
    } else {
      setSeats(data || []);
    }
    setLoading(false);
  };

  // Organize seats by row
  const seatsByRow: Record<number, Seat[]> = {};
  seats.forEach((seat) => {
    const rowNum = parseInt(seat.seat_number.slice(0, -1));
    if (!seatsByRow[rowNum]) {
      seatsByRow[rowNum] = [];
    }
    seatsByRow[rowNum].push(seat);
  });

  const rows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  const getSeatClass = (seat: Seat) => {
    if (!seat.is_available) return 'bg-muted text-muted-foreground cursor-not-allowed';
    if (selectedSeat?.id === seat.id) return 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2';
    
    switch (seat.seat_class) {
      case 'first':
        return 'bg-gold/20 text-foreground hover:bg-gold/40 border-gold/50';
      case 'business':
        return 'bg-accent/20 text-foreground hover:bg-accent/40 border-accent/50';
      default:
        return 'bg-secondary text-foreground hover:bg-secondary/80 border-border';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return;
    setSelectedSeat(seat);
  };

  const handleConfirm = () => {
    if (selectedSeat) {
      onSelect(selectedSeat);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 animate-slide-up">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Select Your Seat</h2>
          <p className="text-muted-foreground">Choose your preferred seat on the aircraft</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gold/20 border border-gold/50" />
          <span className="text-sm">First Class (+150%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent/20 border border-accent/50" />
          <span className="text-sm">Business (+50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-secondary border border-border" />
          <span className="text-sm">Economy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted" />
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary" />
          <span className="text-sm">Selected</span>
        </div>
      </div>

      {/* Aircraft Layout */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[400px]">
          {/* Aircraft nose */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-10 bg-muted rounded-t-full" />
          </div>

          {/* Column headers */}
          <div className="flex justify-center gap-1 mb-2">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">A</div>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">B</div>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">C</div>
            <div className="w-4" /> {/* Aisle */}
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">D</div>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">E</div>
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">F</div>
          </div>

          {/* Seat rows */}
          <div className="space-y-1">
            {rows.map((rowNum) => {
              const rowSeats = seatsByRow[rowNum].sort((a, b) => {
                const order = ['A', 'B', 'C', 'D', 'E', 'F'];
                return order.indexOf(a.seat_number.slice(-1)) - order.indexOf(b.seat_number.slice(-1));
              });

              const isFirstClass = rowNum <= 3;
              const isBusiness = rowNum > 3 && rowNum <= 8;
              const isExitRow = rowNum === 12;

              return (
                <div key={rowNum} className="relative">
                  {/* Row separator labels */}
                  {rowNum === 1 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-gold" />
                      <span className="text-xs font-medium text-gold">First Class</span>
                    </div>
                  )}
                  {rowNum === 4 && (
                    <div className="flex items-center gap-2 mb-2 mt-4">
                      <Briefcase className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium text-accent">Business Class</span>
                    </div>
                  )}
                  {rowNum === 9 && (
                    <div className="flex items-center gap-2 mb-2 mt-4">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Economy Class</span>
                    </div>
                  )}

                  <div className="flex justify-center gap-1 items-center">
                    {/* Row number */}
                    <div className="w-6 text-xs font-medium text-muted-foreground text-right pr-2">
                      {rowNum}
                    </div>

                    {/* Left seats (A, B, C) */}
                    {rowSeats.slice(0, 3).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.is_available}
                        className={cn(
                          "w-8 h-8 rounded text-xs font-medium border transition-all",
                          getSeatClass(seat),
                          seat.is_exit_row && "ring-1 ring-success"
                        )}
                        title={`${seat.seat_number} - ${seat.is_available ? 'Available' : 'Occupied'}`}
                      >
                        {selectedSeat?.id === seat.id ? (
                          <Check className="w-4 h-4 mx-auto" />
                        ) : (
                          seat.seat_number.slice(-1)
                        )}
                      </button>
                    ))}

                    {/* Aisle */}
                    <div className="w-4 bg-muted/30 h-8 rounded" />

                    {/* Right seats (D, E, F) */}
                    {rowSeats.slice(3).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.is_available}
                        className={cn(
                          "w-8 h-8 rounded text-xs font-medium border transition-all",
                          getSeatClass(seat),
                          seat.is_exit_row && "ring-1 ring-success"
                        )}
                        title={`${seat.seat_number} - ${seat.is_available ? 'Available' : 'Occupied'}`}
                      >
                        {selectedSeat?.id === seat.id ? (
                          <Check className="w-4 h-4 mx-auto" />
                        ) : (
                          seat.seat_number.slice(-1)
                        )}
                      </button>
                    ))}

                    {/* Row number (right side) */}
                    <div className="w-6 text-xs font-medium text-muted-foreground text-left pl-2">
                      {rowNum}
                    </div>
                  </div>

                  {/* Exit row indicator */}
                  {isExitRow && (
                    <div className="text-center text-xs text-success mt-1">← Exit Row →</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Aircraft tail */}
          <div className="flex justify-center mt-4">
            <div className="w-16 h-6 bg-muted rounded-b-lg" />
          </div>
        </div>
      </div>

      {/* Selected seat info */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Seat {selectedSeat.seat_number}</p>
              <p className="text-sm text-muted-foreground">
                {selectedSeat.seat_class.charAt(0).toUpperCase() + selectedSeat.seat_class.slice(1)} Class
                {selectedSeat.is_window && ' • Window'}
                {selectedSeat.is_aisle && ' • Aisle'}
                {selectedSeat.is_exit_row && ' • Exit Row'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ${(basePrice * Number(selectedSeat.price_modifier)).toFixed(2)}
              </p>
              {Number(selectedSeat.price_modifier) > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{((Number(selectedSeat.price_modifier) - 1) * 100).toFixed(0)}% premium
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm button */}
      <div className="mt-6 flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Flights
        </Button>
        <Button 
          variant="accent" 
          onClick={handleConfirm} 
          disabled={!selectedSeat}
          className="flex-1"
        >
          Continue with Seat {selectedSeat?.seat_number || ''}
        </Button>
      </div>
    </div>
  );
}
