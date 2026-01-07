// ============================================
// Status Badge Component
// Displays status with appropriate styling
// ============================================

import { memo } from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'info' | 'discontinued';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'badge-success' },
  inactive: { label: 'Inactive', className: 'badge-destructive' },
  pending: { label: 'Pending', className: 'badge-warning' },
  success: { label: 'Success', className: 'badge-success' },
  warning: { label: 'Warning', className: 'badge-warning' },
  error: { label: 'Error', className: 'badge-destructive' },
  info: { label: 'Info', className: 'badge-info' },
  discontinued: { label: 'Discontinued', className: 'badge-destructive' },
};

const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status.toLowerCase()] || { label: status, className: 'badge-info' };

  return (
    <span className={cn('badge-status', config.className, className)}>
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
