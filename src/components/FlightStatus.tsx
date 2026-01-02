import { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, AlertTriangle, Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlightUpdate {
  id: string;
  update_type: string;
  message: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface Flight {
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
}

interface FlightStatusProps {
  flightId: string;
  bookingId?: string;
}

export function FlightStatus({ flightId, bookingId }: FlightStatusProps) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [updates, setUpdates] = useState<FlightUpdate[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlight();
    fetchUpdates();
    
    // Subscribe to realtime updates
    const flightChannel = supabase
      .channel(`flight-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flights',
          filter: `id=eq.${flightId}`
        },
        (payload) => {
          console.log('Flight updated:', payload);
          setFlight(payload.new as Flight);
          toast.info('Flight status updated!');
        }
      )
      .subscribe();

    const updatesChannel = supabase
      .channel(`flight-updates-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flight_updates',
          filter: `flight_id=eq.${flightId}`
        },
        (payload) => {
          console.log('New update:', payload);
          const newUpdate = payload.new as FlightUpdate;
          setUpdates((prev) => [newUpdate, ...prev]);
          
          // Show toast notification
          if (newUpdate.update_type === 'delay') {
            toast.warning(newUpdate.message);
          } else if (newUpdate.update_type === 'gate_change') {
            toast.info(newUpdate.message);
          } else {
            toast(newUpdate.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(flightChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [flightId]);

  const fetchFlight = async () => {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flightId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching flight:', error);
    } else {
      setFlight(data);
    }
    setLoading(false);
  };

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from('flight_updates')
      .select('*')
      .eq('flight_id', flightId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching updates:', error);
    } else {
      setUpdates(data || []);
    }
  };

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled 
        ? 'Notifications disabled' 
        : 'You will receive updates for this flight'
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'text-primary bg-primary/10', icon: Clock, label: 'Scheduled' };
      case 'boarding':
        return { color: 'text-accent bg-accent/10', icon: Plane, label: 'Boarding' };
      case 'departed':
        return { color: 'text-success bg-success/10', icon: Plane, label: 'Departed' };
      case 'in_flight':
        return { color: 'text-success bg-success/10', icon: Plane, label: 'In Flight' };
      case 'landed':
        return { color: 'text-success bg-success/10', icon: CheckCircle, label: 'Landed' };
      case 'delayed':
        return { color: 'text-destructive bg-destructive/10', icon: AlertTriangle, label: 'Delayed' };
      case 'cancelled':
        return { color: 'text-destructive bg-destructive/10', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'text-muted-foreground bg-muted', icon: Clock, label: status };
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'gate_change':
        return <MapPin className="w-4 h-4 text-accent" />;
      case 'status_change':
        return <Plane className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Flight information not available
      </div>
    );
  }

  const statusConfig = getStatusConfig(flight.status);
  const StatusIcon = statusConfig.icon;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{flight.flight_number}</h3>
            <p className="text-sm text-muted-foreground">{flight.airline}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", statusConfig.color)}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-primary" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Delay warning */}
        {flight.delay_minutes && flight.delay_minutes > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">
                Delayed by {flight.delay_minutes} minutes
              </span>
            </div>
          </div>
        )}

        {/* Flight route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{flight.origin_code}</p>
            <p className="text-sm text-muted-foreground">{flight.origin}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{formatTime(flight.departure_time)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(flight.departure_time)}</p>
          </div>

          <div className="flex-1 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 h-0.5 bg-border rounded" />
              <Plane className="w-5 h-5 text-primary rotate-90" />
              <div className="flex-1 h-0.5 bg-border rounded" />
            </div>
            {flight.gate && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Gate: <span className="font-bold text-foreground">{flight.gate}</span>
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{flight.destination_code}</p>
            <p className="text-sm text-muted-foreground">{flight.destination}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{formatTime(flight.arrival_time)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(flight.arrival_time)}</p>
          </div>
        </div>
      </div>

      {/* Updates timeline */}
      {updates.length > 0 && (
        <div className="p-6">
          <h4 className="font-semibold text-foreground mb-4">Recent Updates</h4>
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {getUpdateIcon(update.update_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{update.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(update.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
