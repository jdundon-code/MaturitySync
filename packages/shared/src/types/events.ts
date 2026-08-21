import { NotificationChannel } from './engagement.js';
import { RecommendationType } from './recommendation.js';

/**
 * All event types in the MaturitySync analytics taxonomy
 */
export enum EventType {
  MATURITY_APPROACHING = 'maturity.approaching',
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_OPENED = 'notification.opened',
  DECISION_HUB_VIEWED = 'decision_hub.viewed',
  RECOMMENDATION_SHOWN = 'recommendation.shown',
  RECOMMENDATION_ACCEPTED = 'recommendation.accepted',
  RECOMMENDATION_DISMISSED = 'recommendation.dismissed',
  ACTION_RENEW_SAME = 'action.renew_same',
  ACTION_RENEW_MODIFIED = 'action.renew_modified',
  ACTION_ADD_FUNDS = 'action.add_funds',
  ACTION_LADDER_CREATED = 'action.ladder_created',
  ACTION_REDIRECTED = 'action.redirected',
  ACTION_WITHDRAWN = 'action.withdrawn',
  MATURITY_EXPIRED = 'maturity.expired_no_action',
}

/**
 * Source that led the member to the decision hub
 */
export enum EventSource {
  PUSH_NOTIFICATION = 'push_notification',
  EMAIL_LINK = 'email_link',
  IN_APP_BANNER = 'in_app_banner',
  ACCOUNT_DETAIL = 'account_detail',
  DIRECT_NAVIGATION = 'direct_navigation',
}

/**
 * Base engagement event
 */
export interface EngagementEvent {
  eventId: string;
  certId: string;
  memberId: string;
  eventType: EventType;
  eventData: Record<string, unknown>;
  timestamp: string; // ISO 8601
  sessionId: string | null;
  source: EventSource | null;
}

// ===== Typed Event Data Payloads =====

export interface MaturityApproachingData {
  balance: number;
  maturityDate: string;
  daysRemaining: number;
  currentRate: number;
  termMonths: number;
}

export interface NotificationSentData {
  channel: NotificationChannel;
  intervalDays: number;
  templateId: string;
}

export interface NotificationOpenedData {
  channel: NotificationChannel;
  intervalDays: number;
}

export interface DecisionHubViewedData {
  source: EventSource;
  certificateBalance: number;
  daysRemaining: number;
}

export interface RecommendationShownData {
  recType: RecommendationType;
  recId: string;
  priority: number;
}

export interface RecommendationAcceptedData {
  recType: RecommendationType;
  recId: string;
}

export interface ActionRenewData {
  newBalance: number;
  newRate: number;
  newTermMonths: number;
  fundsAdded: number;
  fundSourceAccountId: string | null;
}

export interface ActionLadderData {
  numSplits: number;
  terms: number[];
  amounts: number[];
  weightedRate: number;
  totalEarnings: number;
}

export interface ActionRedirectedData {
  destinationType: string;
  destinationAccountId: string;
  amount: number;
}

export interface ActionWithdrawnData {
  amount: number;
  method: 'transfer' | 'check' | 'wire';
}

export interface MaturityExpiredData {
  balance: number;
  autoRenewRate: number;
  autoRenewTerm: number;
}
