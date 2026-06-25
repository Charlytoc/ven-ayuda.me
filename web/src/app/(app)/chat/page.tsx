"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useRef, useState } from "react";
import { VocabSelectionPopover } from "@/components/vocabulary/VocabSelectionPopover";
import { useTextSelectionVocab } from "@/hooks/use-text-selection-vocab";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Collapse,
  Drawer,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconChevronDown, IconEdit, IconHistory } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { io, Socket } from "socket.io-client";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { HeaderIconAction } from "@/components/HeaderIconAction";
import { AssistantMessageBody } from "@/components/chat/AssistantMessageBody";
import { TaskCard, collectPendingTaskItems } from "@/components/chat/task-ui";
import { apiFetch, apiReadJson } from "@/lib/api-request";
import { TOKEN_KEY, USER_KEY, readStoredAuth, type AuthUser } from "@/lib/auth-storage";
import type {
  AgenticChatClearResponse,
  AgenticChatConversationListResponse,
  AgenticChatConversationSummary,
  AgenticChatHistoryResponse,
  AgenticChatMessageResponse,
  AgenticChatRunStatusResponse,
  ChatEntry,
} from "@/lib/chat-task-types";
import { historyToChatEntries } from "@/lib/chat-task-types";
import { clearTaskDraft, consumeChatWaitingPending } from "@/lib/task-draft-storage";
import {
  conversationSummaryPreview,
  localizeConversationSummary,
} from "@/lib/localize-conversation-summary";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:3001";
const CHAT_FALLBACK_POLL_INTERVAL_MS = 7500;
export const CHAT_AUTO_SCROLL_KEY = "chat-auto-scroll";

type RealtimeChatMessage = {
  conversation_id: string;
  message: {
    id: string;
    role: "assistant";
    content: string;
    created: string;
    assigned_tasks: ChatEntry["assignedTasks"];
    japanese_renders?: ChatEntry["japaneseRenders"];
  };
};

type RealtimeComplete = {
  conversation_id: string;
  error: string | null;
};

function formatConversationWhen(
  conversation: AgenticChatConversationSummary,
  locale: string,
): string {
  const raw = conversation.closed_at || conversation.last_interaction_at || conversation.created;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(locale);
}

