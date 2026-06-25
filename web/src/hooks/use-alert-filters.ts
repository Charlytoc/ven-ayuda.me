"use client";

import { useMemo, useState } from "react";

import { DEFAULT_ALERT_SEVERITY_FILTER } from "@/components/severity-legend";
import { useNearbyAlerts } from "@/hooks/use-nearby-alerts";
import {
  NEARBY_RADIUS_KM,
  filterRequestsNearby,
  sortRequestsByDistance,
} from "@/lib/geo";
import type { HelpRequest, HelpRequestSeverity } from "@/lib/types/help-request";

export function useAlertFilters(requests: HelpRequest[]) {
  const [selectedSeverities, setSelectedSeverities] = useState<
    Set<HelpRequestSeverity>
  >(() => new Set(DEFAULT_ALERT_SEVERITY_FILTER));

  const {
    nearMeEnabled,
    userLocation,
    locating,
    locationError,
    setNearMe,
  } = useNearbyAlerts();

  function toggleSeverity(severity: HelpRequestSeverity) {
    setSelectedSeverities((current) => {
      const next = new Set(current);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  }

  const severityFiltered = useMemo(
    () => requests.filter((request) => selectedSeverities.has(request.severity)),
    [requests, selectedSeverities],
  );

  const filteredRequests = useMemo(() => {
    if (!nearMeEnabled || !userLocation) {
      return severityFiltered;
    }
    return filterRequestsNearby(severityFiltered, userLocation, NEARBY_RADIUS_KM);
  }, [severityFiltered, nearMeEnabled, userLocation]);

  const listRequests = useMemo(() => {
    if (nearMeEnabled && userLocation) {
      return sortRequestsByDistance(filteredRequests, userLocation);
    }
    return filteredRequests;
  }, [filteredRequests, nearMeEnabled, userLocation]);

  const allSeveritiesSelected =
    selectedSeverities.size === DEFAULT_ALERT_SEVERITY_FILTER.size;

  function statusMessage(): string {
    if (requests.length === 0) {
      return "Aún no hay alertas registradas.";
    }

    const visible = filteredRequests.length;
    const total = requests.length;

    if (visible === 0) {
      if (nearMeEnabled) {
        return `No hay alertas dentro de ${NEARBY_RADIUS_KM} km de tu ubicación.`;
      }
      return "Ninguna alerta coincide con los filtros seleccionados.";
    }

    const visibleLabel = `${visible} alerta${visible === 1 ? "" : "s"} visible${visible === 1 ? "" : "s"}`;

    if (nearMeEnabled) {
      return `${visibleLabel} cerca de ti (radio ${NEARBY_RADIUS_KM} km). Pasa el cursor sobre un punto para ver el título.`;
    }

    if (allSeveritiesSelected) {
      return `${visibleLabel}. Toca un punto para ver detalles. Pasa el cursor para ver el título.`;
    }

    return `${visibleLabel} de ${total}. Toca un punto para ver detalles.`;
  }

  return {
    selectedSeverities,
    toggleSeverity,
    nearMeEnabled,
    userLocation,
    locating,
    locationError,
    setNearMe,
    filteredRequests,
    listRequests,
    statusMessage,
  };
}
