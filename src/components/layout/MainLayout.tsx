// ============================================
// Main Layout Component
// Wraps authenticated pages with sidebar and header
// ============================================

import { Suspense, memo } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { selectSidebarCollapsed, selectIsOnline } from '@/features/ui/uiSlice';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MainLayout = memo(() => {
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const isOnline = useAppSelector(selectIsOnline);
  
  // Initialize online status monitoring
  useOnlineStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          You are currently offline. Some features may be limited.
        </div>
      )}

      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          isCollapsed ? 'ml-[72px]' : 'ml-64',
          !isOnline && 'pt-10'
        )}
      >
        <main className="flex-1 p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;
