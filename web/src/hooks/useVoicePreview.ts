"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { previewVoice } from "@/lib/account-settings";

export type VoicePreviewRole = "narrator" | "japanese";

export function useVoicePreview(token: string | null) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingKey(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const previewKey = (voice: string, role: VoicePreviewRole) => `${role}:${voice}`;

  const togglePreview = useCallback(
    async (voice: string, role: VoicePreviewRole) => {
      if (!token) return;

      const key = previewKey(voice, role);
      if (playingKey === key) {
        stop();
        return;
      }

      stop();
      setError(null);
      setLoadingKey(key);
      try {
        const { url } = await previewVoice(token, { voice, role });
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingKey((current) => (current === key ? null : current));
          audioRef.current = null;
        };
        await audio.play();
        setPlayingKey(key);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not play preview");
      } finally {
        setLoadingKey(null);
      }
    },
    [token, playingKey, stop],
  );

  return {
    loadingKey,
    playingKey,
    error,
    togglePreview,
    stop,
    previewKey,
  };
}
