"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { RubyText } from "@/components/RubyText";
import { WritingCanvas } from "@/components/WritingCanvas";
import { apiFetch } from "@/lib/api-request";
import { TOKEN_KEY } from "@/lib/auth-storage";
import type {
  ChatEntry,
  Choice,
  DialogueTurn,
  PendingTaskItem,
  PoolToken,
  SpeechSubmitResult,
  Statement,
  TaskBatchResult,
  TaskData,
  TextSegment,
} from "@/lib/chat-task-types";

// ---------------------------------------------------------------------------
// Task UI
// ---------------------------------------------------------------------------

function parseTaskAnswerList(answer: string | null | undefined): string[] {
  if (!answer?.trim()) return [];
  try {
    const parsed = JSON.parse(answer) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // single-value tasks store a plain string
  }
  return [answer];
}

function serializeTaskAnswerList(values: string[]): string {
  return JSON.stringify(values);
}

function taskBlankCount(task: TaskData): number {
  return task.parts?.filter((part) => part.type === "blank").length ?? 0;
}

function isTaskAnswered(task: TaskData, answer: string | undefined): boolean {
  const trimmed = answer?.trim();
  if (!trimmed) return false;
  if (task.type === "fill_particle") {
    const fills = parseTaskAnswerList(trimmed);
    const blanks = taskBlankCount(task);
    return fills.length === blanks && fills.every((fill) => fill.trim());
  }
  if (task.type === "order_phrase") {
    return parseTaskAnswerList(trimmed).length === (task.tokens?.length ?? 0);
  }
  if (task.type === "build_dialogue") {
    return parseTaskAnswerList(trimmed).length > 0;
  }
  if (task.type === "listen_and_respond") {
    return parseTaskAnswerList(trimmed).length > 0;
  }
  if (task.type === "free_form_speech") {
    // Speech tasks are submitted independently via /submit-speech.
    // Treat as answered for the batch gate once the status flips to solved.
    return task.status === "solved";
  }
  return Boolean(trimmed);
}

function isUserChoice(task: TaskData, choiceText: string) {
  const result = task.result as { selected?: string } | undefined;
  if (!result?.selected) return false;
  if (task.type === "guess_meaning") {
    return choiceText.trim().toLowerCase() === result.selected.toLowerCase();
  }
  return choiceText.trim() === result.selected;
}

function ChoiceButton({
  choice,
  selected,
  solved,
  disabled,
  onClick,
}: {
  choice: Choice;
  selected: boolean;
  solved: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  let variant: "filled" | "outline" | "light" = "outline";
  let color: string | undefined;
  let extraStyle: React.CSSProperties = {};

  if (solved) {
    if (choice.is_correct === true) {
      color = "green";
      variant = "light";
      if (!selected) {
        // Missed correct answer — green fill but dashed red border to flag it
        extraStyle = { borderStyle: "dashed", borderColor: "var(--mantine-color-red-5)" };
      }
    } else if (selected) {
      // Picked a wrong option
      color = "red";
      variant = "light";
    } else {
      // Unselected wrong option — grey, no red signal
      color = "gray";
      variant = "outline";
    }
  } else if (selected) {
    color = "blue";
    variant = "filled";
  }

  return (
    <Button
      key={choice.text}
      variant={variant}
      color={color}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: JAPANESE_FONT.button,
        ...(solved ? { pointerEvents: "none" } : {}),
        ...extraStyle,
      }}
    >
      {choice.text}
    </Button>
  );
}

const JAPANESE_FONT = {
  sm: 24,
  md: 30,
  lg: 36,
  kanji: 42,
  furiganaRatio: 0.52,
  button: 16,
} as const;

function correctAnswers(task: TaskData) {
  return (task.choices ?? []).filter((choice) => choice.is_correct).map((choice) => choice.text);
}

function MeaningReadingInfo({ task }: { task: TaskData }) {
  const { t } = useTranslation();
  if (task.type !== "guess_meaning") return null;
  if (!task.reading && !task.onyomi?.length && !task.kunyomi?.length) return null;

  return (
    <Stack gap={2} align="center">
      {task.reading && (
        <Text size="sm" c="dimmed">
          {t("tasks.mainReading", { reading: task.reading })}
        </Text>
      )}
      {task.onyomi && task.onyomi.length > 0 && (
        <Text size="xs" c="dimmed">
          {t("tasks.onyomi", { readings: task.onyomi.join(" / ") })}
        </Text>
      )}
      {task.kunyomi && task.kunyomi.length > 0 && (
        <Text size="xs" c="dimmed">
          {t("tasks.kunyomi", { readings: task.kunyomi.join(" / ") })}
        </Text>
      )}
    </Stack>
  );
}

