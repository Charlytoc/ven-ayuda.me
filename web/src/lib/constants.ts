import type { HelpRequestSeverity } from "@/lib/types/help-request";

export const APP_NAME = "VenEmergencias";
export const APP_DOMAIN = "ven-emergencias.com";

export const VENEZUELA_CENTER = { lat: 7.5, lng: -66.0 } as const;
export const DEFAULT_ZOOM = 6;
export const COMPACT_MAP_HEIGHT = 280;

export const SEVERITY_OPTIONS: {
  value: HelpRequestSeverity;
  label: string;
  color: string;
}[] = [
  { value: "critical", label: "Crítico", color: "#e03131" },
  { value: "urgent", label: "Urgente", color: "#f76707" },
  { value: "moderate", label: "Moderado", color: "#fab005" },
  { value: "low", label: "Bajo", color: "#82c91e" },
];

export const ALERT_LEGEND = SEVERITY_OPTIONS.filter((option) =>
  ["critical", "urgent", "moderate"].includes(option.value),
);

export function severityColor(severity: HelpRequestSeverity): string {
  return (
    SEVERITY_OPTIONS.find((option) => option.value === severity)?.color ??
    "#868e96"
  );
}

export function severityLabel(severity: HelpRequestSeverity): string {
  return (
    SEVERITY_OPTIONS.find((option) => option.value === severity)?.label ??
    severity
  );
}
