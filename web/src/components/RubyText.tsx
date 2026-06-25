"use client";

import { Text } from "@mantine/core";
import type { TextSegment } from "@/lib/chat-task-types";

const JAPANESE_FONT = {
  sm: 24,
  md: 30,
  lg: 36,
  xl: 52,
  furiganaRatio: 0.52,
} as const;

export function RubyText({
  segments,
  pending = false,
  targetReading,
  size = "lg",
}: {
  segments: TextSegment[];
  pending?: boolean;
  targetReading?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const fontSize = JAPANESE_FONT[size];

  return (
    <Text size="xl" fw={700} style={{ fontSize, lineHeight: 1.4 }} component="span">
      {segments.map((seg, i) => {
        if (seg.furigana) {
          return (
            <ruby key={i}>
              {seg.text}
              <rt style={{ fontSize: `${JAPANESE_FONT.furiganaRatio}em`, fontWeight: 500 }}>
                {seg.furigana}
              </rt>
            </ruby>
          );
        }
        if (seg.is_target) {
          return (
            <ruby key={i}>
              {seg.text}
              <rt
                style={{
                  fontSize: `${JAPANESE_FONT.furiganaRatio}em`,
                  fontWeight: 500,
                  color: "var(--mantine-color-orange-5)",
                }}
              >
                {pending ? "?" : targetReading}
              </rt>
            </ruby>
          );
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </Text>
  );
}
