import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  X, 
  ChevronRight,
  ArrowRight,
  LayoutDashboard,
  FlaskConical,
  TrendingUp,
  Database,
  BarChart3,
  Radio,
  MapPin,
  BookOpen
} from 'lucide-react';
import { PageId } from '../types';
import { ApiStatusBadge } from './common/ApiStatusBadge';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobileSidebar: () => void;
  onNavigate: (page: PageId) => void;
}

const PAGE_TITLES: Record<PageId, string> = {
  home: 'Overview',
  overview: 'Overview',
  analyze: 'Diagnostic Analyzer',
  forecast: 'Trend Projection',
  historical: 'Historical Records',
  analytics: 'Environmental Analytics',
  stations: 'Monitoring Stations',
  map: 'Geospatial Map',
  methodology: 'Methodology & Science',
};

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
  { label: 'Ganga Basin', category: 'River Basin', page: 'forecast', description: 'Trend projections and observations for River Ganga' },
  { label: 'Yamuna Basin', category: 'River Basin', page: 'forecast', description: 'Critical water quality trends for River Yamuna' },
  { label: 'Sabarmati Basin', category: 'River Basin', page: 'forecast', description: 'Longitudinal monitoring along Sabarmati' },
  { label: 'Narmada Basin', category: 'River Basin', page: 'forecast', description: 'Water quality index records along Narmada reach' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileSidebar,
  onNavigate,
}) => {
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
      <header className="sticky top-0 z-20 h-16 bg-white/85 dark:bg-[#0b1120]/85 backdrop-blur-md border-b border-line px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-soft hover:text-deep hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs text-soft font-medium">
            <span className="text-mid hover:text-deep transition-colors cursor-pointer" onClick={() => onNavigate('overview')}>
              AquaSense
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-soft" />
            <span className="text-deep font-semibold">
              {PAGE_TITLES[currentPage] || 'Overview'}
            </span>
          </nav>
        </div>

        {/* Center: Clean Quick Jump / Search Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full h-9 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-line text-left text-xs text-soft hover:text-mid hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-soft group-hover:text-sea transition-colors" />
              <span>Search intelligence, rivers, metrics...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-soft bg-white dark:bg-slate-900 border border-line rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: API Status, Theme Toggle & Compact Search (Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-soft hover:text-deep hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <ApiStatusBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Global Quick-Jump Search Modal */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-3 border-b border-line flex items-center gap-3">
              <Search className="w-4 h-4 text-sea shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search pages, basins, or features..."
                className="w-full bg-transparent text-sm text-deep placeholder:text-soft focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-soft hover:text-deep hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-soft">
                  No matching platform sections or rivers found.
                </div>
              ) : (
                filteredResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectResult(item.page)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-deep">
                          {item.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-soft font-mono">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-mid mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-soft group-hover:text-sea group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-line text-[11px] text-soft flex items-center justify-between px-4">
              <span>Navigation shortcut</span>
              <span>Press <kbd className="font-mono">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
