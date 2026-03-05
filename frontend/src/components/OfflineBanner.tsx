import { useState, useEffect, useRef } from 'react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Only reload if user was ACTUALLY offline before
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Mark that user went offline
      wasOfflineRef.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      background: '#fbbf24',
      color: '#92400e',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
    }}>
      📡 You are offline — showing cached content. Some features may be unavailable until reconnected.
    </div>
  );
};
