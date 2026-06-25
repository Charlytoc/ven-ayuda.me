import type { HelpRequestSeverity } from "@/lib/types/help-request";

export const VENEZUELA_CENTER = { lat: 7.5, lng: -66.0 } as const;
export const DEFAULT_ZOOM = 6;

export const SEVERITY_OPTIONS: {
  value: HelpRequestSeverity;
  label: string;
  color: string;
}[] = [
  { value: "critical", label: "Crítico", color: "#e03131" },
  { value: "urgent", label: "Urgente", color: "#f76707" },
  { value: "moderate", label: "Moderado", color: "#fab005" },
  { value: "low", label: "Bajo", color: "#40c057" },
];

export function severityColor(severity: HelpRequestSeverity): string {
  return (
    SEVERITY_OPTIONS.find((option) => option.value === severity)?.color ??
    "#868e96"
  );
}
