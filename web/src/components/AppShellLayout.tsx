"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Center,
  Group,
  Loader,
  NavLink,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { TOKEN_KEY, USER_KEY, readStoredAuth, type AuthUser } from "@/lib/auth-storage";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, , removeUser] = useLocalStorage<AuthUser | null>({
    key: USER_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [, , removeToken] = useLocalStorage<string | null>({
    key: TOKEN_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure();
  const [desktopNavOpened, { toggle: toggleDesktopNav }] = useDisclosure(true);

  useEffect(() => {
    // Mount flag so we only read localStorage (auth) on the client, avoiding hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (!mounted) return;
    if (!readStoredAuth().user) {
      router.replace("/login");
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <Center h="100vh" bg="var(--mantine-color-body)">
        <Loader size="sm" />
      </Center>
    );
  }

  const effectiveUser = user ?? readStoredAuth().user;

  if (!effectiveUser) {
    return (
      <Center h="100vh" bg="var(--mantine-color-body)">
        <Loader size="sm" />
      </Center>
    );
  }

  function signOut() {
    removeToken();
    removeUser();
    router.push("/login");
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !mobileNavOpened, desktop: !desktopNavOpened },
      }}
      padding={0}
    >
      <AppShell.Header px="md" py={6} style={{ display: "flex", alignItems: "center" }}>
        <Group justify="space-between" w="100%" wrap="nowrap" gap="sm">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Burger
              opened={mobileNavOpened}
              onClick={toggleMobileNav}
              hiddenFrom="sm"
              size="sm"
              aria-label={t("nav.openNavigation")}
            />
            <ActionIcon
              variant="default"
              size="lg"
              visibleFrom="sm"
              onClick={toggleDesktopNav}
              aria-label={desktopNavOpened ? t("nav.hideSidebar") : t("nav.showSidebar")}
              title={desktopNavOpened ? t("nav.hideSidebar") : t("nav.showSidebar")}
            >
              <Text fw={700} lh={1} fz="md" style={{ fontFamily: "monospace" }}>
                {desktopNavOpened ? "⟨" : "⟩"}
              </Text>
            </ActionIcon>
            <Title order={4} fw={700} lineClamp={1} style={{ minWidth: 0 }}>
              {t("common.appName")}
            </Title>
          </Group>
          <Group gap="sm" wrap="nowrap" justify="flex-end" style={{ flexShrink: 0 }}>
            <Text size="sm" c="dimmed" visibleFrom="md" lineClamp={1} maw={200}>
              {effectiveUser.email}
            </Text>
            <ThemeToggle />
            <Button variant="default" size="xs" onClick={signOut}>
              <Text visibleFrom="sm">{t("nav.signOut")}</Text>
              <Text hiddenFrom="sm" size="xs">
                {t("nav.signOutShort")}
              </Text>
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <NavLink
          component={Link}
          href="/chat"
          label={t("nav.chat")}
          active={pathname === "/chat"}
          onClick={() => closeMobileNav()}
        />
        <NavLink
          component={Link}
          href="/tasks"
          label={t("nav.tasks")}
          active={pathname === "/tasks"}
          onClick={() => closeMobileNav()}
        />
        <NavLink
          component={Link}
          href="/vocabulary"
          label={t("nav.vocabulary")}
          active={pathname === "/vocabulary" || pathname?.startsWith("/vocabulary/")}
          onClick={() => closeMobileNav()}
        />
        <NavLink
          component={Link}
          href="/settings"
          label={t("nav.settings")}
          active={pathname === "/settings" || pathname?.startsWith("/settings/")}
          onClick={() => closeMobileNav()}
        />
      </AppShell.Navbar>

      <AppShell.Main
        bg="var(--mantine-color-body)"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "calc(100vh - var(--app-shell-header-height, 56px))",
        }}
      >
        <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
