import { NotificationChannel } from './engagement.js';

/**
 * FI-level configuration for the MaturitySync platform
 */
export interface FIConfiguration {
  configId: string;
  fiId: string;
  configType: ConfigType;
  configKey: string;
  configValue: unknown; // JSON
  effectiveFrom: string; // ISO 8601
  effectiveTo: string | null; // ISO 8601
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export enum ConfigType {
  NOTIFICATION_TIMING = 'NOTIFICATION_TIMING',
  NOTIFICATION_TEMPLATE = 'NOTIFICATION_TEMPLATE',
  CHANNEL_SETTINGS = 'CHANNEL_SETTINGS',
  PRODUCT_AVAILABILITY = 'PRODUCT_AVAILABILITY',
  RATE_TIERS = 'RATE_TIERS',
  RECOMMENDATION_RULES = 'RECOMMENDATION_RULES',
  SUPPRESSION_RULES = 'SUPPRESSION_RULES',
  PRIORITY_TIERS = 'PRIORITY_TIERS',
  AB_TEST = 'AB_TEST',
}

/**
 * Notification timing configuration
 * Defines when notifications are sent relative to maturity
 */
export interface NotificationTimingConfig {
  intervals: NotificationInterval[];
}

export interface NotificationInterval {
  daysBeforeMaturity: number;
  channels: NotificationChannel[];
  templateId: string;
  priority: 'low' | 'medium' | 'high';
  enabled: boolean;
}

/**
 * Notification template with merge fields
 */
export interface NotificationTemplate {
  templateId: string;
  channel: NotificationChannel;
  subject: string; // for email
  body: string;
  ctaText: string;
  ctaUrl: string;
  mergeFields: string[]; // available: member_name, cert_balance, cert_rate, maturity_date, days_remaining
}

/**
 * Suppression rule — conditions under which notifications are NOT sent
 */
export interface SuppressionRule {
  ruleId: string;
  condition: SuppressionCondition;
  value: unknown;
  enabled: boolean;
  description: string;
}

export type SuppressionCondition =
  | 'balance_below'       // don't notify if balance < value
  | 'already_engaged'     // don't notify if member already viewed decision hub
  | 'action_taken'        // don't notify if member already acted
  | 'opt_out'             // member opted out of maturity notifications
  | 'do_not_contact'      // FI-level DNC flag
  | 'recent_notification' // don't notify if last notification was < X hours ago
  ;

/**
 * Priority tier definition — determines engagement intensity
 */
export interface PriorityTier {
  tierId: string;
  tierName: string;
  priority: number; // 1 = highest
  conditions: PriorityCondition[];
  actions: PriorityAction[];
}

export interface PriorityCondition {
  field: 'balance' | 'relationship_depth' | 'rate_gap' | 'first_maturity' | 'tenure';
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  value: unknown;
}

export interface PriorityAction {
  type: 'additional_notification' | 'enhanced_offer' | 'personal_outreach' | 'loyalty_premium';
  config: Record<string, unknown>;
}
