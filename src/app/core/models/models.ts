// ─── Campaign ────────────────────────────────────────────────────
export type CampaignStatus =
  | 'Draft' | 'Scheduled' | 'Running' | 'Completed' | 'Failed';

export interface Campaign {
  id: string;
  name: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  templateId?: string;
  status: CampaignStatus;
  scheduledAt: string;
  totalRecipients: number | null;
  sentCount: number;
  failedCount: number;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  scheduledAt: string;
}

export interface UpdateCampaignRequest {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  scheduledAt: string;
}

export interface TriggerResponse {
  message: string;
  key: string;
}

// ─── Template ────────────────────────────────────────────────────
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  plainBody: string | null;
  placeholders: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  htmlBody: string;
  plainBody?: string | null;
  placeholders?: string | null;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {
  isActive: boolean;
}

// ─── Health ──────────────────────────────────────────────────────
// Matches HealthController → HealthResponse + HealthEntry records

export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy';

export interface HealthEntry {
  status: HealthStatus;
  description: string | null;
  data: Record<string, unknown> | null;
}

export interface HealthCheckResult {
  status: HealthStatus;
  checks: Record<string, HealthEntry>;
}

// ─── Pagination ──────────────────────────────────────────────────
export interface PageRequest {
  page: number;
  pageSize: number;
}

// ─── Queue ───────────────────────────────────────────────────────
export type EmailStatus =
  | 'Pending' | 'Processing' | 'Sent' | 'Failed' | 'Retried';

export interface QueueItem {
  id: string;
  campaignId: string;
  recipientEmail: string;
  recipientName: string | null;
  status: EmailStatus;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string | null;
  sesMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueueSummary {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  retried: number;
  total: number;
}

// ─── Email View Tracking ─────────────────────────────────────────
export interface EmailTrackingItem {
  recipientEmail: string;
  recipientName: string | null;
  viewedAt: string | null;
  viewed: boolean;
  sentAt: string | null;
  queueItemId: string;
  canResend: boolean;
}

export interface TrackingSummary {
  totalSent: number;
  viewed: number;
  notViewed: number;
  viewRate: number;
}

export interface ReTriggerResponse {
  message: string;
  retriggeredCount: number;
}

export interface ReTriggerSelectedRequest {
  queueItemIds: string[];
}
