"use client";

import Link from "next/link";
import { Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowsMaximize } from "@tabler/icons-react";

import { HelpMapPanel } from "@/components/help-map-panel";
import { SeverityLegend } from "@/components/severity-legend";
import { COMPACT_MAP_HEIGHT } from "@/lib/constants";
import type { HelpRequest } from "@/lib/types/help-request";

type AlertsMapSectionProps = {
  requests: HelpRequest[];
  onRequestSelect?: (request: HelpRequest) => void;
};

export function AlertsMapSection({
  requests,
  onRequestSelect,
}: AlertsMapSectionProps) {
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

        <SeverityLegend />

        <Box
          style={{
            height: COMPACT_MAP_HEIGHT,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--mantine-color-dark-4)",
          }}
        >
            <HelpMapPanel
              requests={requests}
              height={COMPACT_MAP_HEIGHT}
              contained
              onRequestSelect={onRequestSelect}
            />
        </Box>

          <Text size="xs" c="dimmed">
            {requests.length === 0
              ? "Aún no hay alertas registradas."
              : `${requests.length} alerta${requests.length === 1 ? "" : "s"} activa${requests.length === 1 ? "" : "s"}. Toca un punto para ver detalles.`}
          </Text>
      </Stack>
    </Paper>
  );
}
