"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

export function HeaderIconAction({
  label,
  icon,
  onClick,
  loading,
  disabled,
  variant = "light",
  color,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "light" | "subtle";
  color?: string;
}) {
  return (
    <Tooltip label={label}>
      <ActionIcon
        variant={variant}
        color={color}
        size="md"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}
