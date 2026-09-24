import React, { useState } from 'react';
import { Menu, X, Droplet, Activity } from 'lucide-react';
import { PageId } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isBackendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onSelectPage,
  isBackendOnline = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'overview', label: 'Dashboard' },
    { id: 'analyze', label: 'Analyze Water' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'historical', label: 'Historical Data' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'stations', label: 'Stations' },
    { id: 'map', label: 'Map View' },
    { id: 'methodology', label: 'Methodology' },
  ];

  const pageTitles: Record<PageId, string> = {
    home: 'AquaSense Platform',
    overview: 'River Health Dashboard',
    analyze: 'Water Quality Analyzer',
    forecast: 'Water Quality Forecast',
    historical: 'Historical CPCB Records',
    analytics: 'Environmental & Model Analytics',
    stations: 'River Monitoring Stations',
    map: 'Geospatial River Map',
    methodology: 'Hybrid Architecture & Methodology',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#09172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Mobile Hamburger & Brand */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">💧</span>
            <span className="font-bold text-base text-slate-800 dark:text-slate-100">AquaSense</span>
          </div>
        </div>

        {/* Current Page Title on Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {pageTitles[currentPage]}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Central Pollution Control Board Standards + Random Forest ML
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{isBackendOnline ? '12 Features Synced' : 'Offline Mode'}</span>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1.5 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left text-xs font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
