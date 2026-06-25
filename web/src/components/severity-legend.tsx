import { Box, Group, Text } from "@mantine/core";

import { ALERT_LEGEND } from "@/lib/constants";

export function SeverityLegend() {
  return (
    <Group gap="lg">
      {ALERT_LEGEND.map((item) => (
        <Group key={item.value} gap={6}>
          <Box
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: item.color,
              border: "2px solid white",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
            }}
          />
          <Text size="sm">{item.label}</Text>
        </Group>
      ))}
    </Group>
  );
}
