"use client";

import { useCallback, useState } from "react";

import type { LatLng } from "@/lib/types/help-request";

export function useNearbyAlerts() {
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const enableNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización.");
      setNearMeEnabled(false);
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMeEnabled(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setNearMeEnabled(false);
        setLocationError("No se pudo obtener tu ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const setNearMe = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        enableNearMe();
        return;
      }
      setNearMeEnabled(false);
      setLocationError(null);
    },
    [enableNearMe],
  );

  return {
    nearMeEnabled,
    userLocation,
    locating,
    locationError,
    setNearMe,
  };
}
