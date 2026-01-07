// ============================================
// Reports Page
// Analytics and reporting dashboard
// ============================================

import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Chart colors
const CHART_COLORS = {
  primary: 'hsl(217, 91%, 40%)',
  accent: 'hsl(173, 80%, 40%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
};

// Sample data
const monthlyData = [
  { month: 'Jan', revenue: 65000, orders: 320, users: 150 },
  { month: 'Feb', revenue: 72000, orders: 380, users: 180 },
  { month: 'Mar', revenue: 85000, orders: 420, users: 220 },
  { month: 'Apr', revenue: 78000, orders: 390, users: 200 },
  { month: 'May', revenue: 92000, orders: 480, users: 280 },
  { month: 'Jun', revenue: 105000, orders: 520, users: 320 },
  { month: 'Jul', revenue: 98000, orders: 490, users: 290 },
  { month: 'Aug', revenue: 115000, orders: 580, users: 380 },
  { month: 'Sep', revenue: 125000, orders: 620, users: 420 },
  { month: 'Oct', revenue: 118000, orders: 590, users: 400 },
  { month: 'Nov', revenue: 135000, orders: 680, users: 480 },
  { month: 'Dec', revenue: 150000, orders: 750, users: 520 },
];

const categoryData = [
  { category: 'Electronics', sales: 45000, returns: 2500 },
  { category: 'Clothing', sales: 32000, returns: 1800 },
  { category: 'Home', sales: 28000, returns: 1200 },
  { category: 'Sports', sales: 18000, returns: 800 },
  { category: 'Books', sales: 12000, returns: 300 },
];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('year');
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, item) => sum + item.orders, 0);
  const totalUsers = monthlyData[monthlyData.length - 1].users;
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+23.5% from last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+18.2% from last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+45.8% from last year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(avgOrderValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+5.3% from last year</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>Monthly performance over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary }}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="orders" 
                    stroke={CHART_COLORS.accent} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.accent }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Sales vs Returns by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} name="Sales" />
                  <Bar dataKey="returns" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]} name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
