"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { VocabularyItemCard } from "@/components/vocabulary/VocabularyItemCard";
import {
  createVocabularyItem,
  fetchVocabularyCategories,
  fetchVocabularyItem,
  fetchVocabularyItems,
} from "@/lib/vocabulary-api";
import type { VocabularyItem } from "@/lib/vocabulary-types";
import { TOKEN_KEY, readStoredAuth } from "@/lib/auth-storage";
import {
  categoryDescriptorForItem,
  isReservedCategoryDescriptor,
  isUuid,
  resolveCategoryFilter,
  vocabularyItemPath,
} from "@/lib/vocabulary-routes";
import { useTranslation } from "react-i18next";

export default function VocabularyCategoryItemsPage() {
  const { t } = useTranslation();
  const params = useParams<{ category_descriptor: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const descriptor = params.category_descriptor;

  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [search, setSearch] = useState("");
  const [addText, setAddText] = useState("");
  const [addCategoryId, setAddCategoryId] = useState<string | null>(null);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  useEffect(() => {
    if (!readStoredAuth().token) router.replace("/login");
  }, [router]);

  const { data: categories = [], isPending: categoriesPending } = useQuery({
    queryKey: ["vocabulary-categories", token],
    queryFn: () => fetchVocabularyCategories(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filter = useMemo(() => {
    if (categoriesPending) return undefined;
    return resolveCategoryFilter(descriptor, categories.map((c) => c.id));
  }, [categories, categoriesPending, descriptor]);

  const categoryExists = filter?.kind !== "category" || Boolean(categoryById[filter.categoryId]);

  const listParams = useMemo(() => {
    const p: { category?: string; q?: string; uncategorized?: boolean } = {};
    if (search.trim()) p.q = search.trim();
    if (filter?.kind === "uncategorized") p.uncategorized = true;
    if (filter?.kind === "category") p.category = filter.categoryId;
    return p;
  }, [filter, search]);

  const shouldFetchItems =
    Boolean(token) &&
    (filter?.kind === "all" ||
      filter?.kind === "uncategorized" ||
      (filter?.kind === "category" && categoryExists));

  const { data: items = [], isPending: itemsPending } = useQuery({
    queryKey: ["vocabulary-items", token, listParams],
    queryFn: () => fetchVocabularyItems(token!, listParams),
    enabled: shouldFetchItems,
    refetchInterval: (query) => {
      const data = query.state.data as VocabularyItem[] | undefined;
      return data?.some((i) => i.status === "pending") ? 3000 : false;
    },
    staleTime: 5_000,
  });

  const legacyItemId = useMemo(() => {
    if (categoriesPending || filter !== null) return null;
    if (isUuid(descriptor) && !isReservedCategoryDescriptor(descriptor)) return descriptor;
    return null;
  }, [categoriesPending, descriptor, filter]);

  const { data: legacyItem, isPending: legacyItemPending } = useQuery({
    queryKey: ["vocabulary-item", token, legacyItemId],
    queryFn: () => fetchVocabularyItem(token!, legacyItemId!),
    enabled: Boolean(token && legacyItemId),
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!legacyItem) return;
    router.replace(vocabularyItemPath(categoryDescriptorForItem(legacyItem), legacyItem.id));
  }, [legacyItem, router]);

  const addMutation = useMutation({
    mutationFn: () =>
      createVocabularyItem(token!, {
        text: addText.trim(),
        category_id: addCategoryId,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary-items", token] });
      setAddText("");
      setAddCategoryId(null);
      closeAdd();
      router.push(vocabularyItemPath(descriptor, data.item.id));
    },
  });

  function openAddModal() {
    if (filter?.kind === "category") {
      setAddCategoryId(filter.categoryId);
    } else if (filter?.kind === "uncategorized") {
      setAddCategoryId(null);
    }
    openAdd();
  }

  const pageTitle = useMemo(() => {
    if (filter?.kind === "all") return t("vocabulary.seeAll");
    if (filter?.kind === "uncategorized") return t("vocabulary.uncategorized");
    if (filter?.kind === "category") {
      return categoryById[filter.categoryId] ?? t("vocabulary.category");
    }
    return t("vocabulary.title");
  }, [categoryById, filter, t]);

  const showCategoryOnCards = filter?.kind === "all";

  if (!token || categoriesPending) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  if (legacyItemId && legacyItemPending) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  if (legacyItemId) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!filter || (filter.kind === "category" && !categoryExists)) {
    return (
      <Center h="100%">
        <Stack align="center" gap="sm">
          <Text c="dimmed">{t("vocabulary.categoryNotFound")}</Text>
          <Button variant="subtle" onClick={() => router.push("/vocabulary")}>
            {t("vocabulary.backToCategories")}
          </Button>
        </Stack>
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
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Tooltip label={t("vocabulary.backToCategories")}>
              <ActionIcon
                variant="subtle"
                onClick={() => router.push("/vocabulary")}
                aria-label={t("vocabulary.backToCategories")}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            </Tooltip>
            <Title order={3} lineClamp={1}>
              {pageTitle}
            </Title>
          </Group>
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder={t("vocabulary.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={{ base: "100%", sm: 200 }}
              size="sm"
            />
            <Button size="sm" leftSection={<IconPlus size={16} />} onClick={openAddModal}>
              {t("vocabulary.addText")}
            </Button>
          </Group>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} px={{ base: "md", sm: "lg" }} py="md">
        {itemsPending ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : items.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Text c="dimmed">{t("vocabulary.emptyTitle")}</Text>
              <Text size="sm" c="dimmed">
                {t("vocabulary.emptyHint")}
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
            {items.map((item) => (
              <VocabularyItemCard
                key={item.id}
                item={item}
                categoryName={item.category_id ? (categoryById[item.category_id] ?? null) : null}
                showCategory={showCategoryOnCards}
                onClick={() => router.push(vocabularyItemPath(descriptor, item.id))}
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
          {categories.length > 0 ? (
            <Select
              label={t("vocabulary.categoryOptional")}
              placeholder={t("common.none")}
              clearable
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={addCategoryId}
              onChange={setAddCategoryId}
            />
          ) : null}
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
    </Box>
  );
}
