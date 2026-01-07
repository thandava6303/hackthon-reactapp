// ============================================
// Permissions Hook
// Role-based permission checking
// ============================================

import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectUserRole } from '@/features/auth/authSlice';
import type { Permission, UserRole } from '@/types';
import { ROLE_PERMISSIONS } from '@/types';

export const usePermissions = () => {
  const userRole = useAppSelector(selectUserRole);

  const permissions = useMemo(() => {
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  const canAccessRoute = useCallback(
    (allowedRoles: readonly UserRole[]): boolean => {
      if (!userRole) return false;
      return allowedRoles.includes(userRole);
    },
    [userRole]
  );

  return {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
  };
};
