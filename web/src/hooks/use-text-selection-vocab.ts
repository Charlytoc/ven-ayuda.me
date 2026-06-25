"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TextSelectionState = {
  text: string;
  rect: DOMRect;
};

function isEditableTarget(node: Node | null): boolean {
  if (!node) return false;
  const el = node instanceof Element ? node : node.parentElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.closest("input, textarea") !== null;
}

function selectionRect(range: Range): DOMRect | null {
  const rect = range.getBoundingClientRect();
  if (rect.width > 0 || rect.height > 0) return rect;

  const clientRects = range.getClientRects();
  if (clientRects.length === 0) return null;

  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const r of clientRects) {
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!Number.isFinite(top)) return clientRects[0] ?? null;
  return new DOMRect(left, top, right - left, bottom - top);
}

function readSelection(container: HTMLElement): TextSelectionState | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  if (isEditableTarget(sel.anchorNode) || isEditableTarget(sel.focusNode)) return null;

  const range = sel.getRangeAt(0);
  const text = sel.toString().trim();
  if (!text) return null;
  if (!container.contains(range.commonAncestorContainer)) return null;

  const rect = selectionRect(range);
  if (!rect) return null;
  return { text, rect };
}

export function useTextSelectionVocab() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [selection, setSelection] = useState<TextSelectionState | null>(null);

  const bindContainer = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
    setContainer(node);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    if (!container) return;

    let debounceId: ReturnType<typeof setTimeout> | null = null;

    function syncSelection() {
      setSelection(readSelection(container));
    }

    function scheduleSync() {
      if (debounceId !== null) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        debounceId = null;
        requestAnimationFrame(syncSelection);
      }, 120);
    }

    document.addEventListener("selectionchange", scheduleSync);
    container.addEventListener("mouseup", scheduleSync);
    container.addEventListener("pointerup", scheduleSync);

    return () => {
      if (debounceId !== null) clearTimeout(debounceId);
      document.removeEventListener("selectionchange", scheduleSync);
      container.removeEventListener("mouseup", scheduleSync);
      container.removeEventListener("pointerup", scheduleSync);
    };
  }, [container]);

  return { bindContainer, selection, clearSelection };
}
