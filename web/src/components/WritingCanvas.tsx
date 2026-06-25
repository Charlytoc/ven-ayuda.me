"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionIcon, Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { fetchKanjiVGData, type KanjiVGData, type Point } from "@/lib/kanjivg";
import {
  ACCEPT_THRESHOLD,
  compareStrokes,
  isWritingAccepted,
  type StrokeComparison,
} from "@/lib/stroke-comparison";

const CANVAS_SIZE = 260;
const STROKE_WIDTH = 8;
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const DEFAULT_ZOOM_INDEX = 3; // 100%
// KanjiVG paths live in a 109×109 coordinate space.
const KANJIVG_SIZE = 109;

type WritingCanvasProps = {
  character: string;
  interactive: boolean;
  showCharacter?: boolean;
  /** Show +/- controls to scale the canvas display size (e.g. in vocab practice modal). */
  zoomable?: boolean;
  /**
   * Called once the student resolves the task. The answer encodes the outcome
   * and, on a pass, the match score: "accepted:<0-100>" or "rejected".
   */
  onResult?: (answer: string) => void;
};

export function WritingCanvas({
  character,
  interactive,
  showCharacter = false,
  zoomable = false,
  onResult,
}: WritingCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentRef = useRef<Point[] | null>(null);
  const drawingRef = useRef(false);
  const referenceRef = useRef<KanjiVGData | null>(null);

  const [strokeCount, setStrokeCount] = useState(0);
  const [reference, setReference] = useState<KanjiVGData | null>(null);
  const [refState, setRefState] = useState<"loading" | "ready" | "error">("loading");
  const [comparison, setComparison] = useState<StrokeComparison | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  const displayScale = ZOOM_STEPS[zoomIndex];
  const displaySize = CANVAS_SIZE * displayScale;

  // Keep the latest onResult without making it an effect dependency — the parent
  // passes a fresh callback every render, which would otherwise loop the fetch.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // ---- reference strokes ---------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    fetchKanjiVGData(character)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          referenceRef.current = data;
          setReference(data);
          setRefState("ready");
        } else {
          setRefState("error");
          onResultRef.current?.("rejected");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRefState("error");
          onResultRef.current?.("rejected");
        }
      });
    return () => {
      cancelled = true;
      referenceRef.current = null;
      setReference(null);
      setRefState("loading");
    };
  }, [character]);

  useEffect(() => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  }, [character]);

  // ---- canvas drawing ------------------------------------------------------
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // practice-paper guide grid
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CANVAS_SIZE - 1, CANVAS_SIZE - 1);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE / 2, 0);
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
    ctx.moveTo(0, CANVAS_SIZE / 2);
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
    ctx.stroke();
    ctx.restore();

    // faint reference guide when show_character is true
    if (showCharacter && referenceRef.current) {
      const scale = CANVAS_SIZE / KANJIVG_SIZE;
      const { strokes, numbers } = referenceRef.current;

      ctx.save();
      ctx.strokeStyle = "rgba(100,160,230,0.25)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const stroke of strokes) {
        if (stroke.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
        for (let i = 1; i < stroke.length; i += 1) {
          ctx.lineTo(stroke[i].x * scale, stroke[i].y * scale);
        }
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.font = `bold ${Math.round(9 * scale)}px Arial, sans-serif`;
      ctx.fillStyle = "rgba(100,160,230,0.55)";
      for (const { x, y, n } of numbers) {
        ctx.fillText(String(n), x * scale, y * scale);
      }
      ctx.restore();
    }

    // user strokes
    ctx.save();
    ctx.strokeStyle = "#1c7ed6";
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const all = [...strokesRef.current];
    if (currentRef.current) all.push(currentRef.current);
    for (const stroke of all) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i += 1) ctx.lineTo(stroke[i].x, stroke[i].y);
      if (stroke.length === 1) {
        ctx.arc(stroke[0].x, stroke[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#1c7ed6";
        ctx.fill();
      }
      ctx.stroke();
    }
    ctx.restore();
  }, [showCharacter]);

  // configure backing store for crisp lines on hi-dpi screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    redraw();
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw, strokeCount]);

  // redraw when reference loads (to show/hide the guide)
  useEffect(() => {
    redraw();
  }, [redraw, reference]);

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!interactive || accepted) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    currentRef.current = [pointFromEvent(e)];
    redraw();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !currentRef.current) return;
    currentRef.current.push(pointFromEvent(e));
    redraw();
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current && currentRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, currentRef.current];
      setStrokeCount(strokesRef.current.length);
      setComparison(null);
    }
    currentRef.current = null;
    redraw();
  }

  function handleReset() {
    strokesRef.current = [];
    currentRef.current = null;
    drawingRef.current = false;
    setStrokeCount(0);
    setComparison(null);
    setAccepted(false);
    redraw();
  }

  function handleClear() {
    handleReset();
  }

  function handleCheck() {
    if (strokesRef.current.length === 0 || !reference) return;
    const result = compareStrokes(strokesRef.current, reference.strokes);
    setComparison(result);
    if (isWritingAccepted(result)) {
      setAccepted(true);
      onResult?.(`accepted:${Math.round(result.score * 100)}`);
    }
  }

  const expectedStrokes = reference?.strokes.length ?? null;

  return (
    <Stack gap="xs" align="center">
      {zoomable ? (
        <Group gap="xs" justify="center">
          <ActionIcon
            variant="default"
            size="sm"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            aria-label={t("tasks.writingZoomOut")}
          >
            <IconZoomOut size={16} />
          </ActionIcon>
          <Text size="xs" c="dimmed" w={44} ta="center">
            {Math.round(displayScale * 100)}%
          </Text>
          <ActionIcon
            variant="default"
            size="sm"
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            aria-label={t("tasks.writingZoomIn")}
          >
            <IconZoomIn size={16} />
          </ActionIcon>
        </Group>
      ) : null}
      <Box
        component="canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          width: displaySize,
          height: displaySize,
          maxWidth: zoomable ? undefined : "100%",
          aspectRatio: "1 / 1",
          borderRadius: 12,
          border: "1px solid var(--mantine-color-gray-3)",
          background: "var(--mantine-color-body)",
          touchAction: "none",
          cursor: interactive && !accepted ? "crosshair" : "default",
        }}
      />

      {refState === "ready" && expectedStrokes != null && (
        <Text size="xs" c="dimmed">
          {t("tasks.writingStrokeHint", {
            drawn: strokeCount,
            expected: expectedStrokes,
          })}
        </Text>
      )}
      {refState === "error" && (
        <Text size="xs" c="dimmed">
          {t("tasks.writingNoReference")}
        </Text>
      )}

      {comparison && !accepted && (
        <Text size="xs" c={comparison.strokeCountMatches ? "orange" : "red"} ta="center">
          {!comparison.strokeCountMatches
            ? t("tasks.writingWrongStrokeCount", {
                drawn: comparison.drawnStrokeCount,
                expected: comparison.referenceStrokeCount,
              })
            : t("tasks.writingTryAgain", {
                score: Math.round(comparison.score * 100),
                threshold: Math.round(ACCEPT_THRESHOLD * 100),
              })}
        </Text>
      )}
      {accepted && (
        <Text size="xs" c="green" fw={600}>
          {t("tasks.writingAccepted", {
            score: Math.round((comparison?.score ?? 1) * 100),
          })}
        </Text>
      )}

      {interactive && (
        <Group gap="xs">
          {!accepted ? (
            <>
              <Button
                size="xs"
                variant="default"
                onClick={handleClear}
                disabled={strokeCount === 0}
              >
                {t("tasks.writingClear")}
              </Button>
              <Button
                size="xs"
                onClick={handleCheck}
                disabled={strokeCount === 0 || refState !== "ready"}
              >
                {t("tasks.writingCheck")}
              </Button>
            </>
          ) : (
            <Button size="xs" onClick={handleReset}>
              {t("tasks.writingPracticeAgain")}
            </Button>
          )}
        </Group>
      )}
    </Stack>
  );
}
