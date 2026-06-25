// Geometry for validating hand-drawn characters against KanjiVG reference
// strokes. The pipeline is: normalize both drawings into the same unit box
// (so absolute size/position don't matter), resample each stroke to a fixed
// point count, then compare stroke-by-stroke with Dynamic Time Warping (DTW).
//
// Comparing stroke N of the drawing against stroke N of the reference is what
// enforces correct stroke order: drawing the right shape in the wrong order
// scores poorly because the per-index pairs no longer line up.

import type { Point } from "./kanjivg";

const RESAMPLE_N = 32;
// Average per-step normalized distance beyond which similarity hits 0.
// Calibrated so a careful trace clears the 85% bar while a sloppy one stays
// below it: a clean trace lands near 0.04 (≈92%), a rough one near 0.10 (≈80%).
const MAX_MEAN_DISTANCE = 0.5;

export type StrokeComparison = {
  /** Overall similarity in [0, 1]. */
  score: number;
  /** Per-stroke similarity for the strokes that were compared. */
  perStroke: number[];
  drawnStrokeCount: number;
  referenceStrokeCount: number;
  strokeCountMatches: boolean;
};

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function strokeLength(stroke: Point[]): number {
  let total = 0;
  for (let i = 1; i < stroke.length; i += 1) total += distance(stroke[i - 1], stroke[i]);
  return total;
}

/** Resample a stroke to exactly n points evenly spaced along its arc length. */
export function resample(stroke: Point[], n = RESAMPLE_N): Point[] {
  if (stroke.length === 0) return [];
  if (stroke.length === 1) return Array.from({ length: n }, () => ({ ...stroke[0] }));

  const total = strokeLength(stroke);
  if (total === 0) return Array.from({ length: n }, () => ({ ...stroke[0] }));

  const step = total / (n - 1);
  const out: Point[] = [{ ...stroke[0] }];
  let prev = stroke[0];
  let accumulated = 0;
  let i = 1;

  while (out.length < n && i < stroke.length) {
    const segLen = distance(prev, stroke[i]);
    if (accumulated + segLen >= step) {
      const t = (step - accumulated) / segLen;
      const next = {
        x: prev.x + t * (stroke[i].x - prev.x),
        y: prev.y + t * (stroke[i].y - prev.y),
      };
      out.push(next);
      prev = next;
      accumulated = 0;
    } else {
      accumulated += segLen;
      prev = stroke[i];
      i += 1;
    }
  }
  while (out.length < n) out.push({ ...stroke[stroke.length - 1] });
  return out;
}

/**
 * Scale every stroke into a shared unit box, preserving aspect ratio so the
 * relative position of strokes is kept. Uses the global bounding box across
 * all strokes of the character.
 */
export function normalizeStrokes(strokes: Point[][]): Point[][] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (!Number.isFinite(minX)) return strokes;

  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height) || 1;
  // Center the smaller dimension within the unit box.
  const offsetX = (scale - width) / 2;
  const offsetY = (scale - height) / 2;

  return strokes.map((stroke) =>
    stroke.map((p) => ({
      x: (p.x - minX + offsetX) / scale,
      y: (p.y - minY + offsetY) / scale,
    })),
  );
}

/** Dynamic Time Warping distance between two equal-purpose point sequences. */
export function dtw(a: Point[], b: Point[]): number {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return Infinity;

  let prev = new Array<number>(m + 1).fill(Infinity);
  let curr = new Array<number>(m + 1).fill(Infinity);
  prev[0] = 0;

  for (let i = 1; i <= n; i += 1) {
    curr[0] = Infinity;
    for (let j = 1; j <= m; j += 1) {
      const cost = distance(a[i - 1], b[j - 1]);
      curr[j] = cost + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  // Normalize by path length so longer sequences aren't penalized.
  return prev[m] / (n + m);
}

function strokeSimilarity(drawn: Point[], reference: Point[]): number {
  const a = resample(drawn);
  const b = resample(reference);
  const meanDistance = dtw(a, b);
  if (!Number.isFinite(meanDistance)) return 0;
  return Math.max(0, Math.min(1, 1 - meanDistance / MAX_MEAN_DISTANCE));
}

/**
 * Compare a hand-drawn character (one point sequence per stroke) against the
 * KanjiVG reference. Both are normalized together-per-drawing into a unit box.
 */
export function compareStrokes(
  drawnRaw: Point[][],
  referenceRaw: Point[][],
): StrokeComparison {
  const drawn = normalizeStrokes(drawnRaw.filter((s) => s.length > 0));
  const reference = normalizeStrokes(referenceRaw.filter((s) => s.length > 0));

  const drawnStrokeCount = drawn.length;
  const referenceStrokeCount = reference.length;
  const strokeCountMatches = drawnStrokeCount === referenceStrokeCount;

  if (drawnStrokeCount === 0 || referenceStrokeCount === 0) {
    return {
      score: 0,
      perStroke: [],
      drawnStrokeCount,
      referenceStrokeCount,
      strokeCountMatches,
    };
  }

  const compared = Math.min(drawnStrokeCount, referenceStrokeCount);
  const perStroke: number[] = [];
  for (let i = 0; i < compared; i += 1) {
    perStroke.push(strokeSimilarity(drawn[i], reference[i]));
  }

  const meanShape = perStroke.reduce((acc, s) => acc + s, 0) / compared;
  // Penalize missing/extra strokes proportionally.
  const countPenalty = compared / Math.max(drawnStrokeCount, referenceStrokeCount);

  return {
    score: meanShape * countPenalty,
    perStroke,
    drawnStrokeCount,
    referenceStrokeCount,
    strokeCountMatches,
  };
}

/** Default acceptance threshold for the writing canvas. */
export const ACCEPT_THRESHOLD = 0.9;

export function isWritingAccepted(comparison: StrokeComparison, threshold = ACCEPT_THRESHOLD): boolean {
  // Compare on the rounded percentage so the decision matches what the student
  // sees: a displayed "90%" must pass a 90% bar even if the raw score is 0.897.
  return (
    comparison.strokeCountMatches &&
    Math.round(comparison.score * 100) >= Math.round(threshold * 100)
  );
}
