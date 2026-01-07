// ============================================
// Data Table Component
// Enterprise-grade table with virtualization
// ============================================

import { memo, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { config } from '@/config';

export interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: number | string;
  className?: string;
  cell?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;
  rowKey: keyof T | ((row: T) => string);
  emptyTitle?: string;
  emptyDescription?: string;
  enableVirtualization?: boolean;
  rowHeight?: number;
  maxHeight?: number;
}

function DataTableInner<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  pagination,
  onPageChange,
  onPageSizeChange,
  sortConfig,
  onSort,
  onRowClick,
  rowKey,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  enableVirtualization = false,
  rowHeight = 52,
  maxHeight = 600,
}: DataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const getRowKey = useCallback(
    (row: T): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return String(row[rowKey]);
    },
    [rowKey]
  );

  const getCellValue = useCallback((row: T, accessor: Column<T>['accessor']): unknown => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  }, []);

  // Virtual rows for large datasets
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="card-enterprise p-8">
        <LoadingSpinner text="Loading data..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card-enterprise p-8">
        <EmptyState
          title="Error loading data"
          description={error}
        />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="card-enterprise">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  const renderSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.field !== columnId) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="card-enterprise overflow-hidden">
      {/* Table */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: enableVirtualization ? maxHeight : undefined }}
      >
        <table className="table-enterprise">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(column.className)}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => onSort(column.id)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {column.header}
                      {renderSortIcon(column.id)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enableVirtualization ? (
              <>
                {virtualRows.length > 0 && (
                  <tr style={{ height: virtualRows[0].start }} />
                )}
                {virtualRows.map((virtualRow) => {
                  const row = data[virtualRow.index];
                  return (
                    <tr
                      key={getRowKey(row)}
                      onClick={() => onRowClick?.(row)}
                      className={cn(onRowClick && 'cursor-pointer')}
                      style={{ height: rowHeight }}
                    >
                      {columns.map((column) => {
                        const value = getCellValue(row, column.accessor);
                        return (
                          <td key={column.id} className={column.className}>
                            {column.cell ? column.cell(value, row) : String(value ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {virtualRows.length > 0 && (
                  <tr style={{ height: virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end }} />
                )}
              </>
            ) : (
              data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => {
                    const value = getCellValue(row, column.accessor);
                    return (
                      <td key={column.id} className={column.className}>
                        {column.cell ? column.cell(value, row) : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.paginationDefaults.pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DataTable = memo(DataTableInner) as typeof DataTableInner;

export default DataTable;
