"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowsMaximize } from "@tabler/icons-react";

import { AlertsList } from "@/components/alerts-list";
import { AlertsMapFilters } from "@/components/alerts-map-filters";
import { HelpMapPanel } from "@/components/help-map-panel";
import { useAlertFilters } from "@/hooks/use-alert-filters";
import { COMPACT_MAP_HEIGHT } from "@/lib/constants";
import { ALERTS_PAGE_SIZE } from "@/lib/geo";
import type { HelpRequest } from "@/lib/types/help-request";

type AlertsMapSectionProps = {
  requests: HelpRequest[];
  onRequestSelect?: (request: HelpRequest) => void;
};

export function AlertsMapSection({
  requests,
  onRequestSelect,
}: AlertsMapSectionProps) {
  const [page, setPage] = useState(1);
  const filters = useAlertFilters(requests);

  useEffect(() => {
    setPage(1);
  }, [filters.selectedSeverities, filters.nearMeEnabled, requests.length]);

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={3}>Mapa de alertas</Title>
            <Text size="sm" c="dimmed">
              Solicitudes activas en Venezuela según su gravedad.
            </Text>
          </Stack>
          <Button
            component={Link}
            href="/mapa"
            variant="light"
            size="compact-sm"
            leftSection={<IconArrowsMaximize size={16} />}
          >
            Ver mapa completo
          </Button>
        </Group>

        <AlertsMapFilters
          selectedSeverities={filters.selectedSeverities}
          onToggleSeverity={filters.toggleSeverity}
          nearMeEnabled={filters.nearMeEnabled}
          onNearMeChange={filters.setNearMe}
          locating={filters.locating}
          locationError={filters.locationError}
          statusMessage={filters.statusMessage()}
          nearMeDescription={`Filtra mapa y lista en un radio de 50 km (desactivado por defecto)`}
        />

        <Box
          style={{
            height: COMPACT_MAP_HEIGHT,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--mantine-color-dark-4)",
          }}
        >
          <HelpMapPanel
            requests={filters.filteredRequests}
            height={COMPACT_MAP_HEIGHT}
            contained
            showMarkerTitles
            panToLocation={filters.nearMeEnabled ? filters.userLocation : null}
            onRequestSelect={onRequestSelect}
          />
        </Box>

        <AlertsList
          requests={filters.listRequests}
          page={page}
          pageSize={ALERTS_PAGE_SIZE}
          onPageChange={setPage}
          userLocation={filters.userLocation}
          showDistance={filters.nearMeEnabled}
        />
      </Stack>
    </Paper>
  );
}