function mergeTaskWithBatchResult(task: TaskData, result: TaskBatchResult): TaskData {
  return {
    ...task,
    status: "solved",
    is_correct: result.correct,
    result: result.result ?? task.result,
    choices: result.choices ?? task.choices,
    examples: result.examples ?? task.examples,
    explanation: result.explanation ?? task.explanation,
    parts: result.parts?.length ? result.parts : task.parts,
    tokens: result.tokens?.length ? result.tokens : task.tokens,
    correct_order: result.correct_order?.length ? result.correct_order : task.correct_order,
    meaning: result.meaning ?? task.meaning,
    segments: result.segments?.length ? result.segments : task.segments,
    mode: result.mode ?? task.mode,
    turns: result.turns?.length ? result.turns : task.turns,
    pool: result.pool?.length ? result.pool : task.pool,
    correct_solutions: result.correct_solutions?.length ? result.correct_solutions : task.correct_solutions,
    image_url: result.image_url ?? task.image_url,
    character: result.character ?? task.character,
    prompt: result.prompt ?? task.prompt,
    reading: result.reading ?? task.reading,
    scenario: result.scenario ?? task.scenario,
    speakers: result.speakers?.length ? result.speakers : task.speakers,
    characters: result.characters?.length ? result.characters : task.characters,
    audio_turns: result.audio_turns?.length ? result.audio_turns : task.audio_turns,
    // Merge is_correct into the already-displayed statements by id so their on-screen
    // order doesn't jump when the reveal arrives.
    statements: mergeStatements(task.statements, result.statements),
    correct_statement_ids: result.correct_statement_ids?.length
      ? result.correct_statement_ids
      : task.correct_statement_ids,
  };
}

function mergeStatements(
  existing: Statement[] | undefined,
  revealed: Statement[] | undefined,
): Statement[] | undefined {
  if (!existing?.length) return revealed ?? existing;
  if (!revealed?.length) return existing;
  const byId = new Map(revealed.map((s) => [s.id, s]));
  return existing.map((s) => ({ ...s, is_correct: byId.get(s.id)?.is_correct ?? s.is_correct }));
}

function ExampleRow({ segments, meaning }: { segments: TextSegment[]; meaning: string }) {
  return (
    <Box style={{ display: "inline-block", lineHeight: 1 }}>
      <Box component="span" style={{ display: "inline-flex", alignItems: "flex-end" }}>
        {segments.map((seg, i) => (
          <Box
            key={i}
            component="span"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {seg.furigana ? (
              <Text
                component="span"
                c="dimmed"
                fw={500}
                style={{ fontSize: 14, lineHeight: 1.1, marginBottom: 2 }}
              >
                {seg.furigana}
              </Text>
            ) : null}
            <Text component="span" fw={700} style={{ fontSize: JAPANESE_FONT.md, lineHeight: 1.1 }}>
              {seg.text}
            </Text>
          </Box>
        ))}
      </Box>
      <Text
        component="span"
        size="xs"
        c="dimmed"
        style={{ display: "block", lineHeight: 1.2, marginTop: 2 }}
      >
        {meaning}
      </Text>
    </Box>
  );
}

function TaskRevealExtras({ task }: { task: TaskData }) {
  const { t } = useTranslation();
  if (task.status === "pending") return null;

  const examples = task.examples ?? [];
  const hasMeaningExtras = task.type === "guess_meaning" && examples.length > 0;
  const hasReadingExtras = task.type === "guess_reading" && task.explanation;
  const hasPhraseMeaning =
    (task.type === "fill_particle" ||
      task.type === "order_phrase" ||
      task.type === "build_dialogue") &&
    Boolean(task.meaning);
  const hasPhraseExplanation =
    (task.type === "fill_particle" ||
      task.type === "order_phrase" ||
      task.type === "build_dialogue") &&
    Boolean(task.explanation);
  const hasOrderedRuby = task.type === "order_phrase" && (task.segments?.length ?? 0) > 0;
  if (!hasMeaningExtras && !hasReadingExtras && !hasPhraseMeaning && !hasPhraseExplanation && !hasOrderedRuby) {
    return null;
  }

  return (
    <Stack gap="xs" mt="xs">
      {hasMeaningExtras && (
        <Stack gap="sm">
          <Text size="xs" fw={600} c="dimmed">
            {t("tasks.examples")}
          </Text>
          {examples.map((ex, i) => (
            <ExampleRow key={i} segments={ex.segments} meaning={ex.meaning} />
          ))}
        </Stack>
      )}
      {hasReadingExtras && <MarkdownMessage content={task.explanation!} compact />}
      {hasPhraseMeaning && (
        <Text size="sm" c="dimmed" ta="center">
          {task.meaning}
        </Text>
      )}
      {hasOrderedRuby && <RubyText segments={task.segments!} pending={false} />}
      {hasPhraseExplanation && <MarkdownMessage content={task.explanation!} compact />}
    </Stack>
  );
}

function GuessMeaningCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const solved = task.status !== "pending";

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="xs">
        <Stack gap={2} align="center">
          <Text size="xl" fw={700} style={{ fontSize: JAPANESE_FONT.kanji, lineHeight: 1.2 }}>
            {task.kanji}
          </Text>
          <MeaningReadingInfo task={task} />
        </Stack>
        {(interactive || solved) && (
          <SimpleGrid cols={2} spacing="xs">
            {task.choices?.map((choice) => (
              <ChoiceButton
                key={choice.text}
                choice={choice}
                selected={solved ? isUserChoice(task, choice.text) : selected === choice.text}
                solved={solved}
                disabled={!interactive && !solved}
                onClick={() => onSelect?.(choice.text)}
              />
            ))}
          </SimpleGrid>
        )}
        <TaskRevealExtras task={task} />
      </Stack>
    </Paper>
  );
}

function GuessReadingCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const solved = task.status !== "pending";
  const answers = correctAnswers(task);

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="xs">
        <Stack gap={2} align="center">
          {task.segments && task.segments.length > 0 ? (
            <RubyText segments={task.segments} pending={!solved} targetReading={answers[0]} />
          ) : (
            <Text size="xl" fw={700} c="dimmed">
              —
            </Text>
          )}
          {task.meaning && (
            <Text size="sm" c="dimmed" ta="center">
              {task.meaning}
            </Text>
          )}
        </Stack>
        {(interactive || solved) && (
          <SimpleGrid cols={2} spacing="xs">
            {task.choices?.map((choice) => (
              <ChoiceButton
                key={choice.text}
                choice={choice}
                selected={solved ? isUserChoice(task, choice.text) : selected === choice.text}
                solved={solved}
                disabled={!interactive && !solved}
                onClick={() => onSelect?.(choice.text)}
              />
            ))}
          </SimpleGrid>
        )}
        <TaskRevealExtras task={task} />
      </Stack>
    </Paper>
  );
}

function FillParticleCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const solved = task.status !== "pending";
  const blankTotal = taskBlankCount(task);
  const fills = solved
    ? ((task.result as import("@/lib/chat-task-types").FillParticleResult | undefined)?.filled ?? [])
    : parseTaskAnswerList(selected);
  const paddedFills = Array.from({ length: blankTotal }, (_, i) => fills[i] ?? "");
  const [activeBlank, setActiveBlank] = useState(0);

  function setFillAt(index: number, value: string) {
    const next = [...paddedFills];
    next[index] = value;
    onSelect?.(serializeTaskAnswerList(next));
    if (index + 1 < blankTotal) setActiveBlank(index + 1);
  }

  let blankIndex = 0;
  const correctParticles = new Set(
    task.parts?.filter((part) => part.type === "blank").map((part) => part.answer ?? "") ?? [],
  );

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="xs">
        <Text
          size="lg"
          fw={600}
          component="div"
          style={{ fontSize: JAPANESE_FONT.md, lineHeight: 1.8 }}
        >
          {task.parts?.map((part, i) => {
            if (part.type === "text") {
              if (part.segments?.length) {
                return (
                  <span key={i} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                    <RubyText segments={part.segments} pending={false} size="md" />
                  </span>
                );
              }
              return (
                <span key={i} style={{ marginRight: 6 }}>
                  {part.text}
                </span>
              );
            }
            const slot = blankIndex;
            blankIndex += 1;
            const value = paddedFills[slot] ?? "";
            const correct = part.answer ?? "";
            const slotCorrect = solved ? value === correct : null;
            const isActive = interactive && activeBlank === slot;

            return (
              <Button
                key={i}
                size="sm"
                variant={value ? "light" : "outline"}
                color={
                  solved
                    ? slotCorrect
                      ? "green"
                      : "red"
                    : isActive
                      ? "blue"
                      : "gray"
                }
                mx={4}
                onClick={() => interactive && setActiveBlank(slot)}
                style={{
                  fontSize: JAPANESE_FONT.button,
                  ...(solved ? { pointerEvents: "none" } : {}),
                }}
              >
                {value || "＿＿"}
              </Button>
            );
          })}
        </Text>

        {(interactive || solved) && (
          <SimpleGrid cols={3} spacing="xs">
            {task.choices?.map((choice) => (
              <ChoiceButton
                key={choice.text}
                choice={{
                  text: choice.text,
                  is_correct: solved ? correctParticles.has(choice.text) : null,
                }}
                selected={paddedFills.includes(choice.text)}
                solved={solved}
                disabled={!interactive && !solved}
                onClick={() => interactive && setFillAt(activeBlank, choice.text)}
              />
            ))}
          </SimpleGrid>
        )}
        <TaskRevealExtras task={task} />
      </Stack>
    </Paper>
  );
}

function PoolTokenChip({
  token,
  onClick,
  readOnly,
  color,
  variant = "outline",
}: {
  token: PoolToken;
  onClick?: () => void;
  readOnly?: boolean;
  color?: string;
  variant?: "outline" | "light" | "filled";
}) {
  return (
    <Button
      size="sm"
      variant={variant}
      color={color}
      onClick={onClick}
      style={{
        fontSize: JAPANESE_FONT.button,
        height: "auto",
        padding: "6px 10px",
        ...(readOnly ? { pointerEvents: "none" } : {}),
      }}
    >
      {token.furigana ? (
        <Box style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
          <Text component="span" size="xs" c="dimmed" style={{ fontSize: 11 }}>
            {token.furigana}
          </Text>
          <Text component="span" fw={600}>
            {token.text}
          </Text>
        </Box>
      ) : (
        token.text
      )}
    </Button>
  );
}

/**
 * Finds the correct solution (from correct_solutions) that matches the most
 * tokens in builtTexts, then returns a per-token boolean array indicating
 * whether each token is in the right position.
 */
