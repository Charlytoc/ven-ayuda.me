"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPlayerStopFilled, IconVolume } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { apiFetch, apiReadJson } from "@/lib/api-request";
import type { components } from "@/lib/api/schema";
import type { AudioSegment } from "@/lib/chat-task-types";

type AudioResponse = components["schemas"]["MessageAudioResponse"];

export type MessageAudioController = {
  isLoading: boolean;
  isPlaying: boolean;
  /** Index of the narration paragraph whose clip is currently playing, or null. */
  activeNarrationIndex: number | null;
  /** Index into japanese_renders of the clip currently playing, or null. */
  activeRenderIndex: number | null;
  toggle: () => void;
  /**
   * Play a single clip identified by its kind and index within that kind
   * (e.g. the 2nd render block). Generates segments first if needed. Unlike
   * {@link toggle} it does not advance to the following clip.
   */
  playSegment: (kind: "narration" | "render", indexWithinKind: number) => void;
  /** Hidden <audio> elements — render these somewhere in the tree. */
  audioElements: ReactNode;
};

/** Resolve the absolute segment index for the nth clip of a given kind. */
function absoluteSegmentIndex(
  segments: AudioSegment[],
  kind: "narration" | "render",
  indexWithinKind: number,
): number | null {
  let count = -1;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i]?.kind === kind) {
      count += 1;
      if (count === indexWithinKind) return i;
    }
  }
  return null;
}

/**
 * Drives lazy synthesis + sequential playback of an assistant message's audio
 * segments, and reports which segment is currently playing so the UI can
 * highlight the matching part of the message.
 */
export function useMessageAudio({
  messageId,
  token,
  initialSegments,
}: {
  messageId: string;
  token: string | null;
  initialSegments?: AudioSegment[];
}): MessageAudioController {
  const { t } = useTranslation();
  const [segments, setSegments] = useState<AudioSegment[] | null>(
    initialSegments && initialSegments.length > 0 ? initialSegments : null,
  );
  const [loading, setLoading] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  // When true the current clip plays alone instead of advancing to the next.
  // A ref (not state) so the memoized `handleEnded` closure always reads it.
  const singleRef = useRef(false);

  useEffect(() => {
    audioRefs.current = audioRefs.current.slice(0, segments?.length ?? 0);
  }, [segments]);

  // Advance through the clips as each one starts.
  useEffect(() => {
    if (playingIdx === null) return;
    const el = audioRefs.current[playingIdx];
    if (!el) {
      setPlayingIdx(null);
      return;
    }
    el.currentTime = 0;
    void el.play().catch(() => setPlayingIdx(null));
  }, [playingIdx]);

  function stop() {
    audioRefs.current.forEach((el) => el?.pause());
    setPlayingIdx(null);
  }

  function handleEnded() {
    if (singleRef.current) {
      singleRef.current = false;
      setPlayingIdx(null);
      return;
    }
    setPlayingIdx((idx) => {
      if (idx === null) return null;
      const next = idx + 1;
      return next < (segments?.length ?? 0) ? next : null;
    });
  }

  /** Lazily synthesize segments if not present yet; returns them (or null on failure). */
  async function ensureSegments(): Promise<AudioSegment[] | null> {
    if (segments) return segments;
    setLoading(true);
    try {
      const response = await apiFetch(`/messages/${messageId}/audio`, token, {
        method: "POST",
      });
      const data = await apiReadJson<AudioResponse>(response, t("chat.audio.error"));
      const segs = data.segments ?? [];
      setSegments(segs);
      return segs;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    if (!token) return;
    if (playingIdx !== null) {
      stop();
      return;
    }
    const segs = await ensureSegments();
    if (!segs || segs.length === 0) return;
    singleRef.current = false;
    setPlayingIdx(0);
  }

  async function playSegment(kind: "narration" | "render", indexWithinKind: number) {
    if (!token) return;
    // Clicking the segment that's already playing toggles it off.
    if (playingIdx !== null && segments) {
      const current = absoluteSegmentIndex(segments, kind, indexWithinKind);
      if (current !== null && current === playingIdx) {
        stop();
        return;
      }
    }
    stop();
    const segs = await ensureSegments();
    if (!segs || segs.length === 0) return;
    const abs = absoluteSegmentIndex(segs, kind, indexWithinKind);
    if (abs === null) return;
    singleRef.current = true;
    setPlayingIdx(abs);
  }

  const activeSegment = playingIdx === null ? null : segments?.[playingIdx] ?? null;

  // Map the active clip to its index within its own kind, so the matching
  // narration paragraph or render block can be highlighted.
  function activeIndexForKind(kind: "narration" | "render"): number | null {
    if (activeSegment?.kind !== kind || !segments || playingIdx === null) return null;
    let count = -1;
    for (let i = 0; i <= playingIdx; i++) {
      if (segments[i]?.kind === kind) count += 1;
    }
    return count;
  }

  const activeNarrationIndex = activeIndexForKind("narration");
  const activeRenderIndex = activeIndexForKind("render");

  const audioElements = useMemo(
    () =>
      (segments ?? []).map((seg, i) => (
        <audio
          key={`${seg.media_id}-${i}`}
          ref={(el) => {
            audioRefs.current[i] = el;
          }}
          src={seg.url}
          preload="none"
          onEnded={handleEnded}
        />
      )),
    // handleEnded is stable enough for our purposes; re-create only when clips change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segments],
  );

  return {
    isLoading: loading,
    isPlaying: playingIdx !== null,
    activeNarrationIndex,
    activeRenderIndex,
    toggle,
    playSegment,
    audioElements,
  };
}

/**
 * Small play button for an individual message segment (narration paragraph or
 * render block). Meant to be revealed on hover next to the segment it plays.
 */
export function SegmentPlayButton({
  active,
  visible,
  onPlay,
}: {
  /** This segment's clip is currently playing. */
  active: boolean;
  /** Show the button (e.g. parent is hovered). It stays visible while playing. */
  visible: boolean;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  const label = active ? t("chat.audio.stop") : t("chat.audio.playSegment");
  return (
    <Tooltip label={label} withArrow openDelay={400}>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        onClick={onPlay}
        aria-label={label}
        style={{
          opacity: visible || active ? 1 : 0,
          transition: "opacity 120ms ease",
          pointerEvents: visible || active ? "auto" : "none",
        }}
      >
        {active ? <IconPlayerStopFilled size={13} /> : <IconVolume size={14} />}
      </ActionIcon>
    </Tooltip>
  );
}

/** Speaker / stop button bound to a {@link MessageAudioController}. */
export function MessageAudioButton({ audio }: { audio: MessageAudioController }) {
  const { t } = useTranslation();
  const label = audio.isPlaying ? t("chat.audio.stop") : t("chat.audio.listen");
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        loading={audio.isLoading}
        onClick={audio.toggle}
        aria-label={label}
      >
        {audio.isPlaying ? <IconPlayerStopFilled size={14} /> : <IconVolume size={16} />}
      </ActionIcon>
    </Tooltip>
  );
}
