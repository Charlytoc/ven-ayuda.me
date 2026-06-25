"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPlayerStopFilled, IconVolume } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function VocabularyPlayButton({
  playing,
  loading = false,
  visible = true,
  onPlay,
}: {
  playing: boolean;
  loading?: boolean;
  visible?: boolean;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  const label = playing ? t("chat.audio.stop") : t("chat.audio.playSegment");

  return (
    <Tooltip label={label} withArrow openDelay={400}>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        loading={loading}
        onClick={onPlay}
        aria-label={label}
        style={{
          opacity: visible || playing ? 1 : 0,
          transition: "opacity 120ms ease",
          pointerEvents: visible || playing ? "auto" : "none",
          flexShrink: 0,
        }}
      >
        {playing ? <IconPlayerStopFilled size={13} /> : <IconVolume size={14} />}
      </ActionIcon>
    </Tooltip>
  );
}
