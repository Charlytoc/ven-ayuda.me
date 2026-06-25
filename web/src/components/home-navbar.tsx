"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Container,
  Group,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { VenEmergenciasLogoIcon } from "@/components/ven-emergencias-logo-icon";
import { RescuerNavLink } from "@/components/rescuer-nav-link";
import { APP_NAME } from "@/lib/constants";

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
              <VenEmergenciasLogoIcon size={24} />
              <Title order={4}>{title ?? APP_NAME}</Title>
            </Group>
          </Group>
          {!showBack ? <RescuerNavLink /> : null}
        </Group>
      </Container>
    </AppShell.Header>
  );
}
