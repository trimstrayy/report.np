import { useState, useEffect, useCallback, useRef } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: PermissionState | null;
}

export function useLocation(autoTrack: boolean = false) {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback((): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported',
      }));
      return Promise.resolve(false);
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
            permissionStatus: 'granted',
          });
          resolve(true);
        },
        (error) => {
          let message = 'Unable to get location';

          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location unavailable';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out';
          }

          setLocation(prev => ({
            ...prev,
            loading: false,
            error: message,
            permissionStatus:
              error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionStatus,
          }));

          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          permissionStatus: 'granted',
          error: null,
        }));
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied'
              : 'Unable to track location',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 2000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Auto-track ONLY after permission is granted
  useEffect(() => {
    if (!autoTrack) return;

    requestLocation().then((granted) => {
      if (granted) startTracking();
    });

    return () => stopTracking();
  }, [autoTrack, requestLocation, startTracking, stopTracking]);

  return {
    ...location,
    requestLocation,
    startTracking,
    stopTracking,
    isTracking: watchIdRef.current !== null,
  };
}
