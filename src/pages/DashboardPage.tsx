// ============================================
// Dashboard Page
// Role-based dashboard with widgets and charts
// ============================================

import { useEffect, useState, memo } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAppSelector } from '@/app/hooks';
import { selectUser } from '@/features/auth/authSlice';
import { mockApi } from '@/services/mockApi';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Widget Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

const MetricCard = memo(({ title, value, change, icon: Icon, trend, isLoading }: MetricCardProps) => (
  <Card className="widget-card animate-fade-in">
    <div className="widget-card-header">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          trend === 'neutral' && 'text-muted-foreground'
        )}>
          {trend === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4" />}
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
    {isLoading ? (
      <div className="skeleton-pulse h-9 w-24 mt-2" />
    ) : (
      <>
        <p className="widget-card-value">{value}</p>
        <p className="widget-card-title mt-1">{title}</p>
      </>
    )}
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Chart colors
const CHART_COLORS = {
  primary: 'hsl(217, 91%, 40%)',
  accent: 'hsl(173, 80%, 40%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)',
  chart5: 'hsl(280, 65%, 60%)',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.info];

const DashboardPage = () => {
  const user = useAppSelector(selectUser);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [salesData, setSalesData] = useState<Record<string, unknown> | null>(null);
  const [usersData, setUsersData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, sales, users] = await Promise.all([
          mockApi.getDashboardMetrics(),
          mockApi.getChartData('sales'),
          mockApi.getChartData('users'),
        ]);
        setMetrics(metricsData);
        setSalesData(sales);
        setUsersData(users);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Prepare chart data
  const revenueChartData = salesData ? 
    (salesData.labels as string[]).map((label, i) => ({
      name: label,
      revenue: (salesData.datasets as { data: number[] }[])[0]?.data[i] || 0,
      orders: (salesData.datasets as { data: number[] }[])[1]?.data[i] || 0,
    })) : [];

  const userActivityData = usersData ?
    (usersData.labels as string[]).map((label, i) => ({
      name: label,
      newUsers: (usersData.datasets as { data: number[] }[])[0]?.data[i] || 0,
      activeUsers: (usersData.datasets as { data: number[] }[])[1]?.data[i] || 0,
    })) : [];

  // Category distribution for pie chart
  const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Home', value: 20 },
    { name: 'Sports', value: 12 },
    { name: 'Other', value: 8 },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: 'New order placed', user: 'John Smith', time: '2 min ago', type: 'order' },
    { id: 2, action: 'User registered', user: 'Jane Doe', time: '15 min ago', type: 'user' },
    { id: 3, action: 'Product updated', user: 'Mike Johnson', time: '1 hour ago', type: 'product' },
    { id: 4, action: 'Payment received', user: 'Sarah Wilson', time: '2 hours ago', type: 'payment' },
    { id: 5, action: 'New review added', user: 'Tom Brown', time: '3 hours ago', type: 'review' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground capitalize">
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics ? formatNumber(metrics.totalUsers) : '-'}
          change={12.5}
          trend="up"
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Products"
          value={metrics ? formatNumber(metrics.totalProducts) : '-'}
          change={8.2}
          trend="up"
          icon={Package}
          isLoading={isLoading}
        />
        <MetricCard
          title="Revenue"
          value={metrics ? formatCurrency(metrics.revenue) : '-'}
          change={23.1}
          trend="up"
          icon={DollarSign}
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Sessions"
          value={metrics ? formatNumber(metrics.orders) : '-'}
          change={-3.2}
          trend="down"
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View Details <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="newUsers" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activeUsers" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 h-2 w-2 rounded-full',
                    activity.type === 'order' && 'bg-success',
                    activity.type === 'user' && 'bg-primary',
                    activity.type === 'product' && 'bg-accent',
                    activity.type === 'payment' && 'bg-warning',
                    activity.type === 'review' && 'bg-info'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
