import React from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  TrendingUp, 
  Database, 
  BarChart3, 
  Radio, 
  MapPin, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Waves,
  X
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyzer', icon: FlaskConical },
  { id: 'forecast', label: 'Trend Projection', icon: TrendingUp },
  { id: 'historical', label: 'Historical Records', icon: Database },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'stations', label: 'Monitoring Stations', icon: Radio },
  { id: 'map', label: 'Map View', icon: MapPin },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d1424] text-deep border-r border-line transition-all duration-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-line shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2.5 text-left group overflow-hidden focus:outline-hidden"
          title="AquaSense Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-sea/10 border border-sea/25 flex items-center justify-center text-sea shrink-0 transition-transform group-hover:scale-105">
            <Waves className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-semibold text-[15px] tracking-tight text-deep block leading-none">
                AquaSense
              </span>
              <span className="text-[11px] font-mono text-soft tracking-wider block mt-0.5">
                RIVER INTELLIGENCE
              </span>
            </div>
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-soft hover:text-deep hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'overview' && currentPage === 'home');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-deep font-semibold'
                  : 'text-mid hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-deep'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-sea' : 'text-soft group-hover:text-mid'
                }`} 
              />
              {!collapsed && (
                <span className="truncate text-left flex-1">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="w-1.5 h-1.5 rounded-full bg-sea shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer / Collapse Toggle on Desktop */}
      <div className="p-3 border-t border-line hidden lg:flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] text-soft font-mono truncate pl-1">
            CPCB Verified · RF
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-soft hover:text-deep hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
