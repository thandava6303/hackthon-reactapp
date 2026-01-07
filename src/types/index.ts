// ============================================
// Core Application Types
// Enterprise Frontend Assessment
// ============================================

// User & Authentication Types
export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

// Table & Data Types
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: string | number | string[] | number[];
}

export interface TableState {
  page: number;
  pageSize: number;
  sort: SortConfig | null;
  filters: FilterConfig[];
  search: string;
}

// Product Entity
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  config: Record<string, unknown>;
  permissions: UserRole[];
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
}

export interface MetricData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  permissions: UserRole[];
  children?: NavItem[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  validation?: Record<string, unknown>;
}

// UI State Types
export interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  isOnline: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
}

// Permission Types
export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'dashboard:admin'
  | 'dashboard:manager'
  | 'reports:read'
  | 'reports:export'
  | 'settings:read'
  | 'settings:write';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'products:read', 'products:write', 'products:delete',
    'dashboard:admin', 'dashboard:manager',
    'reports:read', 'reports:export',
    'settings:read', 'settings:write',
  ],
  manager: [
    'users:read',
    'products:read', 'products:write',
    'dashboard:manager',
    'reports:read', 'reports:export',
  ],
  user: [
    'products:read',
    'reports:read',
  ],
};
