import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  AlertCircle,
  Trash2,
  Lightbulb,
  Droplet,
  Users,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export const Landing = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-charcoal-900 transition-colors">
      {/* 1. ASYMMETRIC EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-sand-200/70 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200/70 dark:bg-charcoal-800 border border-sand-300/80 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-200 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Municipal Civic Works & Infrastructure</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 dark:text-sand-50 leading-[1.12]">
                Every pothole fixed.{' '}
                <span className="text-brand-600 dark:text-brand-400 italic">
                  Every street illuminated.
                </span>{' '}
                Together.
              </h1>

              {/* Short Description */}
              <p className="text-base sm:text-lg text-charcoal-600 dark:text-charcoal-300 font-sans max-w-xl leading-relaxed">
                CivicFix connects active Mumbai residents directly with municipal field engineers.
                Pin an issue on the map with a photo, track work crews in real time, and verify
                photographic proof of resolution.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to={isAuthenticated ? '/report' : '/login?tab=register'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-charcoal-800 hover:bg-sand-100 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-sand-100 font-semibold text-sm border border-sand-300 dark:border-charcoal-700 shadow-sm transition-all duration-200"
                >
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Explore Live Map</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-sand-200/80 dark:border-charcoal-800 flex items-center gap-6 text-xs text-charcoal-500 dark:text-charcoal-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Photographic Proof</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-600" />
                  <span>Live WebSocket Updates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>24 Municipal Wards</span>
                </div>
              </div>
            </div>

            {/* Right Column: Signature Floating UI Composition (5 cols) */}
            <div className="lg:col-span-5 relative">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/10 to-terracotta-500/10 rounded-3xl filter blur-2xl -z-10" />

              <div className="relative space-y-4">
                {/* 1. Primary Card: Live Pinned Issue Card */}
                <div className="bg-white/95 dark:bg-charcoal-800/95 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-5 shadow-xl backdrop-blur transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                      Pothole • Bandra West
                    </span>
                    <StatusBadge status="In Progress" size="xs" />
                  </div>

                  <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-sand-50 mb-1">
                    Deep Hazardous Pothole on Hill Road
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                    <span>Near Marks & Spencer, Bandra West, Mumbai</span>
                  </p>

                  {/* Micro Visual Map Preview */}
                  <div className="h-28 rounded-xl bg-sand-100 dark:bg-charcoal-700 relative overflow-hidden border border-sand-200 dark:border-charcoal-600">
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80"
                      alt="Map sample"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white/50 animate-bounce">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="mt-3 pt-3 border-t border-sand-100 dark:border-charcoal-700 flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                    <span>Field Team: Suresh Patil</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Asphalt roller dispatched
                    </span>
                  </div>
                </div>

                {/* 2. Floating Live Notification Toast Overlay */}
                <div className="transform -translate-y-2 translate-x-2 bg-white/95 dark:bg-charcoal-800/95 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-charcoal-900 dark:text-sand-100">
                      Issue Resolved • Linking Road
                    </p>
                    <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 truncate">
                      Sanitation crew cleared dumpster with photo proof
                    </p>
                  </div>
                  <span className="text-[10px] text-charcoal-400 shrink-0">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRICS & IMPACT BAR */}
      <section className="py-12 bg-white dark:bg-charcoal-800/50 border-b border-sand-200 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-brand-600 dark:text-brand-400">
                15+
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mt-1">
                Mumbai Wards Tracked
              </p>
            </div>
            <div className="p-4">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-sand-100">
                24 hrs
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mt-1">
                Avg Resolution Time
              </p>
            </div>
            <div className="p-4">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-terracotta-500">
                100%
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mt-1">
                Verified Photo Proof
              </p>
            </div>
            <div className="p-4">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                Live
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400 mt-1">
                Real-Time Sockets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR-STEP MUNICIPAL PIPELINE */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Transparent Workflow
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-sand-50">
            From street report to verified resolution
          </h2>
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
            A modernized civic workflow replacing sluggish bureau phone lines with transparent
            ticket tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-serif font-bold text-base">
              01
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-sand-100">
              Pin & Snap
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
              Drop an exact location pin on our interactive Mumbai map and upload a photo of the
              civic defect.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-serif font-bold text-base">
              02
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-sand-100">
              Admin Dispatch
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
              Ward administrators assign the ticket to the designated sanitation or road repair
              crew.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-serif font-bold text-base">
              03
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-sand-100">
              Crew In Progress
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
              Field workers mark progress and communicate timeline estimates directly on the ticket.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-serif font-bold text-base">
              04
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-sand-100">
              Verified Proof
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
              Upon finishing work, staff uploads photographic proof. The citizen is notified
              instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="py-16 bg-brand-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            See a civic hazard in your neighbourhood?
          </h2>
          <p className="text-sand-200 text-sm max-w-xl mx-auto leading-relaxed">
            Join thousands of active citizens making Mumbai cleaner, brighter, and safer every day.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? '/report' : '/login?tab=register'}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-brand-800 hover:bg-sand-100 font-semibold text-sm shadow-md transition-all hover:scale-105"
            >
              <span>Get Started Now — It takes 30 seconds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
