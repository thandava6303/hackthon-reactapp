// ============================================
// Pagination Hook
// Handles pagination state and logic
// ============================================

import { useState, useCallback, useMemo } from 'react';
import { config } from '@/config';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  pageNumbers: number[];
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  initialPageSize = config.paginationDefaults.pageSize,
}: UsePaginationProps): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const startIndex = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const endIndex = useMemo(() => Math.min(startIndex + pageSize - 1, totalItems - 1), [startIndex, pageSize, totalItems]);

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Generate page numbers for pagination UI
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    hasPreviousPage,
    hasNextPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    pageNumbers,
  };
};
