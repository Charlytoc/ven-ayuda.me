// Fetches reference stroke paths for a single kana/kanji from KanjiVG and
// samples them into point sequences for stroke comparison.
//
// KanjiVG ships one SVG per character, named after the Unicode code point in
// lowercase hex, zero-padded to 5 digits (e.g. 山 U+5C71 -> "05c71.svg").
// The file contains one <path d="..."> per stroke, in writing order, on a
// 109x109 canvas. We serve it from the jsDelivr CDN (CORS-enabled).

export type Point = { x: number; y: number };
export type StrokeNumber = { x: number; y: number; n: number };

export type KanjiVGData = {
  strokes: Point[][];
  numbers: StrokeNumber[];
};

const CDN_BASE = "https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji";
const POINTS_PER_STROKE = 32;

const cache = new Map<string, KanjiVGData>();

export function kanjiVGFileId(character: string): string | null {
  const codePoint = character.codePointAt(0);
  if (codePoint == null) return null;
  return codePoint.toString(16).toLowerCase().padStart(5, "0");
}

export function kanjiVGUrl(character: string): string | null {
  const id = kanjiVGFileId(character);
  return id ? `${CDN_BASE}/${id}.svg` : null;
}

/**
 * Sample a single SVG path element into evenly spaced points along its length.
 * Requires the element to be attached to the document so getTotalLength works
 * reliably across browsers.
 */
function samplePath(path: SVGPathElement, n = POINTS_PER_STROKE): Point[] {
  let total = 0;
  try {
    total = path.getTotalLength();
  } catch {
    return [];
  }
  if (!total || Number.isNaN(total)) return [];
  const points: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const p = path.getPointAtLength((total * i) / (n - 1));
    points.push({ x: p.x, y: p.y });
  }
  return points;
}

/**
 * Parse the translation from a SVG transform="matrix(a b c d tx ty)" attribute.
 * KanjiVG uses this on <text> elements to position stroke-order numbers.
 */
function parseMatrixTranslate(el: Element): { x: number; y: number } | null {
  const t = el.getAttribute("transform") ?? "";
  const m = t.match(/matrix\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].trim().split(/[\s,]+/);
  if (parts.length < 6) return null;
  return { x: parseFloat(parts[4]), y: parseFloat(parts[5]) };
}

/**
 * Fetch and parse the KanjiVG data for a character. Returns sampled stroke
 * paths (for DTW comparison) and stroke-number positions (for the guide
 * overlay). Results are cached per character.
 * Returns null when the character has no KanjiVG entry or the fetch fails.
 */
export async function fetchKanjiVGData(character: string): Promise<KanjiVGData | null> {
  const ch = character?.trim();
  if (!ch) return null;
  if (cache.has(ch)) return cache.get(ch)!;

  const url = kanjiVGUrl(ch);
  if (!url) return null;

  console.log(`[KanjiVG] fetching ${url}`);

  let svgText: string;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[KanjiVG] ${url} → ${res.status}`);
      return null;
    }
    svgText = await res.text();
  } catch (err) {
    console.error("[KanjiVG] fetch error:", err);
    return null;
  }

  // Strip the XML prolog / DOCTYPE so the HTML parser ingests it cleanly.
  // Using innerHTML (not DOMParser+cloneNode) makes the browser create real
  // SVGPathElement instances in the HTML document, so getTotalLength works and
  // querySelectorAll("path") matches without XML-namespace surprises.
  const svgStart = svgText.indexOf("<svg");
  if (svgStart === -1) {
    console.error("[KanjiVG] no <svg> tag in response for", url);
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.style.cssText =
    "position:absolute;top:-9999px;left:-9999px;width:109px;height:109px;visibility:hidden;";
  wrapper.innerHTML = svgText.slice(svgStart);
  document.body.appendChild(wrapper);

  let strokes: Point[][] = [];
  let numbers: StrokeNumber[] = [];
  try {
    strokes = Array.from(wrapper.querySelectorAll("path"))
      .map((path) => samplePath(path as SVGPathElement))
      .filter((pts) => pts.length > 0);

    numbers = Array.from(wrapper.querySelectorAll("text"))
      .flatMap((el) => {
        const pos = parseMatrixTranslate(el);
        const n = parseInt(el.textContent ?? "", 10);
        if (!pos || Number.isNaN(n)) return [];
        return [{ x: pos.x, y: pos.y, n }];
      });
  } catch (err) {
    console.error("[KanjiVG] sampling error:", err);
  } finally {
    wrapper.remove();
  }

  if (strokes.length === 0) {
    console.warn(`[KanjiVG] no usable strokes for "${ch}"`);
    return null;
  }

  const data: KanjiVGData = { strokes, numbers };
  cache.set(ch, data);
  return data;
}

// Backwards-compat helper — returns only strokes (used by comparison code path).
export async function fetchKanjiVGStrokes(character: string): Promise<Point[][] | null> {
  const data = await fetchKanjiVGData(character);
  return data?.strokes ?? null;
}
