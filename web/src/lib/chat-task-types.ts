export type JapaneseRender = {
  segments: { text: string; furigana?: string | null }[];
  translation?: string;
};

/** A generated TTS clip for part of an assistant message (narration or a Japanese phrase). */
export type AudioSegment = {
  kind: "narration" | "render" | string;
  media_id: string;
  url: string;
  voice: string;
  text: string;
};

export type Choice = {
  text: string;
  is_correct?: boolean | null;
};

export type PhrasePart = {
  type: "text" | "blank";
  text?: string;
  segments?: TextSegment[];
  answer?: string | null;
};

export type TextSegment = {
  text: string;
  furigana?: string | null;
  is_target?: boolean;
};

export type TaskExample = {
  segments: TextSegment[];
  meaning: string;
};

export type PoolToken = {
  id: string;
  text: string;
  furigana?: string | null;
};

export type DialogueTurn = {
  speaker: string;
  is_blank?: boolean;
  text?: string;
  segments?: TextSegment[];
  built_tokens?: PoolToken[];
};

// listen_and_respond
export type Speaker = {
  label: string;
  name?: string;
};

export type ConvCharacter = {
  slug: string;
  label: string;
  name: string;
  segments?: TextSegment[];
};

export type AudioTurn = {
  speaker_label: string;
  speaker_name?: string;  // always present — name shown on play buttons before solving
  audio_url?: string | null;
  // reveal-only:
  speaker?: string;
  text?: string;
  segments?: TextSegment[];
  translation?: string;
};

export type Statement = {
  id: string;
  text: string;
  is_correct?: boolean;
};

// ---------------------------------------------------------------------------
// Structured task result types (discriminated by `type`)
// ---------------------------------------------------------------------------

export type GuessMeaningResult = {
  type: "guess_meaning";
  is_correct: boolean;
  selected: string;
  score?: number | null;
  feedback?: string;
};

export type GuessReadingResult = {
  type: "guess_reading";
  is_correct: boolean;
  selected: string;
  score?: number | null;
  feedback?: string;
};

export type FillParticleResult = {
  type: "fill_particle";
  is_correct: boolean;
  filled: string[];
  score?: number | null;
  feedback?: string;
};

export type OrderPhraseResult = {
  type: "order_phrase";
  is_correct: boolean;
  ordered: string[];
  score?: number | null;
  feedback?: string;
};

export type BuildDialogueResult = {
  type: "build_dialogue";
  is_correct: boolean;
  built_token_ids: string[];
  score?: number | null;
  feedback?: string;
};

export type ListenAndRespondResult = {
  type: "listen_and_respond";
  is_correct: boolean;
  selected_statement_ids: string[];
  score?: number | null;
  feedback?: string;
};

export type WritingPracticeResult = {
  type: "writing_practice";
  is_correct: boolean;
  accepted: boolean;
  gave_up: boolean;
  score?: number | null;
  feedback?: string;
};

export type FreeSpeechResult = {
  type: "free_form_speech";
  is_correct: boolean;
  transcription: string;
  elements_met: string[];
  elements_missed: string[];
  score?: number | null;
  feedback?: string;
};

export type TaskResult =
  | GuessMeaningResult
  | GuessReadingResult
  | FillParticleResult
  | OrderPhraseResult
  | BuildDialogueResult
  | ListenAndRespondResult
  | WritingPracticeResult
  | FreeSpeechResult;

// ---------------------------------------------------------------------------

export type TaskData = {
  id: string;
  type: string;
  status: "pending" | "solved" | "abandoned";
  kanji?: string;
  reading?: string;
  onyomi?: string[];
  kunyomi?: string[];
  meaning?: string;
  explanation?: string;
  examples?: TaskExample[];
  choices?: Choice[];
  segments?: TextSegment[];
  parts?: PhrasePart[];
  tokens?: string[];
  correct_order?: string[];
  mode?: string;
  turns?: DialogueTurn[];
  pool?: PoolToken[];
  correct_solutions?: string[][];
  image_url?: string | null;
  // writing_practice
  character?: string;
  prompt?: string;
  show_character?: boolean;
  // listen_and_respond
  scenario?: string | null;
  speakers?: Speaker[];
  characters?: ConvCharacter[];
  audio_turns?: AudioTurn[];
  statements?: Statement[];
  correct_statement_ids?: string[];
  // free_form_speech
  prompt_audio_url?: string | null;
  prompt_translation?: string | null;
  expected_elements?: string[];
  example_answer?: string | null;
  example_segments?: TextSegment[];
  // structured result — populated once the task is solved
  result?: TaskResult | null;
  is_correct?: boolean | null;
};

export type AgenticChatMessageResponse = {
  status: string;
  conversation_id: string;
  message_id: string;
  celery_task_id: string;
};

export type AgenticChatRunStatusResponse = {
  status: "pending" | "completed" | "error" | string;
  error?: string | null;
};

export type AgenticChatClearResponse = {
  status: string;
  had_active_conversation: boolean;
};

export type AgenticChatHistoryMessage = {
  id: string;
  role: string;
  content: string;
  created: string;
  assigned_tasks: TaskData[];
  japanese_renders?: JapaneseRender[];
  audio_segments?: AudioSegment[];
};

export type AgenticChatHistoryResponse = {
  conversation_id: string | null;
  title?: string | null;
  summary?: string | null;
  messages: AgenticChatHistoryMessage[];
};

export type AgenticChatConversationSummary = {
  id: string;
  title: string;
  summary?: string | null;
  status: string;
  message_count: number;
  last_interaction_at: string | null;
  closed_at: string | null;
  created: string;
};

export type AgenticChatConversationListResponse = {
  conversations: AgenticChatConversationSummary[];
};

export type TaskBatchResult = {
  task_id: string;
  correct: boolean;
  result?: TaskResult | null;
  choices?: Choice[];
  examples?: TaskExample[];
  explanation?: string | null;
  parts?: PhrasePart[];
  tokens?: string[];
  correct_order?: string[];
  meaning?: string | null;
  segments?: TextSegment[];
  mode?: string;
  turns?: DialogueTurn[];
  pool?: PoolToken[];
  correct_solutions?: string[][];
  image_url?: string | null;
  character?: string | null;
  prompt?: string | null;
  reading?: string | null;
  scenario?: string | null;
  speakers?: Speaker[];
  characters?: ConvCharacter[];
  audio_turns?: AudioTurn[];
  statements?: Statement[];
  correct_statement_ids?: string[];
};

export type TaskBatchSubmitResponse = {
  results: TaskBatchResult[];
};

export type SpeechSubmitResult = {
  task_id: string;
  correct: boolean;
  result?: FreeSpeechResult | null;
  transcription: string;
  feedback: string;
  score: number;
  example_answer: string;
  example_segments: TextSegment[];
  explanation: string;
};

export type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  assignedTasks: TaskData[];
  japaneseRenders: JapaneseRender[];
  audioSegments?: AudioSegment[];
};

export type PendingTaskItem = {
  task: TaskData;
  prompt: string;
};

export function historyToChatEntries(messages: AgenticChatHistoryMessage[]): ChatEntry[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content || "",
    createdAt: m.created,
    assignedTasks: m.assigned_tasks ?? [],
    japaneseRenders: m.japanese_renders ?? [],
    audioSegments: m.audio_segments ?? [],
  }));
}
