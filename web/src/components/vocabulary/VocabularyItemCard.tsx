"use client";

import { Badge, Box, Group, Loader, Paper, Stack, Text } from "@mantine/core";
import { RubyText } from "@/components/RubyText";
import { grammaticalCategoryLabel } from "@/lib/grammatical-category-label";
import type { VocabularyItem } from "@/lib/vocabulary-types";
import { useTranslation } from "react-i18next";

export function VocabularyItemCard({
  item,
  categoryName,
  showCategory = true,
  onClick,
}: {
  item: VocabularyItem;
  categoryName?: string | null;
  showCategory?: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const grammaticalLabel = item.grammatical_category
    ? grammaticalCategoryLabel(t, item.grammatical_category)
    : null;

  const phraseCount = (item.extra?.phrases ?? []).length;

  return (
    <Paper withBorder radius="md" p="md" style={{ cursor: "pointer" }} onClick={onClick}>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            {item.status === "enriched" && item.segments.length > 0 ? (
              <RubyText segments={item.segments} size="md" />
            ) : (
              <Text fw={700} size="lg" style={{ fontSize: 30 }}>
                {item.text}
              </Text>
            )}
          </Box>
          {item.status === "pending" ? <Loader size="xs" /> : null}
          {item.status === "failed" ? (
            <Badge color="red" size="sm" variant="light">
              {t("vocabulary.failed")}
            </Badge>
          ) : null}
        </Group>

        {item.meaning ? (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {item.meaning}
          </Text>
        ) : item.status === "pending" ? (
          <Text size="xs" c="dimmed">
            {t("vocabulary.enriching")}
          </Text>
        ) : null}

        <Group gap="xs" wrap="wrap">
          {showCategory && categoryName ? (
            <Badge variant="outline" size="sm" color="blue">
              {categoryName}
            </Badge>
          ) : null}
          {grammaticalLabel ? (
            <Badge variant="light" size="sm">
              {grammaticalLabel}
            </Badge>
          ) : null}
          {phraseCount > 0 ? (
            <Badge variant="dot" size="sm" color="gray">
              {t("vocabulary.phraseCount", { count: phraseCount })}
            </Badge>
          ) : null}
        </Group>
      </Stack>
    </Paper>
  );
}