function computeTokenCorrectness(builtTexts: string[], correctSolutions: string[][]): boolean[] {
  if (!correctSolutions.length) return builtTexts.map(() => false);

  let bestSolution = correctSolutions[0];
  let bestScore = 0;
  for (const solution of correctSolutions) {
    const score = builtTexts.reduce(
      (acc, text, i) => acc + (solution[i] === text ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestSolution = solution;
    }
  }

  return builtTexts.map((text, i) => bestSolution[i] === text);
}

function DialogueTurnLine({
  turn,
  builtIds,
  poolById,
  solved,
  tokenCorrectness,
}: {
  turn: DialogueTurn;
  builtIds: string[];
  poolById: Record<string, PoolToken>;
  solved: boolean;
  tokenCorrectness: boolean[] | null;
}) {
  return (
    <Group gap="xs" align="flex-start" wrap="nowrap">
      <Text size="sm" fw={600} miw={72} style={{ flexShrink: 0 }}>
        {turn.speaker}:
      </Text>
      {turn.is_blank ? (
        <Group gap={4} wrap="wrap">
          {builtIds.length === 0 ? (
            <Text size="sm" c="dimmed">
              ___
            </Text>
          ) : (
            builtIds.map((id, i) => {
              const token = poolById[id];
              if (!token) return null;
              const tokenColor = solved
                ? tokenCorrectness?.[i] ? "green" : "red"
                : "blue";
              return (
                <PoolTokenChip
                  key={`${id}-${i}`}
                  token={token}
                  variant="light"
                  color={tokenColor}
                  readOnly
                />
              );
            })
          )}
        </Group>
      ) : turn.segments?.length ? (
        <RubyText segments={turn.segments} pending={false} size="sm" />
      ) : (
        <Text size="sm" style={{ fontSize: JAPANESE_FONT.md }}>
          {turn.text}
        </Text>
      )}
    </Group>
  );
}

function BuildDialogueCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const solved = task.status !== "pending";
  const builtIds = solved
    ? ((task.result as import("@/lib/chat-task-types").BuildDialogueResult | undefined)?.built_token_ids ?? [])
    : parseTaskAnswerList(selected);
  const poolById = useMemo(
    () => Object.fromEntries((task.pool ?? []).map((t) => [t.id, t])),
    [task.pool],
  );

  const poolRemaining = useMemo(() => {
    const used = [...builtIds];
    return (task.pool ?? []).filter((token) => {
      const idx = used.indexOf(token.id);
      if (idx >= 0) {
        used.splice(idx, 1);
        return false;
      }
      return true;
    });
  }, [task.pool, builtIds]);

  function addToken(id: string) {
    onSelect?.(serializeTaskAnswerList([...builtIds, id]));
  }

  function removeAt(index: number) {
    onSelect?.(serializeTaskAnswerList(builtIds.filter((_, i) => i !== index)));
  }

  const { t } = useTranslation();
  const buildLabel =
    task.mode === "build_question" ? t("tasks.buildTheQuestion") : t("tasks.buildTheAnswer");

  const builtTexts = builtIds.map((id) => poolById[id]?.text ?? "");
  const tokenCorrectness = solved
    ? computeTokenCorrectness(builtTexts, task.correct_solutions ?? [])
    : null;

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="sm">
        {task.image_url ? (
          <Box
            component="img"
            src={task.image_url}
            alt=""
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
          />
        ) : null}

        <Stack gap={6}>
          {(task.turns ?? []).map((turn, i) => (
            <DialogueTurnLine
              key={i}
              turn={turn}
              builtIds={turn.is_blank ? builtIds : []}
              poolById={poolById}
              solved={solved}
              tokenCorrectness={tokenCorrectness}
            />
          ))}
        </Stack>

        {(interactive || solved) && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              {buildLabel}
            </Text>
            <Group gap="xs" wrap="wrap" mih={36}>
              {builtIds.length === 0 ? (
                <Text size="sm" c="dimmed">
                  {t("tasks.tapTokensLine")}
                </Text>
              ) : (
                builtIds.map((id, i) => {
                  const token = poolById[id];
                  if (!token) return null;
                  const tokenColor = solved
                    ? tokenCorrectness?.[i] ? "green" : "red"
                    : "blue";
                  return (
                    <PoolTokenChip
                      key={`${id}-${i}`}
                      token={token}
                      variant="light"
                      color={tokenColor}
                      onClick={() => interactive && removeAt(i)}
                      readOnly={solved}
                    />
                  );
                })
              )}
            </Group>

            {interactive && poolRemaining.length > 0 && (
              <>
                <Text size="xs" c="dimmed">
                  {t("tasks.availableTokens")}
                </Text>
                <Group gap="xs" wrap="wrap">
                  {poolRemaining.map((token) => (
                    <PoolTokenChip
                      key={token.id}
                      token={token}
                      onClick={() => addToken(token.id)}
                    />
                  ))}
                </Group>
              </>
            )}
          </Stack>
        )}

        {solved && !task.is_correct && task.correct_solutions && task.correct_solutions.length > 0 && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={600}>
              {t("tasks.validAnswers")}
            </Text>
            {task.correct_solutions.map((solution, i) => (
              <Text key={i} size="xs" c="dimmed">
                {solution.join(" ")}
              </Text>
            ))}
          </Stack>
        )}

        <TaskRevealExtras task={task} />
      </Stack>
    </Paper>
  );
}

function OrderPhraseCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const solved = task.status !== "pending";
  const targetLen = task.tokens?.length ?? 0;
  const ordered = solved
    ? ((task.result as import("@/lib/chat-task-types").OrderPhraseResult | undefined)?.ordered ?? [])
    : parseTaskAnswerList(selected);

  const pool = useMemo(() => {
    const remaining = [...(task.tokens ?? [])];
    for (const token of ordered) {
      const idx = remaining.indexOf(token);
      if (idx >= 0) remaining.splice(idx, 1);
    }
    return remaining;
  }, [task.tokens, ordered]);

  function addToken(token: string) {
    if (ordered.length >= targetLen) return;
    onSelect?.(serializeTaskAnswerList([...ordered, token]));
  }

  function removeAt(index: number) {
    onSelect?.(serializeTaskAnswerList(ordered.filter((_, i) => i !== index)));
  }

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {t("tasks.yourSentence")}
        </Text>
        <Group gap="xs" wrap="wrap" mih={36}>
          {ordered.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t("tasks.tapTokensPhrase")}
            </Text>
          ) : (
            ordered.map((token, i) => {
              const correct = task.correct_order?.[i];
              const tokenCorrect = solved && correct ? token === correct : null;
              return (
                <Button
                  key={`${token}-${i}`}
                  size="sm"
                  variant="light"
                  color={solved ? (tokenCorrect ? "green" : "red") : "blue"}
                  onClick={() => interactive && removeAt(i)}
                  style={{
                    fontSize: JAPANESE_FONT.button,
                    ...(solved ? { pointerEvents: "none" } : {}),
                  }}
                >
                  {token}
                </Button>
              );
            })
          )}
        </Group>

        {interactive && pool.length > 0 && (
          <>
            <Text size="xs" c="dimmed">
              {t("tasks.availableTokens")}
            </Text>
            <Group gap="xs" wrap="wrap">
              {pool.map((token, i) => (
                <Button
                  key={`${token}-pool-${i}`}
                  size="sm"
                  variant="outline"
                  style={{ fontSize: JAPANESE_FONT.button }}
                  onClick={() => addToken(token)}
                >
                  {token}
                </Button>
              ))}
            </Group>
          </>
        )}

        {solved && !task.is_correct && task.correct_order && (
          <Text size="xs" c="dimmed">
            {t("tasks.correctOrder", { order: task.correct_order.join(" ") })}
          </Text>
        )}
        <TaskRevealExtras task={task} />
      </Stack>
    </Paper>
  );
}

