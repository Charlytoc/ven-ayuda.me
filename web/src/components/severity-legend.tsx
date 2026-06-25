"use client";

import { Box, Group, Text, UnstyledButton } from "@mantine/core";

import { ALERT_LEGEND } from "@/lib/constants";
import type { HelpRequestSeverity } from "@/lib/types/help-request";

export const DEFAULT_ALERT_SEVERITY_FILTER = new Set<HelpRequestSeverity>(
  ALERT_LEGEND.map((item) => item.value),
);

type SeverityLegendProps = {
  selectedSeverities?: Set<HelpRequestSeverity>;
  onToggleSeverity?: (severity: HelpRequestSeverity) => void;
};

export function SeverityLegend({
  selectedSeverities,
  onToggleSeverity,
}: SeverityLegendProps) {
  const filterable =
    selectedSeverities !== undefined && onToggleSeverity !== undefined;

  return (
    <Group gap="sm">
      {ALERT_LEGEND.map((item) => {
        const isActive = filterable
          ? selectedSeverities.has(item.value)
          : true;

        const content = (
          <Group gap={6} wrap="nowrap">
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: isActive ? item.color : "var(--mantine-color-dark-4)",
                border: "2px solid white",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                opacity: isActive ? 1 : 0.5,
              }}
            />
            <Text
              size="sm"
              c={isActive ? undefined : "dimmed"}
              td={isActive ? undefined : "line-through"}
            >
              {item.label}
            </Text>
          </Group>
        );

        if (!filterable) {
          return <Group key={item.value}>{content}</Group>;
        }

        return (
          <UnstyledButton
            key={item.value}
            onClick={() => onToggleSeverity(item.value)}
            aria-pressed={isActive}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${isActive ? item.color : "var(--mantine-color-dark-4)"}`,
              background: isActive ? `${item.color}22` : "transparent",
              cursor: "pointer",
            }}
          >
            {content}
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
