"use client";

import Link from "next/link";
import { Anchor, Container, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

export type LegalDocPageProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalDocPage({ title, lastUpdated, children }: LegalDocPageProps) {
  const { t } = useTranslation();

  return (
    <Container component="main" size={680} py="xl" pb={96}>
      <Stack gap="xl">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Anchor component={Link} href="/" size="sm" c="dimmed">
            ← {t("common.appName")}
          </Anchor>
          <Group gap="md" wrap="wrap">
            <Anchor component={Link} href="/privacy-policy" size="sm" c="dimmed">
              {t("common.privacy")}
            </Anchor>
            <Anchor component={Link} href="/terms-of-service" size="sm" c="dimmed">
              {t("common.terms")}
            </Anchor>
          </Group>
        </Group>
        <Stack gap="xs">
          <Title order={1}>{title}</Title>
          <Text size="sm" c="dimmed">
            {t("common.lastUpdated", { date: lastUpdated })}
          </Text>
        </Stack>
        <Stack gap="lg" fz="sm" lh={1.7} c="var(--mantine-color-text)">
          {children}
        </Stack>
      </Stack>
    </Container>
  );
}
