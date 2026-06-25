"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlayerStopFilled, IconVolume } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  fetchUserSettings,
  fetchVoices,
  patchActiveOrganization,
  patchCurrentUser,
  putUserSettings,
  type VoiceOption,
} from "@/lib/account-settings";
import {
  TOKEN_KEY,
  USER_KEY,
  parseOrganization,
  readStoredAuth,
  type AuthUser,
} from "@/lib/auth-storage";
import { CHAT_AUTO_SCROLL_KEY } from "@/app/(app)/chat/page";
import { useTranslation } from "react-i18next";
import { useVoicePreview, type VoicePreviewRole } from "@/hooks/useVoicePreview";

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useLocalStorage<AuthUser | null>({
    key: USER_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [token] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [autoScroll, setAutoScroll] = useLocalStorage<boolean>({
    key: CHAT_AUTO_SCROLL_KEY,
    defaultValue: true,
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    if (!readStoredAuth().user) {
      router.replace("/login");
    }
  }, [router]);

  const { data: me, isPending: mePending } = useQuery({
    queryKey: ["me", token],
    queryFn: () => fetchCurrentUser(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const { data: userSettings, isPending: settingsPending } = useQuery({
    queryKey: ["user-settings", token],
    queryFn: () => fetchUserSettings(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const { data: voiceCatalog } = useQuery({
    queryKey: ["tts-voices", token],
    queryFn: () => fetchVoices(token!),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });

  const displayUser = me ?? user ?? readStoredAuth().user;
  const org = displayUser ? parseOrganization(displayUser.organization) : null;

  const userMutation = useMutation({
    mutationFn: async (vars: { first_name: string; last_name: string }) => {
      if (!token) throw new Error(t("settings.notSignedIn"));
      return patchCurrentUser(token, {
        first_name: vars.first_name.trim(),
        last_name: vars.last_name.trim(),
      });
    },
    onSuccess: (updated) => {
      setUser(updated);
      void queryClient.invalidateQueries({ queryKey: ["me", token] });
      notifications.show({ message: t("settings.savedProfile"), color: "teal" });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: "red" });
    },
  });

  const languageMutation = useMutation({
    mutationFn: async (native_language: string) => {
      if (!token) throw new Error(t("settings.notSignedIn"));
      return putUserSettings(token, { native_language });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-settings", token] });
      notifications.show({ message: t("settings.savedLanguage"), color: "teal" });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: "red" });
    },
  });

  const voiceMutation = useMutation({
    mutationFn: async (vars: { narrator_voice: string; japanese_voice: string }) => {
      if (!token) throw new Error(t("settings.notSignedIn"));
      return putUserSettings(token, {
        native_language: userSettings?.native_language || "en",
        extra: {
          ...(userSettings?.extra ?? {}),
          narrator_voice: vars.narrator_voice,
          japanese_voice: vars.japanese_voice,
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-settings", token] });
      notifications.show({ message: t("settings.savedVoices"), color: "teal" });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: "red" });
    },
  });

  const orgMutation = useMutation({
    mutationFn: async (vars: { name: string; domain: string }) => {
      if (!token) throw new Error(t("settings.notSignedIn"));
      return patchActiveOrganization(token, {
        name: vars.name.trim(),
        domain: vars.domain.trim(),
      });
    },
    onSuccess: (updatedOrg) => {
      const prev = readStoredAuth().user;
      if (prev) {
        setUser({
          ...prev,
          organization: {
            id: String(updatedOrg.id),
            name: updatedOrg.name,
            domain: updatedOrg.domain,
            status: updatedOrg.status,
          },
        });
      }
      notifications.show({ message: t("settings.savedOrganization"), color: "teal" });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: "red" });
    },
  });

  if (!displayUser) {
    return (
      <Container size="sm" py="xl" style={{ flex: 1 }}>
        <Loader size="sm" />
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl" style={{ flex: 1 }}>
      <Stack gap="lg">
        <div>
          <Title order={2}>{t("settings.title")}</Title>
          <Text size="sm" c="dimmed" mt={4}>
            {t("settings.subtitle")}
          </Text>
        </div>

        <Paper withBorder radius="md" p="md" component="form">
          <Title order={4} mb="md">
            {t("settings.user")}
          </Title>
          {mePending ? (
            <Loader size="sm" />
          ) : (
            <UserSettingsForm
              key={`${displayUser.email}-${displayUser.first_name ?? ""}-${displayUser.last_name ?? ""}`}
              email={displayUser.email}
              firstName={displayUser.first_name ?? ""}
              lastName={displayUser.last_name ?? ""}
              loading={userMutation.isPending}
              error={userMutation.error}
              onSave={(first_name, last_name) => userMutation.mutate({ first_name, last_name })}
            />
          )}
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Title order={4} mb="md">
            {t("settings.learning")}
          </Title>
          {settingsPending ? (
            <Loader size="sm" />
          ) : (
            <LearningSettingsForm
              key={userSettings?.native_language ?? "unset"}
              nativeLanguage={userSettings?.native_language ?? ""}
              loading={languageMutation.isPending}
              error={languageMutation.error}
              onSave={(native_language) => languageMutation.mutate(native_language)}
            />
          )}
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Title order={4} mb="md">
            {t("settings.voice")}
          </Title>
          {settingsPending || !voiceCatalog ? (
            <Loader size="sm" />
          ) : (
            <VoiceSettingsForm
              key={`${userSettings?.extra?.narrator_voice ?? ""}-${userSettings?.extra?.japanese_voice ?? ""}`}
              token={token}
              voices={voiceCatalog.voices}
              narratorVoice={
                (userSettings?.extra?.narrator_voice as string | undefined) ??
                voiceCatalog.default_narrator_voice
              }
              japaneseVoice={
                (userSettings?.extra?.japanese_voice as string | undefined) ??
                voiceCatalog.default_japanese_voice
              }
              loading={voiceMutation.isPending}
              error={voiceMutation.error}
              onSave={(narrator_voice, japanese_voice) =>
                voiceMutation.mutate({ narrator_voice, japanese_voice })
              }
            />
          )}
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Title order={4} mb="md">
            {t("settings.preferences")}
          </Title>
          <Switch
            checked={autoScroll ?? true}
            onChange={(e) => setAutoScroll(e.currentTarget.checked)}
            label={t("settings.autoScroll")}
            description={t("settings.autoScrollHint")}
          />
        </Paper>

        {org && org.name != null && org.domain != null ? (
          <Paper withBorder radius="md" p="md" component="form">
            <Title order={4} mb="md">
              {t("settings.organization")}
            </Title>
            <OrgSettingsForm
              key={`${org.id}-${org.name}-${org.domain}`}
              name={org.name}
              domain={org.domain}
              loading={orgMutation.isPending}
              error={orgMutation.error}
              onSave={(name, domain) => orgMutation.mutate({ name, domain })}
            />
          </Paper>
        ) : null}
      </Stack>
    </Container>
  );
}

function UserSettingsForm({
  email,
  firstName,
  lastName,
  loading,
  error,
  onSave,
}: {
  email: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  error: Error | null;
  onSave: (first: string, last: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <TextInput
        label={t("common.email")}
        value={email}
        disabled
        description={t("settings.emailDisabledHint")}
      />
      <TextInput label={t("auth.firstName")} name="first_name" defaultValue={firstName} />
      <TextInput label={t("auth.lastName")} name="last_name" defaultValue={lastName} />
      {error ? (
        <Text size="sm" c="red">
          {error.message}
        </Text>
      ) : null}
      <Group justify="flex-end">
        <Button
          type="submit"
          loading={loading}
          onClick={(e) => {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (!form) return;
            const fd = new FormData(form);
            onSave(String(fd.get("first_name") ?? ""), String(fd.get("last_name") ?? ""));
          }}
        >
          {t("settings.saveProfile")}
        </Button>
      </Group>
    </Stack>
  );
}

const NATIVE_LANGUAGE_CODES = ["en", "es", "pt", "fr", "de", "it", "ja"] as const;

function LearningSettingsForm({
  nativeLanguage,
  loading,
  error,
  onSave,
}: {
  nativeLanguage: string;
  loading: boolean;
  error: Error | null;
  onSave: (lang: string) => void;
}) {
  const { t } = useTranslation();
  const [lang, setLang] = useState(nativeLanguage || "en");
  const nativeLanguageOptions = NATIVE_LANGUAGE_CODES.map((code) => ({
    value: code,
    label: t(`settings.languages.${code}`),
  }));

  return (
    <Stack gap="sm">
      <Select
        label={t("settings.nativeLanguage")}
        description={t("settings.nativeLanguageHint")}
        data={nativeLanguageOptions}
        value={lang}
        onChange={(v) => setLang(v ?? "en")}
      />
      {error ? (
        <Text size="sm" c="red">
          {error.message}
        </Text>
      ) : null}
      <Group justify="flex-end">
        <Button loading={loading} onClick={() => onSave(lang)}>
          {t("settings.saveLanguage")}
        </Button>
      </Group>
    </Stack>
  );
}

function voiceShortName(label: string): string {
  return label.split(" — ")[0]?.trim() || label;
}

function VoicePreviewBar({
  voices,
  role,
  loadingKey,
  playingKey,
  onPreview,
}: {
  voices: VoiceOption[];
  role: VoicePreviewRole;
  loadingKey: string | null;
  playingKey: string | null;
  onPreview: (voice: string, role: VoicePreviewRole) => void;
}) {
  const { t } = useTranslation();

  return (
    <Group gap={6} wrap="wrap" align="center">
      <Text size="xs" c="dimmed">
        {t("settings.previewVoices")}
      </Text>
      {voices.map((voice) => {
        const key = `${role}:${voice.id}`;
        const shortName = voiceShortName(voice.label);
        const isLoading = loadingKey === key;
        const isPlaying = playingKey === key;
        const label = isPlaying
          ? t("settings.stopVoice", { name: shortName })
          : t("settings.listenVoice", { name: shortName });

        return (
          <Tooltip key={voice.id} label={label}>
            <Button
              variant={isPlaying ? "light" : "default"}
              size="compact-xs"
              leftSection={
                isLoading ? (
                  <Loader size={12} />
                ) : isPlaying ? (
                  <IconPlayerStopFilled size={14} />
                ) : (
                  <IconVolume size={14} />
                )
              }
              onClick={() => onPreview(voice.id, role)}
              aria-label={label}
            >
              {shortName}
            </Button>
          </Tooltip>
        );
      })}
    </Group>
  );
}

function VoicePicker({
  label,
  description,
  voices,
  value,
  onChange,
  role,
  preview,
}: {
  label: string;
  description: string;
  voices: VoiceOption[];
  value: string;
  onChange: (value: string) => void;
  role: VoicePreviewRole;
  preview: ReturnType<typeof useVoicePreview>;
}) {
  const { t } = useTranslation();
  const options = voices.map((v) => ({ value: v.id, label: v.label }));
  const selected = voices.find((v) => v.id === value);
  const selectedName = selected ? voiceShortName(selected.label) : "";
  const selectedKey = `${role}:${value}`;
  const selectedLoading = preview.loadingKey === selectedKey;
  const selectedPlaying = preview.playingKey === selectedKey;
  const selectedListenLabel = selectedPlaying
    ? t("settings.stopVoice", { name: selectedName })
    : t("settings.listenVoice", { name: selectedName });

  return (
    <Stack gap={6}>
      <Group align="flex-end" wrap="nowrap" gap="xs">
        <Select
          flex={1}
          label={label}
          description={description}
          data={options}
          value={value}
          onChange={(v) => onChange(v ?? value)}
        />
        <Tooltip label={selectedListenLabel}>
          <ActionIcon
            variant={selectedPlaying ? "light" : "default"}
            size="lg"
            mb={2}
            aria-label={selectedListenLabel}
            loading={selectedLoading}
            onClick={() => void preview.togglePreview(value, role)}
          >
            {selectedPlaying ? <IconPlayerStopFilled size={18} /> : <IconVolume size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
      <VoicePreviewBar
        voices={voices}
        role={role}
        loadingKey={preview.loadingKey}
        playingKey={preview.playingKey}
        onPreview={(voice, previewRole) => void preview.togglePreview(voice, previewRole)}
      />
    </Stack>
  );
}

function VoiceSettingsForm({
  token,
  voices,
  narratorVoice,
  japaneseVoice,
  loading,
  error,
  onSave,
}: {
  token: string | null;
  voices: VoiceOption[];
  narratorVoice: string;
  japaneseVoice: string;
  loading: boolean;
  error: Error | null;
  onSave: (narrator: string, japanese: string) => void;
}) {
  const { t } = useTranslation();
  const [narrator, setNarrator] = useState(narratorVoice);
  const [japanese, setJapanese] = useState(japaneseVoice);
  const preview = useVoicePreview(token);

  return (
    <Stack gap="sm">
      <VoicePicker
        label={t("settings.narratorVoice")}
        description={t("settings.narratorVoiceHint")}
        voices={voices}
        value={narrator}
        onChange={setNarrator}
        role="narrator"
        preview={preview}
      />
      <VoicePicker
        label={t("settings.japaneseVoice")}
        description={t("settings.japaneseVoiceHint")}
        voices={voices}
        value={japanese}
        onChange={setJapanese}
        role="japanese"
        preview={preview}
      />
      {preview.error ? (
        <Text size="sm" c="red">
          {preview.error}
        </Text>
      ) : null}
      {error ? (
        <Text size="sm" c="red">
          {error.message}
        </Text>
      ) : null}
      <Group justify="flex-end">
        <Button loading={loading} onClick={() => onSave(narrator, japanese)}>
          {t("settings.saveVoice")}
        </Button>
      </Group>
    </Stack>
  );
}

function OrgSettingsForm({
  name,
  domain,
  loading,
  error,
  onSave,
}: {
  name: string;
  domain: string;
  loading: boolean;
  error: Error | null;
  onSave: (name: string, domain: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <TextInput label={t("common.name")} name="org_name" defaultValue={name} required />
      <TextInput
        label={t("settings.domain")}
        name="org_domain"
        defaultValue={domain}
        required
        description={t("settings.domainHint")}
      />
      {error ? (
        <Text size="sm" c="red">
          {error.message}
        </Text>
      ) : null}
      <Group justify="flex-end">
        <Button
          type="submit"
          loading={loading}
          onClick={(e) => {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (!form) return;
            const fd = new FormData(form);
            onSave(String(fd.get("org_name") ?? ""), String(fd.get("org_domain") ?? ""));
          }}
        >
          {t("settings.saveOrganization")}
        </Button>
      </Group>
    </Stack>
  );
}
