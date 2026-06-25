"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconLayoutGrid, IconPlus } from "@tabler/icons-react";
import { VocabularyCategoryCard } from "@/components/vocabulary/VocabularyCategoryCard";
import { pickCategoryColor } from "@/lib/category-color";
import {
  createVocabularyCategory,
  createVocabularyItem,
  dismissVocabOrganize,
  fetchVocabOrganizeStatus,
  fetchVocabularyCategories,
  fetchVocabularyItems,
  startVocabOrganize,
} from "@/lib/vocabulary-api";
import { TOKEN_KEY, readStoredAuth } from "@/lib/auth-storage";
import {
  VOCAB_ALL,
  VOCAB_UNCATEGORIZED,
  vocabularyItemPath,
  vocabularyListPath,
} from "@/lib/vocabulary-routes";
import { useTranslation } from "react-i18next";

export default function VocabularyCategoriesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [addText, setAddText] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [categoryOpened, { open: openCategory, close: closeCategory }] = useDisclosure(false);
  const [organizeOpened, { open: openOrganize, close: closeOrganize }] = useDisclosure(false);
  const [organizeAllowCreate, setOrganizeAllowCreate] = useState(true);
  const [organizeHint, setOrganizeHint] = useState("");

  useEffect(() => {
    if (!readStoredAuth().token) router.replace("/login");
  }, [router]);

  const { data: categories = [], isPending: categoriesPending } = useQuery({
    queryKey: ["vocabulary-categories", token],
    queryFn: () => fetchVocabularyCategories(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["vocabulary-items", token, "all-counts"],
    queryFn: () => fetchVocabularyItems(token!),
    enabled: Boolean(token),
    staleTime: 5_000,
  });

  const { data: uncategorizedItems = [] } = useQuery({
    queryKey: ["vocabulary-items", token, "uncategorized"],
    queryFn: () => fetchVocabularyItems(token!, { uncategorized: true }),
    enabled: Boolean(token),
    staleTime: 5_000,
  });

  const { data: organizeStatus } = useQuery({
    queryKey: ["vocabulary-organize-status", token],
    queryFn: () => fetchVocabOrganizeStatus(token!),
    enabled: Boolean(token),
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 2000 : false,
    staleTime: 2_000,
  });

  const organizeRunning = organizeStatus?.status === "running";
  const prevOrganizeStatusRef = useRef<string | undefined>(undefined);
  const [organizeBanner, setOrganizeBanner] = useState<{
    status: "completed" | "error";
    summary: string;
  } | null>(null);

  useEffect(() => {
    const prev = prevOrganizeStatusRef.current;
    const curr = organizeStatus?.status;
    if (
      prev === "running" &&
      (curr === "completed" || curr === "error") &&
      organizeStatus?.summary
    ) {
      setOrganizeBanner({ status: curr, summary: organizeStatus.summary });
    }
    prevOrganizeStatusRef.current = curr;
  }, [organizeStatus?.status, organizeStatus?.summary]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allItems) {
      if (item.category_id) {
        counts[item.category_id] = (counts[item.category_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [allItems]);

  const addMutation = useMutation({
    mutationFn: () => createVocabularyItem(token!, { text: addText.trim() }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      setAddText("");
      closeAdd();
      const descriptor = data.item.category_id ?? VOCAB_UNCATEGORIZED;
      router.push(vocabularyItemPath(descriptor, data.item.id));
    },
  });

  const categoryMutation = useMutation({
    mutationFn: () =>
      createVocabularyCategory(token!, {
        name: newCategoryName.trim(),
        color: pickCategoryColor(newCategoryName.trim()),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-categories", token] });
      setNewCategoryName("");
      closeCategory();
    },
  });

  const organizeMutation = useMutation({
    mutationFn: () =>
      startVocabOrganize(token!, {
        allow_create_categories: organizeAllowCreate,
        hint: organizeHint.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-organize-status", token] });
      closeOrganize();
    },
  });

  const organizeStartBlocked =
    uncategorizedItems.length === 0 ||
    organizeRunning ||
    (!organizeAllowCreate && categories.length === 0);

  async function dismissOrganizeBanner() {
    setOrganizeBanner(null);
    if (!token) return;
    await dismissVocabOrganize(token);
    void queryClient.setQueryData(["vocabulary-organize-status", token], {
      status: "idle",
      summary: "",
      remaining_uncategorized: uncategorizedItems.length,
    });
  }

  useEffect(() => {
    if (organizeStatus?.status === "completed" || organizeStatus?.status === "error") {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-categories", token] });
    }
  }, [organizeStatus?.status, queryClient, token]);

  if (!token) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        px={{ base: "md", sm: "lg" }}
        py="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-default)",
          flexShrink: 0,
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Title order={3}>{t("vocabulary.title")}</Title>
            <Text size="sm" c="dimmed">
              {t("vocabulary.browseCategories")}
            </Text>
          </Stack>
          <Group gap="sm" wrap="wrap">
            <Button size="sm" variant="light" onClick={openCategory}>
              {t("vocabulary.addCategory")}
            </Button>
            <Button
              size="sm"
              variant="light"
              leftSection={<IconLayoutGrid size={16} />}
              onClick={openOrganize}
              disabled={uncategorizedItems.length === 0 || organizeRunning}
              loading={organizeRunning}
            >
              {organizeRunning ? t("vocabulary.organizeRunning") : t("vocabulary.organize")}
            </Button>
            <Button size="sm" leftSection={<IconPlus size={16} />} onClick={openAdd}>
              {t("vocabulary.addText")}
            </Button>
          </Group>
        </Group>
      </Box>

      {organizeBanner?.status === "completed" ? (
        <Alert
          mx={{ base: "md", sm: "lg" }}
          mt="md"
          color="green"
          title={t("vocabulary.organizeDone")}
          withCloseButton
          onClose={() => void dismissOrganizeBanner()}
        >
          {organizeBanner.summary}
        </Alert>
      ) : null}
      {organizeBanner?.status === "error" ? (
        <Alert
          mx={{ base: "md", sm: "lg" }}
          mt="md"
          color="red"
          title={t("vocabulary.organizeError")}
          withCloseButton
          onClose={() => void dismissOrganizeBanner()}
        >
          {organizeBanner.summary}
        </Alert>
      ) : null}

      <ScrollArea style={{ flex: 1 }} px={{ base: "md", sm: "lg" }} py="md">
        {categoriesPending ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
            <VocabularyCategoryCard
              title={t("vocabulary.seeAll")}
              count={allItems.length}
              variant="all"
              onClick={() => router.push(vocabularyListPath(VOCAB_ALL))}
            />
            <VocabularyCategoryCard
              title={t("vocabulary.uncategorized")}
              count={uncategorizedItems.length}
              variant="uncategorized"
              onClick={() => router.push(vocabularyListPath(VOCAB_UNCATEGORIZED))}
            />
            {categories.map((category) => (
              <VocabularyCategoryCard
                key={category.id}
                title={category.name}
                count={countsByCategory[category.id] ?? 0}
                variant="category"
                accentColor={category.color}
                onClick={() => router.push(vocabularyListPath(category.id))}
              />
            ))}
          </SimpleGrid>
        )}
      </ScrollArea>

      <Modal opened={addOpened} onClose={closeAdd} title={t("vocabulary.addModalTitle")} centered>
        <Stack gap="sm">
          <TextInput
            label={t("vocabulary.textLabel")}
            placeholder={t("vocabulary.textPlaceholder")}
            value={addText}
            onChange={(e) => setAddText(e.currentTarget.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && addText.trim()) addMutation.mutate();
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeAdd}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={addMutation.isPending}
              disabled={!addText.trim()}
              onClick={() => addMutation.mutate()}
            >
              {t("common.add")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={categoryOpened} onClose={closeCategory} title={t("vocabulary.newCategoryTitle")} centered>
        <Stack gap="sm">
          <TextInput
            label={t("common.name")}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.currentTarget.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCategoryName.trim()) categoryMutation.mutate();
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCategory}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={categoryMutation.isPending}
              disabled={!newCategoryName.trim()}
              onClick={() => categoryMutation.mutate()}
            >
              {t("common.create")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={organizeOpened}
        onClose={closeOrganize}
        title={t("vocabulary.organizeModalTitle")}
        centered
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {t("vocabulary.organizeModalDescription")}
          </Text>
          <Text size="sm">
            {uncategorizedItems.length === 0
              ? t("vocabulary.organizeNoUncategorized")
              : t("vocabulary.organizeUncategorizedCount", { count: uncategorizedItems.length })}
          </Text>
          <Checkbox
            label={t("vocabulary.organizeAllowCreateCategories")}
            checked={organizeAllowCreate}
            onChange={(e) => setOrganizeAllowCreate(e.currentTarget.checked)}
          />
          <Textarea
            label={t("vocabulary.organizeHintLabel")}
            placeholder={t("vocabulary.organizeHintPlaceholder")}
            value={organizeHint}
            onChange={(e) => setOrganizeHint(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeOrganize}>
              {t("common.cancel")}
            </Button>
            <Button
              loading={organizeMutation.isPending}
              disabled={organizeStartBlocked}
              onClick={() => organizeMutation.mutate()}
            >
              {t("vocabulary.organizeStart")}
            </Button>
          </Group>
          {!organizeAllowCreate && categories.length === 0 ? (
            <Text size="xs" c="red">
              {t("vocabulary.organizeNoCategoriesError")}
            </Text>
          ) : null}
          {organizeMutation.isError ? (
            <Text size="xs" c="red">
              {organizeMutation.error.message}
            </Text>
          ) : null}
        </Stack>
      </Modal>
    </Box>
  );
}
