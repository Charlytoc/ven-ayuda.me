export function statusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Abierta";
    case "in_progress":
      return "En curso";
    case "resolved":
      return "Resuelta";
    default:
      return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "open":
      return "#fab005";
    case "in_progress":
      return "#228be6";
    case "resolved":
      return "#40c057";
    default:
      return "#868e96";
  }
}
