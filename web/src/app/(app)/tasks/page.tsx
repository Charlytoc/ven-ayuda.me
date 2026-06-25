"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Center, Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  TaskBatchForm,
  collectPendingTaskItems,
} from "@/components/chat/task-ui";
import { apiFetch, apiReadJson } from "@/lib/api-request";
import { TOKEN_KEY, readStoredAuth } from "@/lib/auth-storage";
import type { AgenticChatHistoryResponse, SpeechSubmitResult } from "@/lib/chat-task-types";
import { historyToChatEntries } from "@/lib/chat-task-types";
import {
  clearTaskDraft,
  mergeDraftAnswers,
  readTaskDraft,
  setChatWaitingPending,
  writeTaskDraft,
} from "@/lib/task-draft-storage";
import { useTranslation } from "react-i18next";

export default function TasksPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    if (!readStoredAuth().token) router.replace("/login");
  }, [router]);

  const { data: chatHistory, isPending: historyPending } = useQuery({
    queryKey: ["agentic-chat-history", token],
    queryFn: async () => {
      const response = await apiFetch("/agentic-chat/history", token!);
      return apiReadJson<AgenticChatHistoryResponse>(response, t("tasksPage.loadHistoryFailed"));
    },
    enabled: Boolean(token),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const messages = useMemo(
    () => historyToChatEntries(chatHistory?.messages ?? []),
    [chatHistory?.messages],
  );
  const pendingTaskItems = useMemo(() => collectPendingTaskItems(messages), [messages]);
  const conversationId = chatHistory?.conversation_id ?? null;

  useEffect(() => {
    if (historyPending) return;
    if (pendingTaskItems.length === 0) {
      router.replace("/chat");
    }
  }, [historyPending, pendingTaskItems.length, router]);

  useEffect(() => {
    if (draftRestored || historyPending || !conversationId) return;
    const pendingIds = pendingTaskItems.map(({ task }) => task.id);
    if (!pendingIds.length) return;
    const merged = mergeDraftAnswers(readTaskDraft(), conversationId, pendingIds);
    setAnswers(merged.answers);
    setNote(merged.note);
    setDraftRestored(true);
  }, [conversationId, draftRestored, historyPending, pendingTaskItems]);

  useEffect(() => {
    if (!draftRestored || !conversationId || pendingTaskItems.length === 0) return;
    writeTaskDraft({
      conversationId,
      answers,
      note,
      savedAt: new Date().toISOString(),
    });
  }, [answers, note, conversationId, draftRestored, pendingTaskItems.length]);

  async function handleSubmit() {
    if (!token || pendingTaskItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch("/tasks/submit-batch", token, {
        method: "POST",
        jsonBody: {
          answers: pendingTaskItems.map(({ task }) => ({
            task_id: task.id,
            answer: answers[task.id],
          })),
          message: note.trim(),
        },
      });
      await apiReadJson(response, t("tasksPage.submitFailed"));
      clearTaskDraft();
      setChatWaitingPending();
      await queryClient.invalidateQueries({ queryKey: ["agentic-chat-history", token] });
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tasksPage.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (historyPending || pendingTaskItems.length === 0) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  const title =
    pendingTaskItems.length === 1 ? t("tasksPage.solveOne") : t("tasksPage.solveMany");

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        px="lg"
        py="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-default)",
          flexShrink: 0,
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Title order={3}>{title}</Title>
            <Text size="sm" c="dimmed">
              {t("tasksPage.progressHint")}
            </Text>
          </Stack>
          <Button variant="default" onClick={() => router.push("/chat")}>
            {t("tasksPage.backToChat")}
          </Button>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} px="lg" py="md">
        <Box maw={960} mx="auto" w="100%" pb="xl">
          {error ? (
            <Text size="sm" c="red" mb="md">
              {error}
            </Text>
          ) : null}
          <TaskBatchForm
            items={pendingTaskItems}
            answers={answers}
            onAnswerChange={(taskId, answer) =>
              setAnswers((prev) => ({ ...prev, [taskId]: answer }))
            }
            note={note}
            onNoteChange={setNote}
            onSubmit={() => void handleSubmit()}
            submitting={submitting}
            onSolveSpeech={(_taskId: string, _result: SpeechSubmitResult) => {
              // Re-fetch history so the solved speech task is removed from pending.
              // If it was the only pending task the useEffect redirects to /chat.
              void queryClient.invalidateQueries({ queryKey: ["agentic-chat-history", token] });
            }}
          />
        </Box>
      </ScrollArea>
    </Box>
  );
}
