// ============================================
// Online Status Hook
// Detects network connectivity changes
// ============================================

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setOnlineStatus, selectIsOnline, addNotification } from '@/features/ui/uiSlice';

export const useOnlineStatus = () => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(selectIsOnline);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      dispatch(
        addNotification({
          type: 'success',
          title: 'Connection Restored',
          message: 'You are back online. All features are now available.',
        })
      );
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: 'You are currently offline. Some features may be limited.',
        })
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    dispatch(setOnlineStatus(navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return isOnline;
};
