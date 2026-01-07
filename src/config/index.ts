// ============================================
// Application Configuration
// Environment-based settings
// ============================================

interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  tokenKey: string;
  refreshTokenKey: string;
  tokenExpiryBuffer: number; // minutes before expiry to refresh
  maxRetries: number;
  retryDelay: number;
  paginationDefaults: {
    pageSize: number;
    pageSizeOptions: number[];
  };
  features: {
    enableOfflineMode: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
}

const getEnvVar = (key: string, defaultValue: string): string => {
  // In a real app, this would read from import.meta.env
  // For demo purposes, we use defaults
  return defaultValue;
};

export const config: AppConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
  apiTimeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
  tokenKey: 'enterprise_auth_token',
  refreshTokenKey: 'enterprise_refresh_token',
  tokenExpiryBuffer: 5,
  maxRetries: 3,
  retryDelay: 1000,
  paginationDefaults: {
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
    enableAnalytics: true,
  },
};

// Navigation configuration
export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    permissions: ['admin', 'manager', 'user'] as const,
  },
  {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: 'Users',
    permissions: ['admin', 'manager'] as const,
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
    icon: 'Package',
    permissions: ['admin', 'manager', 'user'] as const,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    permissions: ['admin', 'manager'] as const,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    permissions: ['admin'] as const,
  },
];

// Dashboard widget configuration
export const dashboardWidgetsConfig = {
  admin: [
    { id: 'total-users', type: 'metric', title: 'Total Users', size: 'small', order: 1 },
    { id: 'total-products', type: 'metric', title: 'Total Products', size: 'small', order: 2 },
    { id: 'revenue', type: 'metric', title: 'Revenue', size: 'small', order: 3 },
    { id: 'active-sessions', type: 'metric', title: 'Active Sessions', size: 'small', order: 4 },
    { id: 'sales-chart', type: 'chart', title: 'Sales Overview', size: 'large', order: 5 },
    { id: 'activity-chart', type: 'chart', title: 'User Activity', size: 'medium', order: 6 },
    { id: 'recent-orders', type: 'table', title: 'Recent Orders', size: 'medium', order: 7 },
    { id: 'top-products', type: 'list', title: 'Top Products', size: 'medium', order: 8 },
  ],
  manager: [
    { id: 'team-members', type: 'metric', title: 'Team Members', size: 'small', order: 1 },
    { id: 'pending-tasks', type: 'metric', title: 'Pending Tasks', size: 'small', order: 2 },
    { id: 'completed-tasks', type: 'metric', title: 'Completed Tasks', size: 'small', order: 3 },
    { id: 'team-performance', type: 'chart', title: 'Team Performance', size: 'large', order: 4 },
    { id: 'recent-activities', type: 'list', title: 'Recent Activities', size: 'medium', order: 5 },
  ],
  user: [
    { id: 'my-tasks', type: 'metric', title: 'My Tasks', size: 'small', order: 1 },
    { id: 'completed', type: 'metric', title: 'Completed', size: 'small', order: 2 },
    { id: 'productivity-chart', type: 'chart', title: 'My Productivity', size: 'large', order: 3 },
    { id: 'assigned-items', type: 'list', title: 'Assigned Items', size: 'medium', order: 4 },
  ],
};

export default config;
