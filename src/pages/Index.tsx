import { Link } from 'react-router-dom';
import { Plane, Shield, Clock, CreditCard, MapPin, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlightSearchForm } from '@/components/FlightSearchForm';
import heroImage from '@/assets/hero-flight.jpg';
import destTokyo from '@/assets/dest-tokyo.jpg';
import destParis from '@/assets/dest-paris.jpg';
import destNyc from '@/assets/dest-nyc.jpg';
import destBali from '@/assets/dest-bali.jpg';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your payment and personal data are protected with bank-level security',
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description: 'Track your flight status and get instant updates on any changes',
  },
  {
    icon: CreditCard,
    title: 'Best Price Guarantee',
    description: 'Find the lowest fares with our price match promise',
  },
  {
    icon: MapPin,
    title: '500+ Destinations',
    description: 'Fly to destinations worldwide with our global airline partners',
  },
];

const destinations = [
  { city: 'Paris', country: 'France', price: 449, image: destParis },
  { city: 'Tokyo', country: 'Japan', price: 899, image: destTokyo },
  { city: 'New York', country: 'USA', price: 299, image: destNyc },
  { city: 'Bali', country: 'Indonesia', price: 799, image: destBali },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Airplane wing view at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/90 font-medium">Trusted by 50M+ travelers worldwide</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
              Your Journey
              <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Begins Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
              Book flights to over 500 destinations worldwide with the best prices guaranteed
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto animate-slide-up">
            <FlightSearchForm variant="hero" />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16">
            {[
              { value: '500+', label: 'Destinations' },
              { value: '50M+', label: 'Happy Travelers' },
              { value: '24/7', label: 'Support' },
              { value: '99.9%', label: 'On-time Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-4xl md:text-5xl font-bold text-white group-hover:text-accent transition-colors">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">SkyWings</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make booking your next adventure simple, secure, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-3xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore our most-booked destinations this month
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={`${dest.city}, ${dest.country}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{dest.city}</h3>
                    <p className="text-white/80">{dest.country}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">from</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${dest.price}</p>
                    </div>
                    <Button size="sm" variant="accent" className="shadow-lg shadow-accent/25">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Booking CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8">
            <Plane className="w-10 h-10 text-white animate-float" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Already Booked?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto">
            Track your flight status and download your boarding pass using your booking reference code
          </p>
          <Link to="/track">
            <Button variant="glass" size="xl" className="text-lg px-8 py-6">
              Track Your Booking
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">SkyWings</span>
            </div>
            <p className="text-muted-foreground">
              © 2026 SkyWings Airlines. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-foreground font-semibold">4.9/5</span>
              <span className="text-muted-foreground">(2.5k reviews)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
