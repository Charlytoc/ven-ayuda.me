export type HelpRequestSeverity = "critical" | "urgent" | "moderate" | "low";

export type HelpRequestStatus = "open" | "in_progress" | "resolved";

export type HelpRequest = {
  id: string;
  latitude: string;
  longitude: string;
  severity: HelpRequestSeverity;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: HelpRequestStatus;
  attachment_ids: string[];
  created: string;
  modified: string;
};

export type HelpRequestCreate = {
  latitude: number;
  longitude: number;
  severity: HelpRequestSeverity;
  description: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  attachment_ids?: string[];
};

export type ApiError = {
  error: string;
  error_code?: string;
};