function ChatMessageTimestamp({ createdAt }: { createdAt: string }) {
  const { i18n } = useTranslation();
  const d = new Date(createdAt);
  const label = Number.isNaN(d.getTime()) ? "" : d.toLocaleString(i18n.language);
  if (!label) return null;
  return (
    <Text size="xs" c="dimmed">
      {label}
    </Text>
  );
}

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [user] = useLocalStorage<AuthUser | null>({
    key: USER_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [autoScroll] = useLocalStorage<boolean>({
    key: CHAT_AUTO_SCROLL_KEY,
    defaultValue: true,
    getInitialValueInEffect: true,
  });

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearModalOpened, { open: openClearModal, close: closeClearModal }] = useDisclosure(false);
  const [historyDrawerOpened, { open: openHistoryDrawer, close: closeHistoryDrawer }] = useDisclosure(false);
  const [viewingArchivedId, setViewingArchivedId] = useState<string | null>(null);
  const [viewingArchivedTitle, setViewingArchivedTitle] = useState<string | null>(null);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const tutorConversationIdRef = useRef<string | null>(null);
  const waitingRef = useRef(false);
  const { bindContainer: bindMessagesContainer, selection, clearSelection } =
    useTextSelectionVocab();

  useEffect(() => {
    if (!readStoredAuth().token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (consumeChatWaitingPending()) {
      setWaiting(true);
    }
  }, []);

  const { data: chatHistory, isPending: historyPending } = useQuery({
    queryKey: ["agentic-chat-history", token],
    queryFn: async () => {
      const response = await apiFetch("/agentic-chat/history", token!);
      return apiReadJson<AgenticChatHistoryResponse>(response, t("chat.errors.loadHistory"));
    },
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: waiting && pendingRunId && !viewingArchivedId
      ? CHAT_FALLBACK_POLL_INTERVAL_MS
      : false,
  });

  const { data: runStatus } = useQuery({
    queryKey: ["agentic-chat-run", token, pendingRunId],
    queryFn: async () => {
      const response = await apiFetch(`/agentic-chat/runs/${pendingRunId}`, token!);
      return apiReadJson<AgenticChatRunStatusResponse>(
        response,
        t("chat.errors.loadHistory"),
      );
    },
    enabled: Boolean(token && pendingRunId && waiting && !viewingArchivedId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "error"
        ? false
        : CHAT_FALLBACK_POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (viewingArchivedId) return;
    if (!chatHistory?.messages) return;
    setMessages(historyToChatEntries(chatHistory.messages));
  }, [chatHistory, viewingArchivedId]);

  useEffect(() => {
    if (!runStatus) return;
    if (runStatus.status !== "completed" && runStatus.status !== "error") return;
    setWaiting(false);
    setPendingRunId(null);
    if (runStatus.error) setError(runStatus.error);
    void queryClient.invalidateQueries({ queryKey: ["agentic-chat-history", token] });
    void queryClient.invalidateQueries({ queryKey: ["agentic-chat-conversations", token] });
  }, [queryClient, runStatus, token]);

  useEffect(() => {
    tutorConversationIdRef.current = chatHistory?.conversation_id ?? null;
  }, [chatHistory?.conversation_id]);

  useEffect(() => {
    waitingRef.current = waiting;
  }, [waiting]);

  const { data: conversationList, isPending: conversationsPending } = useQuery({
    queryKey: ["agentic-chat-conversations", token],
    queryFn: async () => {
      const response = await apiFetch("/agentic-chat/conversations", token!);
      return apiReadJson<AgenticChatConversationListResponse>(
        response,
        t("chat.errors.loadConversations"),
      );
    },
    enabled: Boolean(token && historyDrawerOpened),
    staleTime: 30_000,
    refetchInterval: (query) =>
      historyDrawerOpened && query.state.data?.conversations.some((c) => !c.summary)
        ? 3000
        : false,
  });

  const {
    data: archivedHistory,
    isPending: archivedHistoryPending,
    isError: archivedHistoryError,
    error: archivedHistoryErrorDetail,
  } = useQuery({
    queryKey: ["agentic-chat-archived-history", token, viewingArchivedId],
    queryFn: async () => {
      const response = await apiFetch(
        `/agentic-chat/conversations/${viewingArchivedId}/history`,
        token!,
      );
      return apiReadJson<AgenticChatHistoryResponse>(response, t("chat.errors.loadConversation"));
    },
    enabled: Boolean(token && viewingArchivedId),
    staleTime: 60_000,
    refetchInterval: (query) =>
      viewingArchivedId && !query.state.data?.summary ? 3000 : false,
  });

  useEffect(() => {
    if (!user) return;
    const socket = io(REALTIME_URL, { transports: ["websocket", "polling"], timeout: 10000 });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join-user", { userId: user.id }));
    socket.on("agentic-chat-message", (payload: RealtimeChatMessage) => {
      const tutorId = tutorConversationIdRef.current;
      if (tutorId) {
        if (payload.conversation_id !== tutorId) return;
      } else if (!waitingRef.current) {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: payload.message.id,
          role: "assistant",
          content: payload.message.content,
          createdAt: payload.message.created || new Date().toISOString(),
          assignedTasks: payload.message.assigned_tasks ?? [],
          japaneseRenders: payload.message.japanese_renders ?? [],
        },
      ]);
    });
    socket.on("agentic-chat-complete", (payload: RealtimeComplete) => {
      const tutorId = tutorConversationIdRef.current;
      if (tutorId) {
        if (payload.conversation_id !== tutorId) return;
      } else if (!waitingRef.current) {
        return;
      }
      setWaiting(false);
      setPendingRunId(null);
      if (payload?.error) setError(payload.error);
      void queryClient.invalidateQueries({ queryKey: ["agentic-chat-history", token] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiFetch("/agentic-chat/messages", token!, {
        method: "POST",
        jsonBody: { message },
      });
      return apiReadJson<AgenticChatMessageResponse>(response, t("chat.errors.sendMessage"));
    },
    onMutate: (message) => {
      setError(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-user`,
          role: "user",
          content: message,
          createdAt: new Date().toISOString(),
          assignedTasks: [],
          japaneseRenders: [],
        },
      ]);
      setWaiting(true);
    },
    onError: (err: Error) => {
      setWaiting(false);
      setPendingRunId(null);
      setError(err.message);
    },
    onSuccess: (data) => {
      tutorConversationIdRef.current = data.conversation_id;
      setPendingRunId(data.celery_task_id);
    },
  });

  const clearConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/agentic-chat/conversation/clear", token!, { method: "POST" });
      return apiReadJson<AgenticChatClearResponse>(response, t("chat.errors.startNewConversation"));
    },
    onSuccess: () => {
      closeClearModal();
      setMessages([]);
      setWaiting(false);
      setPendingRunId(null);
      clearTaskDraft();
      void queryClient.invalidateQueries({ queryKey: ["agentic-chat-history", token] });
      void queryClient.invalidateQueries({ queryKey: ["agentic-chat-conversations", token] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const content = input.trim();
    if (!token || !content || waiting || sendMessageMutation.isPending || hasPendingTask) return;
    setInput("");
    sendMessageMutation.mutate(content);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const displayMessages = viewingArchivedId
    ? archivedHistory
      ? historyToChatEntries(archivedHistory.messages)
      : []
    : messages;
  const transcriptLoading = viewingArchivedId ? archivedHistoryPending : historyPending;
  const isArchivedView = Boolean(viewingArchivedId);
  const archivedTitle =
    archivedHistory?.title || viewingArchivedTitle || t("chat.archivedDefaultTitle");
  const archivedSummary = archivedHistory?.summary?.trim() || null;
  const localizedArchivedSummary = archivedSummary
    ? localizeConversationSummary(archivedSummary, t)
    : null;

  useEffect(() => {
    setAnalysisExpanded(false);
  }, [viewingArchivedId]);

  function exitArchivedView() {
    setViewingArchivedId(null);
    setViewingArchivedTitle(null);
    setAnalysisExpanded(false);
  }

  function openArchivedConversation(conversation: AgenticChatConversationSummary) {
    setViewingArchivedId(conversation.id);
    setViewingArchivedTitle(conversation.title);
    closeHistoryDrawer();
  }

  const pendingTaskItems = collectPendingTaskItems(isArchivedView ? [] : messages);
  const pendingTasks = pendingTaskItems.map(({ task }) => task);
  const hasPendingTask = pendingTaskItems.length > 0;

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, waiting, autoScroll]);
  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";
  const canSend = Boolean(
    token &&
      input.trim() &&
      !waiting &&
      !sendMessageMutation.isPending &&
      !hasPendingTask &&
      !isArchivedView,
  );

  return (
    <Box
      flex={1}
      mih={0}
      style={{ display: "flex", flexDirection: "column", background: "var(--mantine-color-body)" }}
    >
      <Box
        px="lg"
        py="sm"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-default)",
          flexShrink: 0,
        }}
      >
        <Group gap="sm" justify="space-between">
          <Group gap="sm">
            <Avatar color="violet" radius="xl" size="sm">
              日
            </Avatar>
            <Text size="sm" fw={600} lh={1.2}>
              {t("chat.tutorName")}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap" visibleFrom="lg">
            <Button
              size="xs"
              variant="light"
              color="gray"
              leftSection={<IconHistory size={14} />}
              onClick={openHistoryDrawer}
              disabled={!token}
            >
              {t("chat.history")}
            </Button>
            <Button
              size="xs"
              variant="light"
              color="gray"
              leftSection={<IconEdit size={14} />}
              onClick={openClearModal}
              disabled={!token || clearConversationMutation.isPending || isArchivedView}
            >
              {t("chat.startNewConversation")}
            </Button>
          </Group>
          <Group gap={4} wrap="nowrap" hiddenFrom="lg">
            <HeaderIconAction
              label={t("chat.history")}
              icon={<IconHistory size={16} />}
              color="gray"
              disabled={!token}
              onClick={openHistoryDrawer}
            />
            <HeaderIconAction
              label={t("chat.startNewConversation")}
              icon={<IconEdit size={16} />}
              color="gray"
              loading={clearConversationMutation.isPending}
              disabled={!token || isArchivedView}
              onClick={openClearModal}
            />
          </Group>
        </Group>
      </Box>

      <Drawer
        opened={historyDrawerOpened}
        onClose={closeHistoryDrawer}
        title={t("chat.pastConversations")}
        position="right"
        size="md"
      >
        {conversationsPending ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : (conversationList?.conversations.length ?? 0) === 0 ? (
          <Text size="sm" c="dimmed">
            {t("chat.historyEmpty")}
          </Text>
        ) : (
          <Stack gap="xs">
            {conversationList?.conversations.map((conversation) => (
              <UnstyledButton
                key={conversation.id}
                onClick={() => openArchivedConversation(conversation)}
              >
                <Paper withBorder p="sm" radius="md">
                  <Stack gap={4}>
                    <Text size="sm" fw={600} lineClamp={2}>
                      {conversation.title}
                    </Text>
                    {conversation.summary ? (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {conversationSummaryPreview(conversation.summary, t)}
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed" fs="italic">
                        {t("chat.analysisInProgress")}
                      </Text>
                    )}
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c="dimmed">
                        {t("chat.messageCount", { count: conversation.message_count })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatConversationWhen(conversation, i18n.language)}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </UnstyledButton>
            ))}
          </Stack>
        )}
      </Drawer>

      <Modal
        opened={clearModalOpened}
        onClose={closeClearModal}
        title={t("chat.startNewConversation")}
        centered
      >
        <Stack gap="md">
          <Text size="sm">{t("chat.startNewConversationModalBody")}</Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeClearModal}>
              {t("chat.cancel")}
            </Button>
            <Button
              color="orange"
              loading={clearConversationMutation.isPending}
              onClick={() => clearConversationMutation.mutate()}
            >
              {t("chat.startNewConversationConfirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {isArchivedView ? (
        <Box
          px="md"
          py="xs"
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-default)",
            flexShrink: 0,
          }}
        >
          <Stack gap="xs" maw={720} mx="auto">
            <Group justify="space-between" align="flex-start">
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text size="xs" c="dimmed">
                  {t("chat.viewingArchived")}
                </Text>
                <Text size="sm" fw={600} lineClamp={2}>
                  {archivedTitle}
                </Text>
              </Stack>
              <Button size="xs" variant="light" onClick={exitArchivedView} style={{ flexShrink: 0 }}>
                {t("chat.backToCurrentChat")}
              </Button>
            </Group>
            <UnstyledButton
              onClick={() => setAnalysisExpanded((open) => !open)}
              style={{ width: "100%" }}
            >
              <Group justify="space-between" gap="xs" wrap="nowrap">
                <Group gap={6} wrap="nowrap">
                  <Text size="sm" fw={600}>
                    {t("chat.sessionAnalysis")}
                  </Text>
                  {!archivedSummary && archivedHistoryPending ? (
                    <Text size="xs" c="dimmed" fs="italic">
                      {t("chat.generating")}
                    </Text>
                  ) : null}
                </Group>
                <IconChevronDown
                  size={16}
                  style={{
                    flexShrink: 0,
                    transition: "transform 150ms ease",
                    transform: analysisExpanded ? "rotate(180deg)" : undefined,
                  }}
                />
              </Group>
            </UnstyledButton>
            <Collapse in={analysisExpanded}>
              <Paper withBorder p="sm" radius="md">
                {localizedArchivedSummary ? (
                  <MarkdownMessage content={localizedArchivedSummary} compact />
                ) : archivedHistoryPending ? (
                  <Group gap="xs" justify="center">
                    <Loader size="xs" />
                    <Text size="sm" c="dimmed">
                      {t("chat.generatingSessionAnalysis")}
                    </Text>
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    {t("chat.noAnalysis")}
                  </Text>
                )}
              </Paper>
            </Collapse>
          </Stack>
        </Box>
      ) : null}

      <ScrollArea style={{ flex: 1, minHeight: 0 }} px="md" py="sm">
        <Stack
          gap="md"
          py="sm"
          maw={720}
          mx="auto"
          ref={bindMessagesContainer}
        >
          {displayMessages.length === 0 && (
            <Center h={200}>
              {transcriptLoading ? (
                <Loader size="sm" />
              ) : archivedHistoryError ? (
                <Text size="sm" c="red" ta="center">
                  {(archivedHistoryErrorDetail as Error)?.message ??
                    t("chat.failedToLoadConversation")}
                </Text>
              ) : isArchivedView ? (
                <Text size="sm" c="dimmed">
                  {t("chat.noMessages")}
                </Text>
              ) : (
                <Stack align="center" gap="xs">
                  <Text size="xl">👋</Text>
                  <Text fw={500}>{t("chat.emptyStateTitle")}</Text>
                  <Text size="sm" c="dimmed">
                    {t("chat.emptyStateSubtitle")}
                  </Text>
                </Stack>
              )}
            </Center>
          )}

          {displayMessages.map((m) =>
            m.role === "user" ? (
              <Group key={m.id} justify="flex-end" align="flex-end" gap="xs">
                <Stack gap={4} align="flex-end" maw="75%">
                  {m.content ? (
                    <Paper
                      px="md"
                      py="sm"
                      radius="xl"
                      style={{ background: "var(--mantine-color-blue-6)", borderBottomRightRadius: 4 }}
                    >
                      <MarkdownMessage content={m.content} inverted />
                    </Paper>
                  ) : isArchivedView ? (
                    <Text size="sm" c="dimmed" fs="italic">
                      {t("chat.submittedTaskAnswers")}
                    </Text>
                  ) : null}
                  <ChatMessageTimestamp createdAt={m.createdAt} />
                </Stack>
                <Avatar color="blue" radius="xl" size="sm">
                  {userInitial}
                </Avatar>
              </Group>
            ) : (
              <Group key={m.id} align="flex-start" gap="xs">
                <Avatar color="violet" radius="xl" size="sm" mt={4}>
                  日
                </Avatar>
                <Stack gap={4} align="flex-start" maw="75%">
                  {(m.content || m.assignedTasks.length > 0) && (
                    <Paper
                      px="md"
                      py="sm"
                      radius="xl"
                      style={{
                        background: "var(--mantine-color-default)",
                        border: "1px solid var(--mantine-color-default-border)",
                        borderBottomLeftRadius: 4,
                      }}
                    >
                      <AssistantMessageBody
                        messageId={m.id}
                        token={token}
                        content={m.content}
                        renders={m.japaneseRenders}
                        initialSegments={m.audioSegments}
                      />
                      {m.assignedTasks.length > 0 && (
                        <Stack gap="xs" mt={m.content ? "sm" : 0}>
                          {m.assignedTasks.map((task) => (
                            <TaskCard key={task.id} task={task} interactive={false} />
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  )}
                  <ChatMessageTimestamp createdAt={m.createdAt} />
                </Stack>
              </Group>
            ),
          )}

          {waiting && !isArchivedView && (
            <Group align="flex-end" gap="xs">
              <Avatar color="violet" radius="xl" size="sm">
                日
              </Avatar>
              <Paper
                px="md"
                py="sm"
                radius="xl"
                style={{
                  background: "var(--mantine-color-default)",
                  border: "1px solid var(--mantine-color-default-border)",
                  borderBottomLeftRadius: 4,
                }}
              >
                <Loader size="xs" type="dots" />
              </Paper>
            </Group>
          )}

          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      {token && selection ? (
        <VocabSelectionPopover
          token={token}
          selection={selection}
          onClose={clearSelection}
        />
      ) : null}

      <Box
        px="md"
        py="sm"
        style={{
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-default)",
          flexShrink: 0,
        }}
      >
        <Box maw={720} mx="auto">
          {error ? (
            <Text size="xs" c="red" mb={6}>
              {error}
            </Text>
          ) : null}
          {isArchivedView ? (
            <Paper radius="xl" withBorder p="sm">
              <Text size="sm" c="dimmed" ta="center">
                {t("chat.readOnlyArchived")}
              </Text>
            </Paper>
          ) : hasPendingTask ? (
            <Paper radius="xl" withBorder p="sm">
              <Group justify="space-between" gap="sm">
                <Stack gap={0}>
                  <Text size="sm" fw={600}>
                    {t("chat.assignedTask", { count: pendingTasks.length })}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t("chat.pendingTaskHint")}
                  </Text>
                </Stack>
                <Button onClick={() => router.push("/tasks")}>{t("chat.solveAssignedTasks")}</Button>
              </Group>
            </Paper>
          ) : (
            <form onSubmit={sendMessage}>
              <Paper
                radius="xl"
                withBorder
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  padding: "8px 8px 8px 16px",
                }}
              >
                <Textarea
                  style={{ flex: 1 }}
                  placeholder={t("chat.messagePlaceholder")}
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  autosize
                  minRows={1}
                  maxRows={6}
                  variant="unstyled"
                />
                <ActionIcon
                  type="submit"
                  size="lg"
                  radius="xl"
                  disabled={!canSend}
                  color="blue"
                  variant={canSend ? "filled" : "subtle"}
                >
                  ↑
                </ActionIcon>
              </Paper>
            </form>
          )}
        </Box>
      </Box>
    </Box>
  );
}
