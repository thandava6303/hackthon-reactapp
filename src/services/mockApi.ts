// ============================================
// Mock API Service
// Simulates backend for demo purposes
// ============================================

import type { User, Product, AuthResponse, PaginatedResponse, UserRole } from '@/types';

// Generate mock data
const generateUsers = (count: number): User[] => {
  const roles: UserRole[] = ['admin', 'manager', 'user'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@enterprise.com`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: Math.random() > 0.1,
  }));
};

const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Health'];
  const statuses: Product['status'][] = ['active', 'inactive', 'discontinued'];
  const adjectives = ['Premium', 'Essential', 'Professional', 'Classic', 'Modern', 'Ultra', 'Smart', 'Eco'];
  const nouns = ['Widget', 'Device', 'Tool', 'Kit', 'System', 'Solution', 'Module', 'Pack'];

  return Array.from({ length: count }, (_, i) => ({
    id: `prod-${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(6, '0')}`,
    name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${i + 1}`,
    description: `High-quality product with excellent features and durability. Perfect for professional and personal use.`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Math.round((Math.random() * 999 + 10) * 100) / 100,
    stock: Math.floor(Math.random() * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Initialize mock data
let mockUsers = generateUsers(10000);
let mockProducts = generateProducts(10000);

// Demo users for authentication
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@enterprise.com': {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@enterprise.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'IT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  },
  'manager@enterprise.com': {
    password: 'manager123',
    user: {
      id: 'manager-1',
      email: 'manager@enterprise.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      department: 'Sales',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  },
  'user@enterprise.com': {
    password: 'user123',
    user: {
      id: 'user-1',
      email: 'user@enterprise.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      department: 'Marketing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  },
};

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API methods
export const mockApi = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(800);
    
    const demoUser = demoUsers[email];
    if (!demoUser || demoUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    return {
      user: demoUser.user,
      token: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`,
      expiresIn: 3600,
    };
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    await delay(300);
    
    if (!refreshToken.startsWith('mock-refresh-token')) {
      throw new Error('Invalid refresh token');
    }

    // Return admin user for demo
    return {
      user: demoUsers['admin@enterprise.com'].user,
      token: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`,
      expiresIn: 3600,
    };
  },

  // Users
  async getUsers(page: number, pageSize: number, search: string): Promise<PaginatedResponse<User>> {
    await delay(500);

    let filtered = mockUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = mockUsers.filter(
        (u) =>
          u.firstName.toLowerCase().includes(searchLower) ||
          u.lastName.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  },

  async getUserById(id: string): Promise<User> {
    await delay(300);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    await delay(500);
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: userData.role || 'user',
      department: userData.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    mockUsers = [newUser, ...mockUsers];
    return newUser;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await delay(500);
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    return mockUsers[index];
  },

  async deleteUser(id: string): Promise<void> {
    await delay(500);
    mockUsers = mockUsers.filter((u) => u.id !== id);
  },

  // Products
  async getProducts(page: number, pageSize: number, search: string, category: string): Promise<PaginatedResponse<Product>> {
    await delay(500);

    let filtered = mockProducts;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  },

  async getProductById(id: string): Promise<Product> {
    await delay(300);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: `SKU-${Date.now()}`,
      name: productData.name || '',
      description: productData.description || '',
      category: productData.category || 'General',
      price: productData.price || 0,
      stock: productData.stock || 0,
      status: productData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    await delay(500);
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(500);
    mockProducts = mockProducts.filter((p) => p.id !== id);
  },

  // Dashboard
  async getDashboardMetrics(): Promise<Record<string, number>> {
    await delay(400);
    return {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter((u) => u.isActive).length,
      totalProducts: mockProducts.length,
      activeProducts: mockProducts.filter((p) => p.status === 'active').length,
      revenue: 1234567.89,
      orders: 5678,
      conversionRate: 3.45,
      avgOrderValue: 217.34,
    };
  },

  async getChartData(type: string): Promise<Record<string, unknown>> {
    await delay(400);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (type === 'sales') {
      return {
        labels: months,
        datasets: [
          {
            label: 'Revenue',
            data: months.map(() => Math.floor(Math.random() * 100000) + 50000),
            color: 'primary',
          },
          {
            label: 'Orders',
            data: months.map(() => Math.floor(Math.random() * 500) + 200),
            color: 'accent',
          },
        ],
      };
    }

    if (type === 'users') {
      return {
        labels: months,
        datasets: [
          {
            label: 'New Users',
            data: months.map(() => Math.floor(Math.random() * 200) + 50),
            color: 'success',
          },
          {
            label: 'Active Users',
            data: months.map(() => Math.floor(Math.random() * 1000) + 500),
            color: 'primary',
          },
        ],
      };
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Data',
          data: months.map(() => Math.floor(Math.random() * 100)),
          color: 'primary',
        },
      ],
    };
  },
};

export default mockApi;
