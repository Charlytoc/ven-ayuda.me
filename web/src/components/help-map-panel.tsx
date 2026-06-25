"use client";

import dynamic from "next/dynamic";

import type { HelpRequest, LatLng } from "@/lib/types/help-request";

const HelpMap = dynamic(
  () => import("@/components/help-map").then((mod) => mod.HelpMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#868e96",
        }}
      >
        Cargando mapa…
      </div>
    ),
  },
);

type HelpMapPanelProps = {
  requests: HelpRequest[];
  height?: number | string;
  interactive?: boolean;
  contained?: boolean;
  draftLocation?: LatLng | null;
  onDraftLocationChange?: (location: LatLng) => void;
  onRequestSelect?: (request: HelpRequest) => void;
  focusRequest?: HelpRequest | null;
  showMarkerTitles?: boolean;
  panToLocation?: LatLng | null;
};

export function HelpMapPanel({
  height = "100%",
  contained = false,
  ...props
}: HelpMapPanelProps) {
  return (
    <div
      className={contained ? "leaflet-contained" : undefined}
      style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <HelpMap {...props} />
    </div>
  );
}
