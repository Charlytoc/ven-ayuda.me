"use client";

import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tooltip label={isDark ? t("nav.switchToLight") : t("nav.switchToDark")} withArrow>
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => toggleColorScheme()}
        aria-label={isDark ? t("nav.switchToLight") : t("nav.switchToDark")}
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
