// ============================================
// App Header Component
// Top navigation bar with search and notifications
// ============================================

import { memo, useState } from 'react';
import { Search, Bell, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { selectSidebarCollapsed, selectIsOnline, selectUnreadNotificationsCount } from '@/features/ui/uiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; path?: string }[];
}

const AppHeader = memo(({ title, breadcrumbs }: AppHeaderProps) => {
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const isOnline = useAppSelector(selectIsOnline);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 transition-all duration-300',
        isCollapsed ? 'ml-[72px]' : 'ml-64'
      )}
    >
      {/* Breadcrumbs */}
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <span className="mx-1">/</span>}
                <span className={cn(index === breadcrumbs.length - 1 && 'text-foreground font-medium')}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-input"
        />
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 text-warning">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Welcome to Enterprise App</span>
              <span className="text-xs text-muted-foreground">
                Get started by exploring the dashboard and features.
              </span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;
