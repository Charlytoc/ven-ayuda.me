export const TASK_DRAFT_KEY = "japanese_practice_task_draft";
export const CHAT_WAITING_KEY = "japanese_practice_chat_waiting";

export type TaskDraft = {
  conversationId: string;
  answers: Record<string, string>;
  note: string;
  savedAt: string;
};

export function readTaskDraft(): TaskDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TASK_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TaskDraft;
    if (!parsed?.conversationId || typeof parsed.answers !== "object") return null;
    return {
      conversationId: parsed.conversationId,
      answers: parsed.answers ?? {},
      note: typeof parsed.note === "string" ? parsed.note : "",
      savedAt: parsed.savedAt ?? "",
    };
  } catch {
    return null;
  }
}

export function writeTaskDraft(draft: TaskDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASK_DRAFT_KEY, JSON.stringify(draft));
}

export function clearTaskDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TASK_DRAFT_KEY);
}

export function setChatWaitingPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAT_WAITING_KEY, "1");
}

export function consumeChatWaitingPending(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(CHAT_WAITING_KEY) === "1";
  if (pending) sessionStorage.removeItem(CHAT_WAITING_KEY);
  return pending;
}

export function mergeDraftAnswers(
  draft: TaskDraft | null,
  conversationId: string | null,
  pendingTaskIds: string[],
): { answers: Record<string, string>; note: string } {
  if (!draft || !conversationId || draft.conversationId !== conversationId) {
    return { answers: {}, note: "" };
  }
  const idSet = new Set(pendingTaskIds);
  const answers: Record<string, string> = {};
  for (const [taskId, answer] of Object.entries(draft.answers)) {
    if (idSet.has(taskId) && answer.trim()) {
      answers[taskId] = answer;
    }
  }
  return { answers, note: draft.note ?? "" };
}
