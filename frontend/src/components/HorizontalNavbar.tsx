import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets,
  Search, 
  X, 
  Menu,
  LayoutDashboard,
  FlaskConical,
  TrendingUp,
  Database,
  BarChart3,
  Radio,
  MapPin,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PageId } from '../types';
import { ApiStatusBadge } from './common/ApiStatusBadge';
import { ThemeToggle } from './ThemeToggle';

interface HorizontalNavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'analyze', label: 'Analyzer', shortLabel: 'Analyzer', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'forecast', label: 'Trend Projection', shortLabel: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'historical', label: 'Historical Data', shortLabel: 'Data', icon: <Database className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'stations', label: 'Stations', shortLabel: 'Stations', icon: <Radio className="w-4 h-4" /> },
  { id: 'map', label: 'Map View', shortLabel: 'Map', icon: <MapPin className="w-4 h-4" /> },
  { id: 'methodology', label: 'Methodology', shortLabel: 'Docs', icon: <BookOpen className="w-4 h-4" /> },
];

interface SearchResult {
  label: string;
  category: 'Page' | 'River Basin' | 'Feature';
  page: PageId;
  description: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  { label: 'Overview Dashboard', category: 'Page', page: 'overview', description: 'Executive summary KPIs and CPCB class distribution' },
  { label: 'Diagnostic Analyzer', category: 'Page', page: 'analyze', description: 'In-situ parameter modeling, WQI, and dual-sample comparison' },
  { label: 'Trend Projection', category: 'Page', page: 'forecast', description: 'Multi-year linear trend analysis for 6 river basins' },
  { label: 'Historical Records', category: 'Page', page: 'historical', description: 'Explore 1,864 CPCB monitoring records (2013–2023)' },
  { label: 'Environmental Analytics', category: 'Page', page: 'analytics', description: 'Pearson correlations, histograms, and RF performance' },
  { label: 'Monitoring Stations', category: 'Page', page: 'stations', description: 'Registry of 60 river monitoring stations across India' },
  { label: 'Geospatial Map View', category: 'Page', page: 'map', description: 'Interactive spatial coordinates and river reaches' },
  { label: 'Scientific Methodology', category: 'Page', page: 'methodology', description: 'Statutory CPCB rules, feature equations, and RF provenance' },
  { label: 'Godavari Basin', category: 'River Basin', page: 'forecast', description: 'Trend projections and observations for River Godavari' },
  { label: 'Krishna Basin', category: 'River Basin', page: 'forecast', description: 'Basin telemetry and longitudinal metrics along Krishna' },
  { label: 'Mahanadi Basin', category: 'River Basin', page: 'forecast', description: 'Water quality observations along Mahanadi reach' },
  { label: 'Narmada Basin', category: 'River Basin', page: 'forecast', description: 'Water quality index records along Narmada reach' },
  { label: 'Sabarmati Basin', category: 'River Basin', page: 'forecast', description: 'Longitudinal monitoring and trends along Sabarmati' },
  { label: 'Yamuna Basin', category: 'River Basin', page: 'forecast', description: 'Critical water quality trends for River Yamuna' },
];

export const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
  currentPage,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const filteredResults = SEARCH_ITEMS.filter(item => 
    !searchQuery || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectResult = (page: PageId) => {
    onNavigate(page);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#10252e]/90 backdrop-blur-md border-b border-line transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Name */}
            <div 
              onClick={() => onNavigate('overview')}
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-sea/10 dark:bg-sea/20 flex items-center justify-center text-sea border border-sea/20 group-hover:scale-105 transition-transform shadow-xs">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-xl text-deep tracking-tight">
                    AquaSense
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sea/10 text-sea border border-sea/20">
                    Tide
                  </span>
                </div>
                <span className="text-[10px] text-soft -mt-0.5 hidden sm:block">
                  River Water Intelligence
                </span>
              </div>
            </div>

            {/* Desktop Horizontal Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.id || (item.id === 'overview' && currentPage === 'home');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-sea/12 text-sea font-semibold shadow-xs border border-sea/20'
                        : 'text-mid hover:text-deep hover:bg-sky/80 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-sea' : 'text-soft'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Medium screen navigation (compact) */}
            <nav className="hidden md:flex xl:hidden items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.id || (item.id === 'overview' && currentPage === 'home');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    title={item.label}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-sea/12 text-sea font-semibold border border-sea/20'
                        : 'text-mid hover:text-deep hover:bg-sky/80 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{item.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side Utility Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-xl bg-sky dark:bg-white/5 border border-line text-xs text-soft hover:text-deep hover:border-sea/40 transition-all cursor-pointer shadow-xs"
                title="Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-soft" />
                <span className="hidden lg:inline text-[11.5px]">Search...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9.5px] font-mono text-soft bg-white dark:bg-white/10 border border-line rounded">
                  ⌘K
                </kbd>
              </button>

              {/* API Status Badge */}
              <div className="hidden sm:block">
                <ApiStatusBadge />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden p-2 rounded-xl text-soft hover:text-deep hover:bg-sky dark:hover:bg-white/5 transition-colors border border-line"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-line bg-white/95 dark:bg-[#10252e]/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-elevated">
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.id || (item.id === 'overview' && currentPage === 'home');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-sea/15 text-sea font-semibold border border-sea/25'
                        : 'text-mid hover:text-deep hover:bg-sky dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={isActive ? 'text-sea' : 'text-soft'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-soft">
              <span>Platform Health:</span>
              <ApiStatusBadge />
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette / Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-deep/30 dark:bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-white dark:bg-[#10252e] rounded-2xl shadow-elevated border border-line overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Search Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
              <Search className="w-4 h-4 text-sea shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to a view or search river basins..."
                className="flex-1 text-sm bg-transparent border-none text-deep placeholder:text-soft focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-soft hover:text-deep hover:bg-sky dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-line/40">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectResult(item.page)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-sky dark:hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex flex-col pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-deep group-hover:text-sea transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky dark:bg-white/10 text-soft border border-line">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-soft line-clamp-1 mt-0.5">
                        {item.description}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-soft group-hover:text-sea group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-soft">
                  No matching river basins or features found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-sky/60 dark:bg-white/5 border-t border-line flex items-center justify-between text-[11px] text-soft">
              <span>Press <kbd className="font-mono bg-white dark:bg-white/10 px-1 py-0.5 rounded border border-line">Esc</kbd> to exit</span>
              <span>AquaSense Environmental Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
