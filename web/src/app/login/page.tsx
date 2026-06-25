"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { API_BASE_URL } from "@/lib/api-base";
import type { components } from "@/lib/api/schema";
import { TOKEN_KEY, USER_KEY, readStoredAuth, type AuthUser } from "@/lib/auth-storage";
import { useTranslation } from "react-i18next";

type ApiSchemas = components["schemas"];
type AuthResponse = ApiSchemas["AuthResponse"];
type LoginRequest = ApiSchemas["LoginRequest"];
type SignupRequest = ApiSchemas["SignupRequest"];
type ApiError = ApiSchemas["ErrorResponseSchema"];

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [, setUser] = useLocalStorage<AuthUser | null>({ key: USER_KEY, defaultValue: null });
  const [, setToken] = useLocalStorage<string | null>({ key: TOKEN_KEY, defaultValue: null });

  useEffect(() => {
    if (readStoredAuth().token) router.replace("/chat");
  }, [router]);

  const authMutation = useMutation({
    mutationFn: async (payload: { mode: "login" | "signup"; body: LoginRequest | SignupRequest }) => {
      const endpoint = payload.mode === "login" ? "/auth/login" : "/auth/signup";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.body),
      });
      const data = (await response.json()) as AuthResponse | ApiError;
      if (!response.ok) throw new Error((data as ApiError).error ?? response.statusText);
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      setToken(data.api_token);
      setUser(data.user);
      router.replace("/chat");
    },
    onError: (err: Error) => setError(err.message),
  });

  function submitAuth(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body: LoginRequest | SignupRequest =
      mode === "login"
        ? { email, password }
        : { email, password, first_name: firstName || undefined, last_name: lastName || undefined };
    authMutation.mutate({ mode, body });
  }

  return (
    <Center h="100vh" bg="var(--mantine-color-body)">
      <Paper w={380} p="xl" radius="lg" shadow="md" withBorder>
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={2} fw={700}>
              {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
            </Title>
            <Text c="dimmed" size="sm">
              {mode === "login" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </Text>
          </Stack>

          <form onSubmit={submitAuth}>
            <Stack gap="sm">
              {mode === "signup" && (
                <Group grow>
                  <TextInput
                    label={t("auth.firstName")}
                    placeholder={t("auth.firstNamePlaceholder")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.currentTarget.value)}
                  />
                  <TextInput
                    label={t("auth.lastName")}
                    placeholder={t("auth.lastNamePlaceholder")}
                    value={lastName}
                    onChange={(e) => setLastName(e.currentTarget.value)}
                  />
                </Group>
              )}
              <TextInput
                label={t("common.email")}
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <PasswordInput
                label={t("common.password")}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              {error ? (
                <Text size="sm" c="red">
                  {error}
                </Text>
              ) : null}
              <Button type="submit" fullWidth mt="xs" loading={authMutation.isPending}>
                {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
              </Button>
            </Stack>
          </form>

          <Text size="sm" ta="center" c="dimmed">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
            <Text
              span
              c="blue"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setError(null);
                setMode(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
