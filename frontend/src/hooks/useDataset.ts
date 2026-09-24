import { useState, useEffect, useCallback, useRef } from 'react';
import { DatasetRecord, DatasetFilters } from '../types';
import { api, ApiError } from '../services/api';

export function useDataset(initialPageSize = 15) {
  const [records, setRecords] = useState<DatasetRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedRiver, setSelectedRiver] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [availableFilters, setAvailableFilters] = useState<DatasetFilters>({
    rivers: [],
    states: [],
    years: [],
    classes: ['Class A', 'Class B', 'Class C', 'Class D', 'Class E']
  });

  const abortCtrlRef = useRef<AbortController | null>(null);

  // Load available filter lists once on mount
  useEffect(() => {
    let mounted = true;
    api.getFilters()
      .then((f) => {
        if (mounted) setAvailableFilters(f);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const fetchRecords = useCallback(async () => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getDataset({
        search: search.trim() || undefined,
        river: selectedRiver || undefined,
        state: selectedState || undefined,
        year: selectedYear ? parseInt(selectedYear, 10) : undefined,
        cpcb_class: selectedClass || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize
      }, ctrl.signal);

      setRecords(res.records);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to fetch historical monitoring records.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedRiver, selectedState, selectedYear, selectedClass, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const resetFilters = () => {
    setSearch('');
    setSelectedRiver('');
    setSelectedState('');
    setSelectedYear('');
    setSelectedClass('');
    setSortBy('id');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search.trim() || selectedRiver || selectedState || selectedYear || selectedClass || sortBy !== 'id' || sortOrder !== 'asc'
  );

  return {
    records,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    selectedRiver,
    setSelectedRiver,
    selectedState,
    setSelectedState,
    selectedYear,
    setSelectedYear,
    selectedClass,
    setSelectedClass,
    sortBy,
    sortOrder,
    handleSort,
    availableFilters,
    hasActiveFilters,
    resetFilters,
    refetch: fetchRecords,
    exportCsvUrl: api.exportCsvUrl()
  };
}
