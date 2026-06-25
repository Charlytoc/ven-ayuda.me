"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowLeft, IconMessageCircle, IconPencil, IconPlus, IconRefresh, IconTrash, IconVolume } from "@tabler/icons-react";
import { useDisclosure, useHover, useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { RubyText } from "@/components/RubyText";
import {
  deleteVocabularyItem,
  fetchVocabularyCategories,
  fetchVocabularyItem,
  generatePhrases,
  savePhrases,
  updateVocabularyItem,
} from "@/lib/vocabulary-api";
import { grammaticalCategoryLabel } from "@/lib/grammatical-category-label";
import type { GeneratedPhrase, ReadingEntry, VocabularyItem } from "@/lib/vocabulary-types";
import { TOKEN_KEY, USER_KEY, readStoredAuth, type AuthUser } from "@/lib/auth-storage";
import {
  categoryDescriptorForItem,
  vocabularyItemPath,
  vocabularyListPath,
} from "@/lib/vocabulary-routes";
import { useTranslation } from "react-i18next";
import { WritingCanvas } from "@/components/WritingCanvas";
import { VocabQAPanel } from "@/components/vocabulary/VocabQAPanel";
import { VocabularyPlayButton } from "@/components/vocabulary/VocabularyPlayButton";
import { HeaderIconAction } from "@/components/HeaderIconAction";
import { useVocabularyAudio } from "@/hooks/useVocabularyAudio";
import { spokenJapaneseFromSegments } from "@/lib/spoken-japanese";

type VocabAudio = ReturnType<typeof useVocabularyAudio>;

function ReadingBadge({ entry, color }: { entry: ReadingEntry; color: string }) {
  const hasExample = entry.segments.length > 0;

  const badge = (
    <Badge variant="light" color={color} size="sm" style={{ cursor: hasExample ? "default" : undefined }}>
      {entry.reading}
    </Badge>
  );

  if (!hasExample) return badge;

  return (
    <Tooltip
      label={
        <Stack gap={2} p={2}>
          <RubyText segments={entry.segments} size="sm" />
          {entry.meaning ? (
            <Text size="xs" c="dimmed">{entry.meaning}</Text>
          ) : null}
        </Stack>
      }
      withArrow
      color="dark"
    >
      {badge}
    </Tooltip>
  );
}

function SavedPhraseCard({
  phrase,
  playKey,
  audio,
}: {
  phrase: GeneratedPhrase;
  playKey: string;
  audio: VocabAudio;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { hovered, ref } = useHover();
  const spoken = spokenJapaneseFromSegments(phrase.segments);

  return (
    <Paper withBorder radius="sm" p="sm" bg="var(--mantine-color-default)">
      <Stack gap={4} ref={ref}>
        <Group gap={6} align="flex-start" wrap="nowrap">
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <RubyText segments={phrase.segments} size="sm" />
            <Text size="xs" c="dimmed">{phrase.meaning}</Text>
          </Stack>
          <VocabularyPlayButton
            playing={audio.isPlaying(playKey)}
            loading={audio.isLoading(playKey)}
            visible={hovered}
            onPlay={() => void audio.toggle(spoken, playKey)}
          />
        </Group>
        {phrase.explanation ? (
          <>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              w="fit-content"
              px={0}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? t("vocabulary.hideExplanation") : t("vocabulary.showExplanation")}
            </Button>
            <Collapse in={open}>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                {phrase.explanation}
              </Text>
            </Collapse>
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}

function PhraseCard({
  phrase,
  playKey,
  audio,
  onSave,
  saving,
  saved,
}: {
  phrase: GeneratedPhrase;
  playKey: string;
  audio: VocabAudio;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const { t } = useTranslation();
  const { hovered, ref } = useHover();
  const spoken = spokenJapaneseFromSegments(phrase.segments);

  return (
    <Paper withBorder radius="sm" p="sm" bg="var(--mantine-color-default)" ref={ref}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <RubyText segments={phrase.segments} size="sm" />
          <Text size="xs" c="dimmed">
            {phrase.meaning}
          </Text>
        </Stack>
        <Group gap={4} wrap="nowrap">
          <VocabularyPlayButton
            playing={audio.isPlaying(playKey)}
            loading={audio.isLoading(playKey)}
            visible={hovered}
            onPlay={() => void audio.toggle(spoken, playKey)}
          />
        {!saved ? (
          <ActionIcon
            size="sm"
            variant="subtle"
            loading={saving}
            onClick={onSave}
            aria-label={t("vocabulary.savePhrase")}
          >
            <IconPlus size={14} />
          </ActionIcon>
        ) : (
          <Badge variant="light" color="teal" size="xs">
            {t("vocabulary.saved")}
          </Badge>
        )}
        </Group>
      </Group>
    </Paper>
  );
}

function uniqueCharacters(text: string): string[] {
  const seen = new Set<string>();
  const chars: string[] = [];
  for (const ch of text) {
    if (!seen.has(ch) && ch.trim()) {
      seen.add(ch);
      chars.push(ch);
    }
  }
  return chars;
}

function WritingPracticeModal({
  opened,
  onClose,
  item,
}: {
  opened: boolean;
  onClose: () => void;
  item: { text: string; meaning: string };
}) {
  const { t } = useTranslation();
  const isCompact = useMediaQuery("(max-width: 62em)");
  const chars = uniqueCharacters(item.text);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    if (opened) setSessionKey((k) => k + 1);
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={false}
      fullScreen={isCompact}
      size={isCompact ? undefined : "lg"}
      title={t("vocabulary.practiceWritingModalTitle", { text: item.text })}
      styles={{
        body: { overflowY: "auto" },
      }}
    >
      <Stack gap="xl" pb="md">
        {chars.map((ch, idx) => (
          <Stack key={ch} gap="xs" align="center">
            <Text size="xs" c="dimmed">
              {t("vocabulary.practiceWritingCharacter", {
                index: idx + 1,
                total: chars.length,
              })}
            </Text>
            <WritingCanvas
              key={`${ch}-${sessionKey}`}
              character={ch}
              interactive
              showCharacter
              zoomable
            />
          </Stack>
        ))}
      </Stack>
    </Modal>
  );
}

export default function VocabularyItemPage() {
  const { t } = useTranslation();
  const params = useParams<{ category_descriptor: string; id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [user] = useLocalStorage<AuthUser | null>({
    key: USER_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [generatedPhrases, setGeneratedPhrases] = useState<GeneratedPhrase[]>([]);
  const [savedMeanings, setSavedMeanings] = useState<Set<string>>(new Set());
  const [savingMeaning, setSavingMeaning] = useState<string | null>(null);
  const [writingOpened, { open: openWriting, close: closeWriting }] = useDisclosure(false);
  const [qaOpened, { open: openQa, close: closeQa }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const isCompactLayout = useMediaQuery("(max-width: 74.9em)");
  const audio = useVocabularyAudio(token);
  const { hovered: wordHovered, ref: wordHoverRef } = useHover();

  useEffect(() => {
    if (!isCompactLayout) closeQa();
  }, [isCompactLayout, closeQa]);

  useEffect(() => {
    if (!readStoredAuth().token) router.replace("/login");
  }, [router]);

  const { data: item, isPending: itemPending } = useQuery<VocabularyItem>({
    queryKey: ["vocabulary-item", token, params.id],
    queryFn: () => fetchVocabularyItem(token!, params.id),
    enabled: Boolean(token),
    refetchInterval: (query) => {
      const i = query.state.data as VocabularyItem | undefined;
      return i?.status === "pending" ? 3000 : false;
    },
    staleTime: 5_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["vocabulary-categories", token],
    queryFn: () => fetchVocabularyCategories(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!item) return;
    const expected = categoryDescriptorForItem(item);
    if (params.category_descriptor !== expected) {
      router.replace(vocabularyItemPath(expected, item.id));
    }
  }, [item, params.category_descriptor, params.id, router]);

  // Sync local notes when item loads
  const itemId = item?.id;
  useEffect(() => {
    if (item && !notesDirty) setNotes(item.notes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    if (notesExpanded) notesTextareaRef.current?.focus();
  }, [notesExpanded]);

  // Sync saved phrases set when item loads/refetches
  useEffect(() => {
    if (!item) return;
    const phrases = item.extra?.phrases ?? [];
    setSavedMeanings(new Set(phrases.map((p) => p.meaning)));
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: (body: {
      notes?: string;
      category_id?: string | null;
      clear_category?: boolean;
      re_enrich?: boolean;
    }) => updateVocabularyItem(token!, params.id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["vocabulary-item", token, params.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      setNotesDirty(false);
      const nextDescriptor = categoryDescriptorForItem(updated);
      if (nextDescriptor !== params.category_descriptor) {
        router.replace(vocabularyItemPath(nextDescriptor, updated.id));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteVocabularyItem(token!, params.id),
    onSuccess: () => {
      closeDeleteModal();
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      router.push(vocabularyListPath(params.category_descriptor));
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generatePhrases(token!, params.id),
    onSuccess: (data) => setGeneratedPhrases(data.phrases),
  });

  const savedPhrases: GeneratedPhrase[] = useMemo(
    () => item?.extra?.phrases ?? [],
    [item],
  );

  async function handleSavePhrase(phrase: GeneratedPhrase) {
    setSavingMeaning(phrase.meaning);
    try {
      const allPhrases = [...savedPhrases, phrase];
      const updated = await savePhrases(token!, params.id, allPhrases);
      queryClient.setQueryData(["vocabulary-item", token, params.id], updated);
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      const phrases = updated.extra?.phrases ?? [];
      setSavedMeanings(new Set(phrases.map((p) => p.meaning)));
    } finally {
      setSavingMeaning(null);
    }
  }

  function handleCategoryChange(value: string | null) {
    if (value) {
      updateMutation.mutate({ category_id: value });
    } else {
      updateMutation.mutate({ clear_category: true });
    }
  }

  if (!token || itemPending) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!item) {
    return (
      <Center h="100%">
        <Stack align="center" gap="sm">
          <Text c="dimmed">{t("vocabulary.notFound")}</Text>
          <Button variant="subtle" onClick={() => router.push(vocabularyListPath(params.category_descriptor))}>
            {t("vocabulary.backToList")}
          </Button>
        </Stack>
      </Center>
    );
  }

  const grammaticalLabel = item.grammatical_category
    ? grammaticalCategoryLabel(t, item.grammatical_category)
    : null;

  const showWritingPractice =
    item.status === "enriched" && uniqueCharacters(item.text).length > 0;

  const itemPlayKey = `item-${item.id}`;
  const itemSpoken =
    item.segments.length > 0 ? spokenJapaneseFromSegments(item.segments) : item.text;

  function renderItemActions(compact: boolean) {
    if (compact) {
      return (
        <>
          <HeaderIconAction
            label={t("chat.audio.playSegment")}
            icon={<IconVolume size={16} />}
            loading={audio.isLoading(itemPlayKey)}
            onClick={() => void audio.toggle(itemSpoken, itemPlayKey)}
          />
          {showWritingPractice ? (
            <HeaderIconAction
              label={t("vocabulary.practiceWriting")}
              icon={<IconPencil size={16} />}
              onClick={openWriting}
            />
          ) : null}
          {token && user ? (
            <HeaderIconAction
              label={t("vocabulary.qa.title")}
              icon={<IconMessageCircle size={16} />}
              onClick={openQa}
            />
          ) : null}
          <HeaderIconAction
            label={t("vocabulary.reEnrich")}
            icon={<IconRefresh size={16} />}
            variant="subtle"
            loading={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ re_enrich: true })}
          />
          <HeaderIconAction
            label={t("vocabulary.deleteWord")}
            icon={<IconTrash size={16} />}
            variant="subtle"
            color="red"
            loading={deleteMutation.isPending}
            onClick={openDeleteModal}
          />
        </>
      );
    }

    return (
      <>
        <Button
          variant="subtle"
          size="xs"
          loading={audio.isLoading(itemPlayKey)}
          onClick={() => void audio.toggle(itemSpoken, itemPlayKey)}
        >
          {audio.isPlaying(itemPlayKey) ? t("chat.audio.stop") : t("chat.audio.listen")}
        </Button>
        {showWritingPractice ? (
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPencil size={14} />}
            onClick={openWriting}
          >
            {t("vocabulary.practiceWriting")}
          </Button>
        ) : null}
        <Button
          variant="subtle"
          size="xs"
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate({ re_enrich: true })}
        >
          {t("vocabulary.reEnrich")}
        </Button>
        <Button
          color="red"
          variant="subtle"
          size="xs"
          loading={deleteMutation.isPending}
          onClick={openDeleteModal}
        >
          {t("vocabulary.deleteWord")}
        </Button>
      </>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {item && (
        <WritingPracticeModal
          opened={writingOpened}
          onClose={closeWriting}
          item={item}
        />
      )}
      {token && user ? (
        <Modal
          opened={qaOpened}
          onClose={closeQa}
          fullScreen
          title={t("vocabulary.qa.titleAbout", { text: item.text })}
          styles={{
            title: { lineClamp: 2 },
            content: { display: "flex", flexDirection: "column" },
            body: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            },
          }}
        >
          <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <VocabQAPanel
              itemId={params.id}
              token={token}
              userId={user.id}
              itemText={item.text}
              alwaysOpen
              showTitle={false}
            />
          </Box>
        </Modal>
      ) : null}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={t("vocabulary.deleteWordModalTitle")}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {t("vocabulary.deleteWordModalBody", { text: item.text })}
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeDeleteModal}>
              {t("common.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {t("vocabulary.deleteWord")}
            </Button>
          </Group>
        </Stack>
      </Modal>
      {/* Header */}
      <Box
        px={{ base: "md", sm: "lg" }}
        py="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-default)",
          flexShrink: 0,
        }}
      >
        <Stack gap="xs">
          <Group gap="sm" wrap="nowrap" align="center">
            <Tooltip label={t("vocabulary.backToList")}>
              <ActionIcon
                variant="subtle"
                onClick={() => router.push(vocabularyListPath(params.category_descriptor))}
                aria-label={t("vocabulary.backToList")}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            </Tooltip>
            <Title order={4} style={{ flex: 1, minWidth: 0 }} lineClamp={1}>
              {t("vocabulary.itemTitle")}
            </Title>
            <Group gap="xs" wrap="nowrap" visibleFrom="lg">
              {renderItemActions(false)}
            </Group>
            <Group gap={4} wrap="nowrap" hiddenFrom="lg">
              {renderItemActions(true)}
            </Group>
          </Group>
        </Stack>
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <SimpleGrid
          cols={{ base: 1, lg: 2 }}
          style={{ flex: 1, minHeight: 0 }}
          styles={{
            root: {
              alignItems: "start",
            },
          }}
        >
        {/* Left column — word details */}
        <Box px="lg" py="md" style={{ overflowY: "auto", height: "100%" }}>
        <Stack gap="lg" maw={560}>
          {/* Word display */}
          <Stack gap="xs" ref={wordHoverRef}>
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Box style={{ flex: 1, minWidth: 0 }}>
                {item.status === "enriched" && item.segments.length > 0 ? (
                  <RubyText segments={item.segments} size="xl" />
                ) : (
                  <Text fw={700} style={{ fontSize: 40 }}>
                    {item.text}
                  </Text>
                )}
              </Box>
              <VocabularyPlayButton
                playing={audio.isPlaying(itemPlayKey)}
                loading={audio.isLoading(itemPlayKey)}
                visible={wordHovered}
                onPlay={() => void audio.toggle(itemSpoken, itemPlayKey)}
              />
            </Group>

            {audio.error ? (
              <Text size="xs" c="red">
                {audio.error}
              </Text>
            ) : null}

            <Group gap="xs" wrap="wrap">
              {item.status === "pending" ? (
                <Group gap="xs">
                  <Loader size="xs" />
                  <Text size="xs" c="dimmed">{t("vocabulary.enriching")}</Text>
                </Group>
              ) : null}
              {item.status === "failed" ? (
                <Badge color="red" size="sm" variant="light">{t("vocabulary.failedToEnrich")}</Badge>
              ) : null}
              {grammaticalLabel ? (
                <Badge variant="light" size="sm">{grammaticalLabel}</Badge>
              ) : null}
            </Group>

            {item.meaning ? (
              <Text size="md" c="dimmed">
                {item.meaning}
              </Text>
            ) : null}

            {item.extra?.source_text ? (
              <Text size="xs" c="dimmed">
                {t("vocabulary.translatedFrom", { text: item.extra.source_text })}
              </Text>
            ) : null}

            {item.extra?.jlpt ? (
              <Badge variant="outline" size="sm" color="gray" w="fit-content">
                {t("vocabulary.jlpt", { level: item.extra.jlpt })}
              </Badge>
            ) : null}
          </Stack>

          {item.extra?.explanation ? (
            <>
              <Divider />
              <Stack gap="xs">
                <Text size="sm" fw={500}>{t("vocabulary.explanation")}</Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
                  {item.extra.explanation}
                </Text>
              </Stack>
            </>
          ) : null}

          {(item.extra?.onyomi?.length || item.extra?.kunyomi?.length) ? (
            <>
              <Divider />
              <Stack gap="xs">
                <Text size="sm" fw={500}>{t("vocabulary.readings")}</Text>
                {item.extra.onyomi?.length ? (
                  <Group gap="xs" align="center">
                    <Tooltip
                      label={t("vocabulary.onyomiTooltip")}
                      multiline
                      w={240}
                      withArrow
                    >
                      <Text size="xs" c="dimmed" w={64} style={{ cursor: "default", textDecoration: "underline dotted" }}>
                        {t("vocabulary.onyomiLabel")}
                      </Text>
                    </Tooltip>
                    <Group gap={4}>
                      {item.extra.onyomi.map((r) => (
                        <ReadingBadge key={r.reading} entry={r} color="blue" />
                      ))}
                    </Group>
                  </Group>
                ) : null}
                {item.extra.kunyomi?.length ? (
                  <Group gap="xs" align="center">
                    <Tooltip
                      label={t("vocabulary.kunyomiTooltip")}
                      multiline
                      w={260}
                      withArrow
                    >
                      <Text size="xs" c="dimmed" w={64} style={{ cursor: "default", textDecoration: "underline dotted" }}>
                        {t("vocabulary.kunyomiLabel")}
                      </Text>
                    </Tooltip>
                    <Group gap={4}>
                      {item.extra.kunyomi.map((r) => (
                        <ReadingBadge key={r.reading} entry={r} color="grape" />
                      ))}
                    </Group>
                  </Group>
                ) : null}
              </Stack>
            </>
          ) : null}

          <Divider />

          {/* Category */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>{t("vocabulary.category")}</Text>
            <Select
              placeholder={t("common.none")}
              clearable
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={item.category_id ?? null}
              onChange={handleCategoryChange}
              disabled={updateMutation.isPending}
              w={220}
            />
          </Stack>

          {/* Notes */}
          {notesExpanded || notesDirty || Boolean(item.notes?.trim()) ? (
            <Stack gap="xs">
              <Text size="sm" fw={500}>{t("vocabulary.notes")}</Text>
              <Textarea
                ref={notesTextareaRef}
                placeholder={t("vocabulary.notesPlaceholder")}
                value={notes}
                onChange={(e) => {
                  setNotes(e.currentTarget.value);
                  setNotesDirty(true);
                }}
                autosize
                minRows={2}
              />
              {notesDirty ? (
                <Group>
                  <Button
                    size="xs"
                    variant="light"
                    loading={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate(
                        { notes },
                        {
                          onSuccess: (updated) => {
                            if (!updated.notes?.trim()) setNotesExpanded(false);
                          },
                        },
                      )
                    }
                  >
                    {t("vocabulary.saveNotes")}
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setNotes(item.notes);
                      setNotesDirty(false);
                      if (!item.notes?.trim()) setNotesExpanded(false);
                    }}
                  >
                    {t("common.discard")}
                  </Button>
                </Group>
              ) : null}
            </Stack>
          ) : (
            <Group gap="xs">
              <Text size="sm" fw={500}>{t("vocabulary.notes")}</Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                aria-label={t("vocabulary.addNotes")}
                onClick={() => setNotesExpanded(true)}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          )}

          <Divider />

          {/* Phrases */}
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={500}>{t("vocabulary.examplePhrases")}</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconRefresh size={14} />}
                loading={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                {t("vocabulary.generate")}
              </Button>
            </Group>

            {generatedPhrases.length > 0 ? (
              <Stack gap="xs">
                <Text size="xs" c="dimmed">{t("vocabulary.clickToKeepPhrase")}</Text>
                {generatedPhrases.map((p, i) => (
                  <PhraseCard
                    key={i}
                    phrase={p}
                    playKey={`generated-${i}-${p.meaning}`}
                    audio={audio}
                    onSave={() => handleSavePhrase(p)}
                    saving={savingMeaning === p.meaning}
                    saved={savedMeanings.has(p.meaning)}
                  />
                ))}
              </Stack>
            ) : null}

            {savedPhrases.length > 0 ? (
              <Stack gap="xs">
                <Text size="xs" c="dimmed">{t("vocabulary.savedPhrases")}</Text>
                {savedPhrases.map((p, i) => (
                  <SavedPhraseCard
                    key={i}
                    phrase={p}
                    playKey={`saved-${i}-${p.meaning}`}
                    audio={audio}
                  />
                ))}
              </Stack>
            ) : null}

            {savedPhrases.length === 0 && generatedPhrases.length === 0 && !generateMutation.isPending ? (
              <Text size="xs" c="dimmed">
                {t("vocabulary.noPhrasesYet")}
              </Text>
            ) : null}
          </Stack>

        </Stack>
        </Box>

        {/* Right column — Q&A panel (desktop only) */}
        {token && user ? (
          <Box
            visibleFrom="lg"
            px="lg"
            py="md"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <VocabQAPanel
              itemId={params.id}
              token={token}
              userId={user.id}
              itemText={item.text}
              alwaysOpen
            />
          </Box>
        ) : null}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
