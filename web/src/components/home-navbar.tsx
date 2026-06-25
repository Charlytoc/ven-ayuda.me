"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Container,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { VenAyudaLogoIcon } from "@/components/ven-ayuda-logo-icon";

type HomeNavbarProps = {
  title?: string;
  showBack?: boolean;
};

export function HomeNavbar({ title, showBack = false }: HomeNavbarProps) {
  const router = useRouter();

  return (
    <AppShell.Header
      style={{
        borderBottom: "1px solid var(--mantine-color-dark-4)",
        background: "var(--mantine-color-dark-7)",
      }}
    >
      <Container size="md" h="100%">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            {showBack ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Volver"
                onClick={() => router.back()}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            ) : null}
            <Group
              gap="xs"
              component={Link}
              href="/"
              style={{ textDecoration: "none", color: "inherit" }}
              wrap="nowrap"
            >
              <VenAyudaLogoIcon size={24} />
              <Title order={4}>{title ?? "ven-ayuda.me"}</Title>
            </Group>
          </Group>
          {!showBack ? (
            <Text size="sm" c="dimmed" visibleFrom="sm">
              Coordinación de ayuda — Venezuela
            </Text>
          ) : null}
        </Group>
      </Container>
    </AppShell.Header>
  );
}
