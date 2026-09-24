import React, { useState, useCallback } from 'react';
import { PageId, WaterParameters } from './types';
import { HorizontalNavbar } from './components/HorizontalNavbar';
import { DashboardOverview } from './pages/DashboardOverview';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ForecastPage } from './pages/ForecastPage';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { StationsPage } from './pages/StationsPage';
import { MapViewPage } from './pages/MapViewPage';
import { MethodologyPage } from './pages/MethodologyPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [stationParamsForAnalysis, setStationParamsForAnalysis] = useState<WaterParameters | undefined>(undefined);

  const navigateTo = useCallback((page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectStationForAnalysis = useCallback((params: WaterParameters) => {
    setStationParamsForAnalysis(params);
    setCurrentPage('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-sky text-deep font-sans antialiased selection:bg-sea selection:text-white flex flex-col transition-colors duration-200">
      {/* Sleek Horizontal Top Navigation Bar */}
      <HorizontalNavbar
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* Main Spacious Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        {(currentPage === 'overview' || currentPage === 'home') && (
          <DashboardOverview onNavigate={navigateTo} />
        )}

        {currentPage === 'analyze' && (
          <AnalyzerPage 
            initialParams={stationParamsForAnalysis} 
            onSelectStation={() => navigateTo('stations')}
          />
        )}

        {currentPage === 'forecast' && (
          <ForecastPage />
        )}

        {currentPage === 'historical' && (
          <HistoricalDataPage />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage />
        )}

        {currentPage === 'stations' && (
          <StationsPage onSelectStationForAnalysis={handleSelectStationForAnalysis} />
        )}

        {currentPage === 'map' && (
          <MapViewPage onSelectStationForAnalysis={handleSelectStationForAnalysis} />
        )}

        {currentPage === 'methodology' && (
          <MethodologyPage />
        )}
      </main>

      {/* Serene Coastal Footer */}
      <footer className="border-t border-line py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-soft">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-deep">AquaSense</span>
          <span>&bull;</span>
          <span>River Water Quality Intelligence Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <span>CPCB National Monitoring Registry (2013–2023)</span>
          <span>&bull;</span>
          <span>Ensemble Machine Learning</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
