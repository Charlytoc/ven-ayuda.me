"use client";

import type { CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createVocabularyItem, fetchVocabularyCategories } from "@/lib/vocabulary-api";
import type { TextSelectionState } from "@/hooks/use-text-selection-vocab";

export function VocabSelectionPopover({
  token,
  selection,
  onClose,
}: {
  token: string;
  selection: TextSelectionState;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; alreadyExisted: boolean } | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["vocabulary-categories", token],
    queryFn: () => fetchVocabularyCategories(token),
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      createVocabularyItem(token, {
        text: selection.text,
        category_id: categoryId,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      setFeedback({
        text: data.already_existed ? t("vocab.alreadyInVocabulary") : t("vocab.addedToVocabulary"),
        alreadyExisted: data.already_existed,
      });
      setTimeout(onClose, 1200);
    },
    onError: (err: Error) => setFeedback({ text: err.message, alreadyExisted: false }),
  });

  const style: CSSProperties = {
    position: "fixed",
    top: Math.min(selection.rect.bottom + 8, window.innerHeight - 160),
    left: Math.min(Math.max(8, selection.rect.left), window.innerWidth - 288),
    zIndex: 200,
    maxWidth: 280,
  };

  return (
    <Paper withBorder shadow="md" p="sm" radius="md" style={style}>
      <Stack gap="xs">
        <Text size="sm" fw={600} lineClamp={2}>
          {selection.text}
        </Text>
        {categories.length > 0 ? (
          <Select
            size="xs"
            placeholder={t("vocab.categoryPlaceholder")}
            clearable
            data={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={setCategoryId}
          />
        ) : null}
        {feedback ? (
          <Text size="xs" c={feedback.alreadyExisted ? "dimmed" : "teal"}>
            {feedback.text}
          </Text>
        ) : (
          <Group gap="xs" justify="flex-end">
            <Button size="xs" variant="default" onClick={onClose}>
              {t("vocab.cancel")}
            </Button>
            <Button
              size="xs"
              loading={addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {t("vocab.addToVocabulary")}
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
