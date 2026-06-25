"use client";

import { Stack, Switch, Text } from "@mantine/core";

import { SeverityLegend } from "@/components/severity-legend";
import { NEARBY_RADIUS_KM } from "@/lib/geo";
import type { HelpRequestSeverity } from "@/lib/types/help-request";

type AlertsMapFiltersProps = {
  selectedSeverities: Set<HelpRequestSeverity>;
  onToggleSeverity: (severity: HelpRequestSeverity) => void;
  nearMeEnabled: boolean;
  onNearMeChange: (enabled: boolean) => void;
  locating: boolean;
  locationError: string | null;
  statusMessage: string;
  nearMeDescription?: string;
};

export function AlertsMapFilters({
  selectedSeverities,
  onToggleSeverity,
  nearMeEnabled,
  onNearMeChange,
  locating,
  locationError,
  statusMessage,
  nearMeDescription,
}: AlertsMapFiltersProps) {
  return (
    <Stack gap="sm">
      <SeverityLegend
        selectedSeverities={selectedSeverities}
        onToggleSeverity={onToggleSeverity}
      />

      <Switch
        label="Mostrar alertas cercanas a mí"
        description={
          nearMeDescription ??
          `Filtra el mapa en un radio de ${NEARBY_RADIUS_KM} km (desactivado por defecto)`
        }
        checked={nearMeEnabled}
        onChange={(event) => onNearMeChange(event.currentTarget.checked)}
        disabled={locating}
      />

      {locationError ? (
        <Text size="sm" c="red">
          {locationError}
        </Text>
      ) : null}

      <Text size="sm" c="dimmed">
        {statusMessage}
      </Text>
    </Stack>
  );
}
