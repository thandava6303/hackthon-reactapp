// ============================================
// App Sidebar Component
// Main navigation sidebar
// ============================================

import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSidebarCollapsed, toggleSidebar } from '@/features/ui/uiSlice';
import { logoutAsync, selectUser } from '@/features/auth/authSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { navigationConfig } from '@/config';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
};

const AppSidebar = memo(() => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const user = useAppSelector(selectUser);
  const { canAccessRoute } = usePermissions();

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const filteredNav = navigationConfig.filter((item) => canAccessRoute(item.permissions));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Enterprise</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-lg hover:bg-sidebar-ring transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-4">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          const navItem = (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'sidebar-nav-item',
                isActive && 'active',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return navItem;
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
        <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role}</p>
            </div>
          )}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
});

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
