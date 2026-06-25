"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { synthesizeVocabularyAudio } from "@/lib/vocabulary-api";

export function useVocabularyAudio(token: string | null) {
  const { t } = useTranslation();
  const urlCacheRef = useRef<Map<string, string>>(new Map());
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

  const toggle = useCallback(
    async (text: string, playKey: string) => {
      if (!token) return;
      const spoken = text.trim();
      if (!spoken) return;

      if (playingKey === playKey) {
        stop();
        return;
      }

      stop();
      setError(null);
      setLoadingKey(playKey);
      try {
        let url = urlCacheRef.current.get(spoken);
        if (!url) {
          const data = await synthesizeVocabularyAudio(token, spoken);
          url = data.url;
          urlCacheRef.current.set(spoken, url);
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingKey((current) => (current === playKey ? null : current));
          audioRef.current = null;
        };
        await audio.play();
        setPlayingKey(playKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("chat.audio.error"));
      } finally {
        setLoadingKey(null);
      }
    },
    [token, playingKey, stop, t],
  );

  return {
    toggle,
    stop,
    loadingKey,
    playingKey,
    error,
    isLoading: (key: string) => loadingKey === key,
    isPlaying: (key: string) => playingKey === key,
  };
}
