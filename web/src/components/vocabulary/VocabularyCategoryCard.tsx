"use client";

import { Badge, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBooks, IconFolder, IconLayoutGrid, IconQuestionMark } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
  count: number;
  variant: "all" | "uncategorized" | "category";
  accentColor?: string;
  onClick: () => void;
};

const ICONS = {
  all: IconLayoutGrid,
  uncategorized: IconQuestionMark,
  category: IconFolder,
} as const;

const DEFAULT_COLORS = {
  all: "blue",
  uncategorized: "orange",
  category: "grape",
} as const;

export function VocabularyCategoryCard({ title, count, variant, accentColor, onClick }: Props) {
  const { t } = useTranslation();
  const Icon = ICONS[variant];
  const displayColor = accentColor ?? DEFAULT_COLORS[variant];

  return (
    <Paper
      withBorder
      radius="md"
      p="lg"
      style={{ cursor: "pointer", height: "100%" }}
      onClick={onClick}
    >
      <Stack gap="md" justify="space-between" h="100%">
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon size={40} radius="md" variant="light" color={displayColor}>
            <Icon size={20} />
          </ThemeIcon>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} size="lg" lineClamp={2}>
              {title}
            </Text>
            <Text size="sm" c="dimmed">
              {t("vocabulary.itemCount", { count })}
            </Text>
          </Stack>
        </Group>
        {variant === "all" ? (
          <Badge variant="light" color="blue" leftSection={<IconBooks size={12} />}>
            {t("vocabulary.seeAll")}
          </Badge>
        ) : null}
      </Stack>
    </Paper>
  );
}
