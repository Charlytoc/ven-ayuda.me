"use client";

import dynamic from "next/dynamic";

import type { HelpRequest } from "@/lib/types/help-request";

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

type LatLng = { lat: number; lng: number };

type HelpMapPanelProps = {
  requests: HelpRequest[];
  draftLocation: LatLng | null;
  onDraftLocationChange: (location: LatLng) => void;
};

export function HelpMapPanel(props: HelpMapPanelProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <HelpMap {...props} />
    </div>
  );
}
