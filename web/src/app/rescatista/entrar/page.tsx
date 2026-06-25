"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AppShell,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { HomeNavbar } from "@/components/home-navbar";
import { loginRescuer } from "@/lib/api/auth";

export default function RescatistaEntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loginRescuer({ email: email.trim(), password });
      notifications.show({
        color: "green",
        title: "Sesión iniciada",
        message: "Bienvenido de nuevo.",
      });
      router.push("/rescatista/perfil");
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo iniciar sesión",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar title="Entrar" showBack />
      <AppShell.Main>
        <Container size="sm" py="xl">
          <Paper withBorder radius="md" p="xl">
            <Stack gap="md" component="form" onSubmit={handleSubmit}>
              <Title order={2}>Entrar como rescatista</Title>
              <TextInput
                label="Correo"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <PasswordInput
                label="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button type="submit" loading={submitting}>
                Entrar
              </Button>
              <Text size="sm" c="dimmed">
                ¿No tienes cuenta?{" "}
                <Text component={Link} href="/rescatista/registro" span inherit c="blue">
                  Regístrate
                </Text>
              </Text>
            </Stack>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
