"use client";

import { Box, Group, Stack } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { JapaneseRenderList } from "@/components/JapaneseRenderBlock";
import {
  MessageAudioButton,
  SegmentPlayButton,
  useMessageAudio,
} from "@/components/chat/MessageAudioPlayer";
import type { AudioSegment, JapaneseRender } from "@/lib/chat-task-types";

/**
 * Split narration into paragraphs on blank lines. MUST mirror the backend's
 * ``split_narration_paragraphs`` (core/services/message_audio.py) so each rendered
 * paragraph lines up with its audio clip by index for highlighting.
 */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** A narration paragraph with a hover-revealed button to play just its clip. */
function NarrationParagraph({
  paragraph,
  active,
  onPlay,
}: {
  paragraph: string;
  active: boolean;
  onPlay?: () => void;
}) {
  const { hovered, ref } = useHover();
  return (
    <Box
      ref={ref}
      px={active ? 6 : 0}
      style={{
        borderRadius: 8,
        transition: "background-color 180ms ease, padding 180ms ease",
        backgroundColor: active ? "var(--mantine-color-yellow-light)" : "transparent",
      }}
    >
      <Group gap={6} align="flex-start" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <MarkdownMessage content={paragraph} />
        </Box>
        {onPlay ? (
          <SegmentPlayButton active={active} visible={hovered} onPlay={onPlay} />
        ) : null}
      </Group>
    </Box>
  );
}

/**
 * Renders an assistant message's spoken content — the explanation text and its
 * Japanese render blocks — together with a "listen" button. While audio plays,
 * the segment being spoken (narration or a specific render) is highlighted.
 * Hovering a paragraph or render block reveals a button to play just that clip.
 */
export function AssistantMessageBody({
  messageId,
  token,
  content,
  renders,
  initialSegments,
}: {
  messageId: string;
  token: string | null;
  content: string;
  renders: JapaneseRender[];
  initialSegments?: AudioSegment[];
}) {
  const audio = useMessageAudio({ messageId, token, initialSegments });
  const canListen = Boolean(token) && Boolean(content);
  const paragraphs = content ? splitParagraphs(content) : [];

  return (
    <>
      {paragraphs.length > 0 ? (
        <Stack gap={4}>
          {paragraphs.map((paragraph, i) => (
            <NarrationParagraph
              key={i}
              paragraph={paragraph}
              active={audio.activeNarrationIndex === i}
              onPlay={canListen ? () => audio.playSegment("narration", i) : undefined}
            />
          ))}
        </Stack>
      ) : null}

      <JapaneseRenderList
        renders={renders}
        activeIndex={audio.activeRenderIndex}
        onPlaySegment={
          canListen ? (i) => audio.playSegment("render", i) : undefined
        }
      />

      {canListen ? (
        <Group gap={6} mt={6}>
          <MessageAudioButton audio={audio} />
        </Group>
      ) : null}

      {audio.audioElements}
    </>
  );
}