function WritingPracticeCard({
  task,
  onSelect,
  interactive,
}: {
  task: TaskData;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const solved = task.status !== "pending";
  const showGuide = task.show_character !== false;
  const writingResult = task.result as import("@/lib/chat-task-types").WritingPracticeResult | undefined;
  const gaveUp = solved && !(writingResult?.accepted ?? false);
  const matchScore = writingResult?.score ?? null;

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="xs" align="center">
        {/* Recall mode: the glyph is hidden, so show the meaning as the cue. */}
        {!solved && !showGuide && (task.meaning || task.reading) && (
          <Stack gap={2} align="center">
            {task.meaning && (
              <Text size="sm" fw={600} ta="center">
                {task.meaning}
              </Text>
            )}
            {task.reading && (
              <Text size="sm" c="dimmed">
                {task.reading}
              </Text>
            )}
          </Stack>
        )}

        {solved ? (
          <Stack gap={2} align="center">
            <Text style={{ fontSize: JAPANESE_FONT.kanji * 1.4, lineHeight: 1.1 }} fw={700}>
              {task.character}
            </Text>
            {task.reading && (
              <Text size="sm" c="dimmed">
                {t("tasks.mainReading", { reading: task.reading })}
              </Text>
            )}
            {task.meaning && (
              <Text size="sm" c="dimmed">
                {task.meaning}
              </Text>
            )}
            <Text size="xs" c={gaveUp ? "dimmed" : task.is_correct ? "green" : "red"} fw={600}>
              {gaveUp
                ? t("tasks.writingSkipped")
                : matchScore != null && Number.isFinite(matchScore)
                  ? t("tasks.writingAccepted", { score: matchScore })
                  : task.is_correct
                    ? t("tasks.writingSolved")
                    : t("tasks.writingNotSolved")}
            </Text>
          </Stack>
        ) : (
          <Box style={{ maxWidth: "100%", overflowX: "auto" }}>
            <WritingCanvas
              key={task.id}
              character={task.character ?? ""}
              interactive={interactive}
              showCharacter={task.show_character !== false}
              zoomable
              onResult={(answer) => onSelect?.(answer)}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

function FreeSpeechCard({
  task,
  onSolve,
}: {
  task: TaskData;
  onSolve?: (taskId: string, result: SpeechSubmitResult) => void;
}) {
  const { t } = useTranslation();
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  type RecordState = "idle" | "recording" | "recorded" | "submitting";
  const solved = task.status !== "pending";
  const [recState, setRecState] = useState<RecordState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [speechResult, setSpeechResult] = useState<SpeechSubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (promptAudioRef.current) promptAudioRef.current.playbackRate = speed;
  }, [speed]);

  const persistedResult = task.result as import("@/lib/chat-task-types").FreeSpeechResult | undefined;
  const isCorrect = solved ? task.is_correct ?? false : (speechResult?.correct ?? false);

  function startTimer() {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioBlobUrl(url);
        setRecState("recorded");
        stopTimer();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecState("recording");
      startTimer();
    } catch {
      setError(t("tasks.speechMicError"));
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function submitSpeech() {
    if (!audioBlob || !token) return;
    setRecState("submitting");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("task_id", task.id);
      const ext = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      formData.append("audio", audioBlob, `recording.${ext}`);
      const response = await apiFetch("/tasks/submit-speech", token, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body?.error ?? t("tasks.speechSubmitError"));
      }
      const result = (await response.json()) as SpeechSubmitResult;
      setSpeechResult(result);
      onSolve?.(task.id, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tasks.speechSubmitError"));
      setRecState("recorded");
    }
  }

  const borderColor = solved
    ? isCorrect
      ? "var(--mantine-color-green-4)"
      : "var(--mantine-color-red-4)"
    : undefined;

  return (
    <Paper p="sm" radius="md" withBorder style={borderColor ? { borderColor } : undefined}>
      <Stack gap="sm">
        {/* Prompt area */}
        {(!solved || task.mode !== "audio_only") && (task.prompt || task.segments?.length) ? (
          <Box>
            {task.segments?.length ? (
              <RubyText segments={task.segments} pending size="md" />
            ) : (
              <Text style={{ fontSize: JAPANESE_FONT.md }}>{task.prompt}</Text>
            )}
            {task.prompt_translation && task.mode !== "audio_only" ? (
              <Text size="sm" c="dimmed" mt={2}>{task.prompt_translation}</Text>
            ) : null}
          </Box>
        ) : null}

        {/* Prompt audio */}
        {task.prompt_audio_url ? (
          <Stack gap={4}>
            <audio
              ref={promptAudioRef}
              src={task.prompt_audio_url}
              controls
              preload="metadata"
              style={{ width: "100%" }}
            />
            <Group gap={4} justify="flex-end">
              {([0.5, 1] as const).map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant={speed === s ? "filled" : "outline"}
                  color={speed === s ? "blue" : "gray"}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </Group>
          </Stack>
        ) : null}

        {/* Evaluation criteria — always visible */}
        {task.expected_elements?.length ? (
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb={4}>{t("tasks.speechCriteria")}</Text>
            <Stack gap={2}>
              {task.expected_elements.map((el, i) => (
                <Text key={i} size="xs" c="dimmed">• {el}</Text>
              ))}
            </Stack>
          </Box>
        ) : null}

        {/* Recording controls — only when task is pending */}
        {!solved && (
          <Stack gap="xs">
            {recState === "idle" && (
              <Button size="sm" onClick={() => void startRecording()}>
                🎙 {t("tasks.speechRecord")}
              </Button>
            )}
            {recState === "recording" && (
              <Group gap="xs" align="center">
                <Text size="sm" c="red" fw={700}>
                  ● {elapsed}s
                </Text>
                <Button size="sm" color="red" variant="light" onClick={stopRecording}>
                  ⏹ {t("tasks.speechStop")}
                </Button>
              </Group>
            )}
            {recState === "recorded" && (
              <Stack gap="xs">
                {audioBlobUrl ? (
                  <audio src={audioBlobUrl} controls style={{ width: "100%" }} />
                ) : null}
                <Group gap="xs">
                  <Button size="sm" variant="default" onClick={() => void startRecording()}>
                    {t("tasks.speechReRecord")}
                  </Button>
                  <Button size="sm" onClick={() => void submitSpeech()}>
                    {t("tasks.speechSubmit")}
                  </Button>
                </Group>
              </Stack>
            )}
            {recState === "submitting" && (
              <Group gap="xs" align="center">
                <Loader size="xs" />
                <Text size="sm" c="dimmed">{t("tasks.speechEvaluating")}</Text>
              </Group>
            )}
          </Stack>
        )}

        {error ? <Text size="sm" c="red">{error}</Text> : null}

        {/* Result — shown once solved */}
        {(solved || speechResult) && (
          <Stack gap="xs" mt={solved ? 0 : "xs"}>
            {solved && task.mode === "audio_only" && task.prompt ? (
              <Box>
                <Text size="xs" fw={600} c="dimmed">{t("tasks.speechPromptLabel")}</Text>
                {task.segments?.length ? (
                  <RubyText segments={task.segments} pending={false} size="sm" />
                ) : (
                  <Text size="sm" style={{ fontSize: JAPANESE_FONT.md }}>{task.prompt}</Text>
                )}
                {task.prompt_translation ? (
                  <Text size="xs" c="dimmed" mt={2}>{task.prompt_translation}</Text>
                ) : null}
              </Box>
            ) : null}

            {(speechResult?.transcription || persistedResult?.transcription) ? (
              <Box>
                <Text size="xs" fw={600} c="dimmed">{t("tasks.speechTranscription")}</Text>
                <Text size="sm" style={{ fontSize: JAPANESE_FONT.md }}>
                  {speechResult?.transcription ?? persistedResult?.transcription}
                </Text>
              </Box>
            ) : null}

            {(speechResult || persistedResult?.score != null) ? (
              <Group gap="xs" align="center">
                <Badge color={isCorrect ? "green" : "red"} size="sm">
                  {(speechResult?.score ?? persistedResult?.score ?? 0)}/100
                </Badge>
                <Text size="sm">{speechResult?.feedback ?? persistedResult?.feedback}</Text>
              </Group>
            ) : null}

            {(speechResult?.example_answer || task.example_answer) ? (
              <Box>
                <Text size="xs" fw={600} c="dimmed">{t("tasks.speechExampleAnswer")}</Text>
                {(speechResult?.example_segments?.length || task.example_segments?.length) ? (
                  <RubyText
                    segments={speechResult?.example_segments ?? task.example_segments ?? []}
                    pending={false}
                    size="sm"
                  />
                ) : (
                  <Text size="sm" style={{ fontSize: JAPANESE_FONT.md }}>
                    {speechResult?.example_answer ?? task.example_answer}
                  </Text>
                )}
              </Box>
            ) : null}

            <TaskRevealExtras task={task} />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function ListenAndRespondCard({
  task,
  selected,
  onSelect,
  interactive,
}: {
  task: TaskData;
  selected: string | null;
  onSelect?: (answer: string) => void;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const solved = task.status !== "pending";
  const turns = task.audio_turns ?? [];
  const statements = task.statements ?? [];
  const selectedIds = solved
    ? ((task.result as import("@/lib/chat-task-types").ListenAndRespondResult | undefined)?.selected_statement_ids ?? [])
    : parseTaskAnswerList(selected);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [playAllIdx, setPlayAllIdx] = useState<number | null>(null);
  const [speed, setSpeed] = useState<0.5 | 1>(1);

  // Keep all elements in sync when speed changes.
  useEffect(() => {
    audioRefs.current.forEach((el) => {
      if (el) el.playbackRate = speed;
    });
  }, [speed]);

  useEffect(() => {
    if (playAllIdx == null) return;
    const el = audioRefs.current[playAllIdx];
    if (el) {
      el.playbackRate = speed;
      el.currentTime = 0;
      void el.play().catch(() => setPlayAllIdx(null));
    }
  }, [playAllIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  function playOne(i: number) {
    setPlayAllIdx(null);
    audioRefs.current.forEach((el, idx) => {
      if (el && idx !== i) el.pause();
    });
    const el = audioRefs.current[i];
    if (el) {
      el.playbackRate = speed;
      el.currentTime = 0;
      void el.play().catch(() => undefined);
    }
  }

  function toggle(id: string) {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onSelect?.(serializeTaskAnswerList([...set]));
  }

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={
        solved
          ? {
              borderColor: task.is_correct
                ? "var(--mantine-color-green-4)"
                : "var(--mantine-color-red-4)",
            }
          : undefined
      }
    >
      <Stack gap="sm">
        {task.scenario ? (
          <Text size="sm" c="dimmed" ta="center">
            {task.scenario}
          </Text>
        ) : null}

        {/* Audio players */}
        <Stack gap="xs">
          <Group gap="xs" wrap="wrap" align="center" justify="space-between">
            <Group gap="xs" wrap="wrap" align="center">
              <Button
                size="xs"
                variant="filled"
                onClick={() => setPlayAllIdx(0)}
                disabled={turns.length === 0}
              >
                ▶ {t("tasks.listenPlayAll")}
              </Button>
              {turns.map((turn, i) => (
                <Button
                  key={i}
                  size="xs"
                  variant={playAllIdx === i ? "filled" : "light"}
                  color={playAllIdx === i ? "blue" : "gray"}
                  onClick={() => playOne(i)}
                >
                  ▶ {turn.speaker_name ?? turn.speaker_label}
                </Button>
              ))}
            </Group>
            <Group gap={4}>
              {([0.5, 1] as const).map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant={speed === s ? "filled" : "outline"}
                  color={speed === s ? "blue" : "gray"}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </Group>
          </Group>
          {turns.map((turn, i) => (
            <audio
              key={i}
              ref={(el) => {
                audioRefs.current[i] = el;
              }}
              src={turn.audio_url ?? undefined}
              preload="none"
              onEnded={() => {
                if (playAllIdx === i) {
                  setPlayAllIdx(i + 1 < turns.length ? i + 1 : null);
                }
              }}
            />
          ))}
        </Stack>

        {/* Statements (multi-select) */}
        <Stack gap={6}>
          <Text size="xs" c="dimmed">
            {t("tasks.listenSelectTrue")}
          </Text>
          {statements.map((s) => {
            const isSel = selectedIds.includes(s.id);
            let color: string | undefined;
            let variant: "outline" | "light" | "filled" = "outline";
            let extraStyle: React.CSSProperties = {};

            if (solved) {
              if (s.is_correct) {
                color = "green";
                variant = "light";
                if (!isSel) {
                  // Missed — green fill + dashed red border
                  extraStyle = { borderStyle: "dashed", borderColor: "var(--mantine-color-red-5)" };
                }
              } else if (isSel) {
                // Selected a wrong statement
                color = "red";
                variant = "light";
              } else {
                // Unselected wrong — grey, not red
                color = "gray";
                variant = "outline";
              }
            } else if (isSel) {
              color = "blue";
              variant = "filled";
            }

            return (
              <Button
                key={s.id}
                size="sm"
                variant={variant}
                color={color}
                justify="flex-start"
                onClick={() => interactive && !solved && toggle(s.id)}
                style={{
                  height: "auto",
                  padding: "8px 12px",
                  whiteSpace: "normal",
                  textAlign: "left",
                  ...(solved ? { pointerEvents: "none" } : {}),
                  ...extraStyle,
                }}
              >
                <Text size="sm" style={{ whiteSpace: "normal" }}>
                  {solved ? (s.is_correct && isSel ? "✓ " : s.is_correct && !isSel ? "→ " : isSel ? "✗ " : "") : ""}
                  {s.text}
                </Text>
              </Button>
            );
          })}
        </Stack>

        {/* Reveal: transcript + translations */}
        {solved && (
          <Stack gap={6} mt="xs">
            <Divider />
            <Text size="xs" fw={600} c="dimmed">
              {t("tasks.listenTranscript")}
            </Text>
            {turns.map((turn, i) => (
              <Box key={i}>
                <Text size="xs" fw={600} c="dimmed">
                  {turn.speaker ?? turn.speaker_label}
                </Text>
                {turn.segments?.length ? (
                  <RubyText segments={turn.segments} pending={false} size="sm" />
                ) : (
                  <Text size="sm" style={{ fontSize: JAPANESE_FONT.md }}>
                    {turn.text}
                  </Text>
                )}
                {turn.translation ? (
                  <Text size="xs" c="dimmed">
                    {turn.translation}
                  </Text>
                ) : null}
              </Box>
            ))}
            {task.explanation ? <MarkdownMessage content={task.explanation} compact /> : null}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function TaskCard({
  task,
  selected,
  onSelect,
  interactive,
  onSolveSpeech,
}: {
  task: TaskData;
  selected?: string | null;
  onSelect?: (answer: string) => void;
  interactive?: boolean;
  onSolveSpeech?: (taskId: string, result: SpeechSubmitResult) => void;
}) {
  const { t } = useTranslation();
  const isInteractive = interactive ?? task.status === "pending";
  if (task.type === "guess_meaning") {
    return (
      <GuessMeaningCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "guess_reading") {
    return (
      <GuessReadingCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "fill_particle") {
    return (
      <FillParticleCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "order_phrase") {
    return (
      <OrderPhraseCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "build_dialogue") {
    return (
      <BuildDialogueCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "listen_and_respond") {
    return (
      <ListenAndRespondCard
        task={task}
        selected={selected ?? null}
        onSelect={onSelect}
        interactive={isInteractive}
      />
    );
  }
  if (task.type === "writing_practice") {
    return (
      <WritingPracticeCard task={task} onSelect={onSelect} interactive={isInteractive} />
    );
  }
  if (task.type === "free_form_speech") {
    return <FreeSpeechCard task={task} onSolve={onSolveSpeech} />;
  }
  return (
    <Paper p="sm" radius="md" withBorder>
      <Text size="sm" c="dimmed">
        {t("tasks.unknownType", { type: task.type })}
      </Text>
    </Paper>
  );
}

function taskTypeLabel(type: string, t: TFunction) {
  if (type === "guess_meaning") return t("tasks.guessMeaning");
  if (type === "guess_reading") return t("tasks.guessReading");
  if (type === "fill_particle") return t("tasks.fillParticle");
  if (type === "order_phrase") return t("tasks.orderPhrase");
  if (type === "build_dialogue") return t("tasks.buildDialogue");
  if (type === "listen_and_respond") return t("tasks.listenAndRespond");
  if (type === "writing_practice") return t("tasks.writingPractice");
  if (type === "free_form_speech") return t("tasks.freeSpeech");
  return type;
}

function taskInstruction(type: string, t: TFunction) {
  if (type === "guess_meaning") return t("tasks.guessMeaningInstruction");
  if (type === "guess_reading") return t("tasks.guessReadingInstruction");
  if (type === "fill_particle") return t("tasks.fillParticleInstruction");
  if (type === "order_phrase") return t("tasks.orderPhraseInstruction");
  if (type === "build_dialogue") return t("tasks.buildDialogueInstruction");
  if (type === "listen_and_respond") return t("tasks.listenAndRespondInstruction");
  if (type === "writing_practice") return t("tasks.writingPracticeInstruction");
  if (type === "free_form_speech") return t("tasks.freeSpeechInstruction");
  return t("tasks.defaultInstruction");
}

function TaskBatchForm({
  items,
  answers,
  onAnswerChange,
  note,
  onNoteChange,
  onSubmit,
  submitting,
  onSolveSpeech,
}: {
  items: PendingTaskItem[];
  answers: Record<string, string>;
  onAnswerChange: (taskId: string, answer: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  onSolveSpeech?: (taskId: string, result: SpeechSubmitResult) => void;
}) {
  const { t } = useTranslation();
  const allAnswered = items.every(({ task }) => isTaskAnswered(task, answers[task.id]));
  // Speech-only batches don't use the batch submit endpoint.
  const hasBatchTasks = items.some(({ task }) => task.type !== "free_form_speech");

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {t("tasks.batchIntro")}
      </Text>
      {items.map(({ task, prompt }, index) => (
        <Stack key={task.id} gap="xs">
          {index > 0 && <Divider />}
          <Group gap="xs" justify="space-between">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              {taskTypeLabel(task.type, t)}
            </Text>
            <Text size="xs" c="dimmed">
              {t("tasks.taskProgress", { current: index + 1, total: items.length })}
            </Text>
          </Group>
          {prompt ? <MarkdownMessage content={prompt} /> : null}
          <Text size="xs" c="dimmed">
            {taskInstruction(task.type, t)}
          </Text>
          <Paper p="xs" radius="md" withBorder>
            <TaskCard
              task={task}
              selected={answers[task.id] ?? null}
              onSelect={(answer) => onAnswerChange(task.id, answer)}
              interactive
              onSolveSpeech={onSolveSpeech}
            />
          </Paper>
        </Stack>
      ))}
      <Textarea
        label={t("tasks.noteLabel")}
        placeholder={t("tasks.notePlaceholder")}
        value={note}
        onChange={(e) => onNoteChange(e.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={5}
      />
      {hasBatchTasks && (
        <Button fullWidth disabled={!allAnswered || submitting} loading={submitting} onClick={onSubmit}>
          {t("tasks.submitAnswers")}
        </Button>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectPendingTasks(messages: ChatEntry[]): TaskData[] {
  const seen = new Set<string>();
  const pending: TaskData[] = [];
  for (const m of messages) {
    for (const t of m.assignedTasks) {
      if (t.status === "pending" && !seen.has(t.id)) {
        seen.add(t.id);
        pending.push(t);
      }
    }
  }
  return pending;
}

function collectPendingTaskItems(messages: ChatEntry[]): PendingTaskItem[] {
  const seen = new Set<string>();
  const pending: PendingTaskItem[] = [];
  for (const m of messages) {
    for (const task of m.assignedTasks) {
      if (task.status === "pending" && !seen.has(task.id)) {
        seen.add(task.id);
        pending.push({ task, prompt: m.content });
      }
    }
  }
  return pending;
}

export {
  TaskBatchForm,
  TaskCard,
  collectPendingTaskItems,
  collectPendingTasks,
  isTaskAnswered,
  mergeTaskWithBatchResult,
  taskTypeLabel,
};
