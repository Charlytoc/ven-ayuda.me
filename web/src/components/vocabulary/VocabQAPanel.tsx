"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconSend } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { io, type Socket } from "socket.io-client";
import { AssistantMessageBody } from "@/components/chat/AssistantMessageBody";
import {
  clearVocabQAConversation,
  fetchVocabQAHistory,
  sendVocabQAMessage,
  type VocabQAMessage,
} from "@/lib/vocabulary-api";
import type { JapaneseRender } from "@/lib/chat-task-types";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:3001";

type Props = {
  itemId: string;
  token: string;
  userId: number;
  /** Vocabulary entry text shown in the panel heading. */
  itemText?: string;
  /** When true the panel is always expanded and the toggle header is hidden. */
  alwaysOpen?: boolean;
  /** Hide the section title (e.g. when shown inside a modal that already has a title). */
  showTitle?: boolean;
};

export function VocabQAPanel({
  itemId,
  token,
  userId,
  itemText,
  alwaysOpen = false,
  showTitle = true,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const heading = itemText
    ? t("vocabulary.qa.titleAbout", { text: itemText })
    : t("vocabulary.qa.title");

  const [open, setOpen] = useState(false);
  const isOpen = alwaysOpen || open;
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<VocabQAMessage[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const expectedConversationIdRef = useRef<string | null>(null);
  const waitingRef = useRef(false);

  // Load history when panel opens for the first time
  const { data: history, isPending: historyPending } = useQuery({
    queryKey: ["vocab-qa-history", token, itemId],
    queryFn: () => fetchVocabQAHistory(token, itemId),
    enabled: isOpen && Boolean(token),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!history) return;
    setLocalMessages(history.messages);
    if (history.conversation_id) {
      expectedConversationIdRef.current = history.conversation_id;
      setActiveConversationId(history.conversation_id);
    }
  }, [history]);

  useEffect(() => {
    waitingRef.current = waiting;
  }, [waiting]);

  // Socket.io: join user room and listen for vocab-qa events
  useEffect(() => {
    if (!isOpen) return;

    const socket = io(REALTIME_URL, { transports: ["websocket", "polling"], timeout: 10000 });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-user", { userId });
    });

    socket.on(
      "agentic-chat-message",
      (payload: {
        conversation_id: string;
        message: {
          id: string;
          role: string;
          content: string;
          created: string;
          japanese_renders?: JapaneseRender[];
        };
      }) => {
        const expectedId = activeConversationId ?? expectedConversationIdRef.current;
        if (expectedId) {
          if (payload.conversation_id !== expectedId) return;
        } else if (!waitingRef.current) {
          return;
        }
        if (payload.message.role !== "assistant") return;
        setLocalMessages((prev) => [
          ...prev,
          {
            id: payload.message.id,
            role: "assistant",
            content: payload.message.content,
            created: payload.message.created,
            japanese_renders: payload.message.japanese_renders ?? [],
          },
        ]);
      },
    );

    socket.on(
      "agentic-chat-complete",
      (payload: { conversation_id: string; error: string | null }) => {
        const expectedId = activeConversationId ?? expectedConversationIdRef.current;
        if (expectedId) {
          if (payload.conversation_id !== expectedId) return;
        } else if (!waitingRef.current) {
          return;
        }
        setWaiting(false);
        void queryClient.invalidateQueries({ queryKey: ["vocab-qa-history", token, itemId] });
        // Refresh the vocabulary item in case save_phrase was called
        void queryClient.invalidateQueries({ queryKey: ["vocabulary-item", token, itemId] });
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  // Reconnect when the panel opens or activeConversationId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeConversationId, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendVocabQAMessage(token, itemId, text),
    onMutate: (text) => {
      const optimistic: VocabQAMessage = {
        id: `optimistic-${Date.now()}`,
        role: "user",
        content: text,
        created: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, optimistic]);
      setWaiting(true);
    },
    onSuccess: (data) => {
      expectedConversationIdRef.current = data.conversation_id;
      setActiveConversationId(data.conversation_id);
    },
    onError: () => {
      setWaiting(false);
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearVocabQAConversation(token, itemId),
    onSuccess: () => {
      setLocalMessages([]);
      expectedConversationIdRef.current = null;
      setActiveConversationId(null);
      setWaiting(false);
      void queryClient.setQueryData(["vocab-qa-history", token, itemId], {
        conversation_id: null,
        messages: [],
      });
    },
  });

  const canClear =
    localMessages.length > 0 &&
    !waiting &&
    !sendMutation.isPending &&
    !clearMutation.isPending;

  const clearButton = canClear ? (
    <Button
      size="xs"
      variant="subtle"
      color="gray"
      onClick={() => clearMutation.mutate()}
    >
      {t("vocabulary.qa.clear")}
    </Button>
  ) : null;

  function handleSubmit() {
    const text = input.trim();
    if (!text || waiting || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const content = (
    <Stack
      gap="xs"
      style={alwaysOpen ? { height: "100%", display: "flex", flexDirection: "column" } : undefined}
    >
      {alwaysOpen && (showTitle || clearButton) ? (
        <Group justify="space-between" align="center" pb={4}>
          {showTitle ? (
            <Text size="sm" fw={500} lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
              {heading}
            </Text>
          ) : (
            <Box />
          )}
          {clearButton}
        </Group>
      ) : null}
      {/* Message list */}
      <Paper
        withBorder
        radius="sm"
        style={
          alwaysOpen
            ? { overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }
            : { overflow: "hidden" }
        }
      >
        <ScrollArea h={alwaysOpen ? "100%" : 320} p="sm" style={alwaysOpen ? { flex: 1 } : undefined}>
              {historyPending ? (
                <Group justify="center" py="md">
                  <Loader size="xs" />
                </Group>
              ) : localMessages.length === 0 ? (
                <Text size="xs" c="dimmed" ta="center" py="md">
                  {t("vocabulary.qa.empty")}
                </Text>
              ) : (
                <Stack gap="xs">
                  {localMessages.map((msg) => (
                    <Box key={msg.id}>
                      {msg.role === "user" ? (
                        <Group justify="flex-end">
                          <Paper
                            radius="sm"
                            px="sm"
                            py={6}
                            bg="var(--mantine-color-blue-light)"
                            style={{ maxWidth: "80%" }}
                          >
                            <Text size="sm">{msg.content}</Text>
                          </Paper>
                        </Group>
                      ) : (
                        <Group justify="flex-start" align="flex-start">
                          <Box style={{ maxWidth: "90%" }}>
                            <AssistantMessageBody
                              messageId={msg.id}
                              token={token}
                              content={msg.content}
                              renders={msg.japanese_renders ?? []}
                              initialSegments={msg.audio_segments}
                            />
                          </Box>
                        </Group>
                      )}
                    </Box>
                  ))}
                  {waiting && (
                    <Group gap="xs" px={4}>
                      <Loader size="xs" />
                      <Text size="xs" c="dimmed">{t("vocabulary.qa.thinking")}</Text>
                    </Group>
                  )}
                  <div ref={bottomRef} />
                </Stack>
              )}
        </ScrollArea>
      </Paper>

      {/* Input row */}
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          placeholder={t("vocabulary.qa.placeholder")}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          autosize
          minRows={1}
          maxRows={4}
          style={{ flex: 1 }}
          disabled={waiting || sendMutation.isPending}
        />
        <ActionIcon
          size="lg"
          variant="light"
          disabled={!input.trim() || waiting || sendMutation.isPending}
          onClick={handleSubmit}
          aria-label={t("vocabulary.qa.send")}
        >
          <IconSend size={16} />
        </ActionIcon>
      </Group>
    </Stack>
  );

  if (alwaysOpen) {
    return content;
  }

  return (
    <Stack gap={0}>
      <Group justify="space-between" align="center" wrap="nowrap" py="sm">
        <UnstyledButton onClick={() => setOpen((o) => !o)} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500} lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
              {heading}
            </Text>
            {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Group>
        </UnstyledButton>
        {clearButton}
      </Group>
      <Collapse in={open}>{content}</Collapse>
    </Stack>
  );
}
