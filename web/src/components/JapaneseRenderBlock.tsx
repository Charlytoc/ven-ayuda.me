"use client";

import { Box, Group, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { RubyText } from "@/components/RubyText";
import { SegmentPlayButton } from "@/components/chat/MessageAudioPlayer";
import type { JapaneseRender } from "@/lib/chat-task-types";

export function JapaneseRenderBlock({
  render,
  active = false,
  onPlay,
}: {
  render: JapaneseRender;
  /** Highlight this block while its audio clip is playing. */
  active?: boolean;
  /** Play just this block's audio clip. Enables the hover play button. */
  onPlay?: () => void;
}) {
  const { hovered, ref } = useHover();
  return (
    <Box
      ref={ref}
      px={active ? 6 : 0}
      py={4}
      style={{
        borderRadius: 8,
        transition: "background-color 180ms ease, padding 180ms ease",
        backgroundColor: active ? "var(--mantine-color-yellow-light)" : "transparent",
      }}
    >
      <Group gap={6} align="flex-start" wrap="nowrap">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <RubyText segments={render.segments} size="md" />
          {render.translation ? (
            <Text size="xs" c="dimmed">
              {render.translation}
            </Text>
          ) : null}
        </Stack>
        {onPlay ? (
          <SegmentPlayButton active={active} visible={hovered} onPlay={onPlay} />
        ) : null}
      </Group>
    </Box>
  );
}

export function JapaneseRenderList({
  renders,
  activeIndex = null,
  onPlaySegment,
}: {
  renders: JapaneseRender[];
  /** Index of the render whose audio clip is currently playing, if any. */
  activeIndex?: number | null;
  /** Play the clip for the render at the given index. */
  onPlaySegment?: (index: number) => void;
}) {
  if (!renders.length) return null;
  return (
    <Stack gap="xs" mt="xs">
      {renders.map((r, i) => (
        <JapaneseRenderBlock
          key={i}
          render={r}
          active={i === activeIndex}
          onPlay={onPlaySegment ? () => onPlaySegment(i) : undefined}
        />
      ))}
    </Stack>
  );
}
