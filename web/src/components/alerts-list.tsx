"use client";

import Link from "next/link";
import {
  Badge,
  Group,
  Pagination,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

import {
  distanceToRequestKm,
  formatDistanceKm,
} from "@/lib/geo";
import { helpRequestPath } from "@/lib/help-request-path";
import { severityColor, severityLabel } from "@/lib/constants";
import type { HelpRequest, LatLng } from "@/lib/types/help-request";

type AlertsListProps = {
  requests: HelpRequest[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  userLocation?: LatLng | null;
  showDistance?: boolean;
};

export function AlertsList({
  requests,
  page,
  pageSize,
  onPageChange,
  userLocation = null,
  showDistance = false,
}: AlertsListProps) {
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageItems = requests.slice(pageStart, pageStart + pageSize);

  if (requests.length === 0) {
    return (
      <Paper withBorder radius="md" p="md">
        <Text size="sm" c="dimmed">
          No hay alertas para mostrar en la lista.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Lista de alertas
        </Text>
        <Text size="xs" c="dimmed">
          {requests.length} en total
        </Text>
      </Group>

      <Stack gap="xs">
        {pageItems.map((request) => {
          const distance =
            showDistance && userLocation
              ? distanceToRequestKm(userLocation, request)
              : null;

          return (
            <UnstyledButton
              key={request.id}
              component={Link}
              href={helpRequestPath(request.id)}
              style={{ width: "100%" }}
            >
              <Paper
                withBorder
                radius="md"
                p="sm"
                style={{
                  transition: "border-color 120ms ease",
                }}
              >
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                        {request.title}
                      </Text>
                      <Badge
                        size="xs"
                        variant="filled"
                        style={{ backgroundColor: severityColor(request.severity) }}
                      >
                        {severityLabel(request.severity)}
                      </Badge>
                    </Group>
                    {distance !== null ? (
                      <Text size="xs" c="dimmed">
                        A {formatDistanceKm(distance)} de ti
                      </Text>
                    ) : null}
                  </Stack>
                  <IconChevronRight size={16} color="var(--mantine-color-dimmed)" />
                </Group>
              </Paper>
            </UnstyledButton>
          );
        })}
      </Stack>

      {totalPages > 1 ? (
        <Group justify="center">
          <Pagination
            value={safePage}
            onChange={onPageChange}
            total={totalPages}
            size="sm"
          />
        </Group>
      ) : null}
    </Stack>
  );
}
