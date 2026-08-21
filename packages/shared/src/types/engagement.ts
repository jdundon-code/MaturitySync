/**
 * Engagement state machine states
 */
export enum EngagementStatus {
  /** Certificate exists but is outside the engagement window */
  DORMANT = 'DORMANT',
  /** At least one notification sent; member has not yet engaged */
  NOTIFIED = 'NOTIFIED',
  /** Member has opened the decision hub / viewed options */
  ENGAGED = 'ENGAGED',
  /** Member took an action (renewed, modified, redirected, withdrew) */
  RESOLVED = 'RESOLVED',
  /** Grace period ended with no member action; auto-rolled */
  EXPIRED = 'EXPIRED',
}

/**
 * Valid state transitions
 */
export const VALID_TRANSITIONS: Record<EngagementStatus, EngagementStatus[]> = {
  [EngagementStatus.DORMANT]: [EngagementStatus.NOTIFIED],
  [EngagementStatus.NOTIFIED]: [EngagementStatus.ENGAGED, EngagementStatus.EXPIRED],
  [EngagementStatus.ENGAGED]: [EngagementStatus.RESOLVED, EngagementStatus.EXPIRED],
  [EngagementStatus.RESOLVED]: [], // terminal state
  [EngagementStatus.EXPIRED]: [], // terminal state
};

/**
 * Action types a member can take to resolve a maturity event
 */
export type ResolutionAction =
  | 'renew_same'
  | 'renew_modified'
  | 'add_funds_renew'
  | 'ladder_created'
  | 'redirected'
  | 'withdrawn';

/**
 * Engagement state record for a specific certificate maturity event
 */
export interface EngagementState {
  engagementId: string;
  certId: string;
  memberId: string;
  status: EngagementStatus;
  enteredStateAt: string; // ISO 8601
  notificationCount: number;
  lastNotificationAt: string | null; // ISO 8601
  lastNotificationChannel: NotificationChannel | null;
  decisionHubViewedAt: string | null; // ISO 8601
  actionTaken: ResolutionAction | null;
  actionTakenAt: string | null; // ISO 8601
  actionDetails: Record<string, unknown> | null; // JSON payload of action specifics
  outcomeBalance: number | null;
  outcomeRate: number | null;
  outcomeTerm: number | null;
  fundsAdded: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Notification channels
 */
export enum NotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  SMS = 'SMS',
}

/**
 * Notification log entry
 */
export interface NotificationLog {
  logId: string;
  certId: string;
  memberId: string;
  channel: NotificationChannel;
  intervalDays: number; // days before maturity when this was sent
  templateId: string;
  sentAt: string; // ISO 8601
  openedAt: string | null; // ISO 8601
  clickedAt: string | null; // ISO 8601
  suppressed: boolean;
  suppressionReason: string | null;
}
