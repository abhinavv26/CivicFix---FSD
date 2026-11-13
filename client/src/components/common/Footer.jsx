import React from 'react';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-sand-200/80 dark:border-charcoal-800 bg-sand-100/60 dark:bg-charcoal-900/60 mt-auto py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight text-charcoal-900 dark:text-sand-50">
                CivicFix
              </span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 max-w-sm leading-relaxed">
              CivicFix transforms municipal maintenance into a transparent, accountable partnership
              between active citizens and municipal field engineers across Mumbai.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-charcoal-500 dark:text-charcoal-400 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All 24 Municipal Wards Online (H-West, K-East, F-North, etc.)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 dark:text-sand-100 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-600 dark:text-charcoal-400">
              <li>
                <Link to="/explore" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Interactive City Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Report a Civic Hazard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Staff & Field Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 dark:text-sand-100 mb-3">
              Core Categories
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-600 dark:text-charcoal-400">
              <li>Potholes & Asphalt Degradation</li>
              <li>Community Dumpsters & Garbage</li>
              <li>Streetlights & Illumination</li>
              <li>Drinking Water & Sewer Leakage</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-sand-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 gap-3">
          <p>© {new Date().getFullYear()} CivicFix Platform. Local Civic Issue Reporting System.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for transparent municipal governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
