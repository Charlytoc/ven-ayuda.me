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
import { registerRescuer } from "@/lib/api/auth";

export default function RescatistaRegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await registerRescuer({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        phone: phone.trim(),
      });
      notifications.show({
        color: "green",
        title: "Cuenta creada",
        message: "Configura tu ubicación y notificaciones.",
      });
      router.push("/rescatista/perfil");
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo registrar",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar title="Registro rescatista" showBack />
      <AppShell.Main>
        <Container size="sm" py="xl">
          <Stack gap="md">
            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  ¿Ya tienes cuenta?
                </Text>
                <Button
                  component={Link}
                  href="/rescatista/entrar"
                  variant="default"
                  fullWidth
                >
                  Inicia sesión
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="xl">
              <Stack gap="md" component="form" onSubmit={handleSubmit}>
                <Title order={2}>Únete como rescatista</Title>
                <Text size="sm" c="dimmed">
                  Recibe alertas en tu zona, ve en camino a emergencias y marca
                  cuando ya fueron atendidas.
                </Text>
                <TextInput
                  label="Nombre"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                />
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
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <TextInput
                  label="Teléfono (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                />
                <Button type="submit" loading={submitting}>
                  Crear cuenta
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
