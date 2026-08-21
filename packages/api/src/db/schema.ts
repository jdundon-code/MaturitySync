/**
 * MaturitySync Database Schema — Drizzle ORM
 * PostgreSQL implementation of the data model from the design spec
 */
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  text,
} from 'drizzle-orm/pg-core';

// ===== ENUMS =====

export const engagementStatusEnum = pgEnum('engagement_status', [
  'DORMANT',
  'NOTIFIED',
  'ENGAGED',
  'RESOLVED',
  'EXPIRED',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'PUSH',
  'EMAIL',
  'IN_APP',
  'SMS',
]);

export const resolutionActionEnum = pgEnum('resolution_action', [
  'renew_same',
  'renew_modified',
  'add_funds_renew',
  'ladder_created',
  'redirected',
  'withdrawn',
]);

export const recommendationTypeEnum = pgEnum('recommendation_type', [
  'BALANCE_TIER_NUDGE',
  'TERM_OPTIMIZATION',
  'LADDER_SUGGESTION',
  'PRODUCT_CROSS_SELL',
  'LOYALTY_RENEWAL',
  'DEFAULT_RENEWAL',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'maturity.approaching',
  'notification.sent',
  'notification.opened',
  'decision_hub.viewed',
  'recommendation.shown',
  'recommendation.accepted',
  'recommendation.dismissed',
  'action.renew_same',
  'action.renew_modified',
  'action.add_funds',
  'action.ladder_created',
  'action.redirected',
  'action.withdrawn',
  'maturity.expired_no_action',
]);

export const eventSourceEnum = pgEnum('event_source', [
  'push_notification',
  'email_link',
  'in_app_banner',
  'account_detail',
  'direct_navigation',
]);

export const configTypeEnum = pgEnum('config_type', [
  'NOTIFICATION_TIMING',
  'NOTIFICATION_TEMPLATE',
  'CHANNEL_SETTINGS',
  'PRODUCT_AVAILABILITY',
  'RATE_TIERS',
  'RECOMMENDATION_RULES',
  'SUPPRESSION_RULES',
  'PRIORITY_TIERS',
  'AB_TEST',
]);

export const relationshipDepthEnum = pgEnum('relationship_depth', [
  'SINGLE_PRODUCT',
  'BASIC',
  'MODERATE',
  'DEEP',
]);

// ===== TABLES =====

/**
 * Certificates — synced from the digital banking platform
 */
export const certificates = pgTable('certificates', {
  certId: uuid('cert_id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').notNull(),
  accountNumber: varchar('account_number', { length: 32 }).notNull(),
  balance: numeric('balance', { precision: 14, scale: 2 }).notNull(),
  rateApy: numeric('rate_apy', { precision: 5, scale: 3 }).notNull(),
  termMonths: integer('term_months').notNull(),
  openDate: timestamp('open_date', { withTimezone: true }).notNull(),
  maturityDate: timestamp('maturity_date', { withTimezone: true }).notNull(),
  gracePeriodEndDate: timestamp('grace_period_end_date', { withTimezone: true }).notNull(),
  autoRenewalTerm: integer('auto_renewal_term'),
  dbpSourceId: varchar('dbp_source_id', { length: 128 }).notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  memberIdx: index('certificates_member_id_idx').on(table.memberId),
  maturityIdx: index('certificates_maturity_date_idx').on(table.maturityDate),
  dbpSourceIdx: index('certificates_dbp_source_id_idx').on(table.dbpSourceId),
}));

/**
 * Members — synced from the digital banking platform
 */
export const members = pgTable('members', {
  memberId: uuid('member_id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  pushEnabled: boolean('push_enabled').notNull().default(true),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  smsEnabled: boolean('sms_enabled').notNull().default(false),
  relationshipDepth: relationshipDepthEnum('relationship_depth').notNull().default('SINGLE_PRODUCT'),
  tenure: integer('tenure').notNull().default(0), // months
  dbpSourceId: varchar('dbp_source_id', { length: 128 }).notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('members_email_idx').on(table.email),
  dbpSourceIdx: index('members_dbp_source_id_idx').on(table.dbpSourceId),
}));

/**
 * Engagement states — one per certificate maturity event
 */
export const engagementStates = pgTable('engagement_states', {
  engagementId: uuid('engagement_id').primaryKey().defaultRandom(),
  certId: uuid('cert_id').notNull().references(() => certificates.certId),
  memberId: uuid('member_id').notNull().references(() => members.memberId),
  status: engagementStatusEnum('status').notNull().default('DORMANT'),
  enteredStateAt: timestamp('entered_state_at', { withTimezone: true }).notNull().defaultNow(),
  notificationCount: integer('notification_count').notNull().default(0),
  lastNotificationAt: timestamp('last_notification_at', { withTimezone: true }),
  lastNotificationChannel: notificationChannelEnum('last_notification_channel'),
  decisionHubViewedAt: timestamp('decision_hub_viewed_at', { withTimezone: true }),
  actionTaken: resolutionActionEnum('action_taken'),
  actionTakenAt: timestamp('action_taken_at', { withTimezone: true }),
  actionDetails: jsonb('action_details'),
  outcomeBalance: numeric('outcome_balance', { precision: 14, scale: 2 }),
  outcomeRate: numeric('outcome_rate', { precision: 5, scale: 3 }),
  outcomeTerm: integer('outcome_term'),
  fundsAdded: numeric('funds_added', { precision: 14, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  certIdx: index('engagement_states_cert_id_idx').on(table.certId),
  memberIdx: index('engagement_states_member_id_idx').on(table.memberId),
  statusIdx: index('engagement_states_status_idx').on(table.status),
}));

/**
 * Notification log — tracks all notifications sent
 */
export const notificationLogs = pgTable('notification_logs', {
  logId: uuid('log_id').primaryKey().defaultRandom(),
  certId: uuid('cert_id').notNull().references(() => certificates.certId),
  memberId: uuid('member_id').notNull().references(() => members.memberId),
  channel: notificationChannelEnum('channel').notNull(),
  intervalDays: integer('interval_days').notNull(),
  templateId: varchar('template_id', { length: 64 }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  suppressed: boolean('suppressed').notNull().default(false),
  suppressionReason: varchar('suppression_reason', { length: 128 }),
}, (table) => ({
  certIdx: index('notification_logs_cert_id_idx').on(table.certId),
  memberIdx: index('notification_logs_member_id_idx').on(table.memberId),
  sentAtIdx: index('notification_logs_sent_at_idx').on(table.sentAt),
}));

/**
 * Recommendations — generated per certificate maturity event
 */
export const recommendations = pgTable('recommendations', {
  recId: uuid('rec_id').primaryKey().defaultRandom(),
  certId: uuid('cert_id').notNull().references(() => certificates.certId),
  memberId: uuid('member_id').notNull().references(() => members.memberId),
  recType: recommendationTypeEnum('rec_type').notNull(),
  priority: integer('priority').notNull().default(1),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull(),
  rationale: text('rationale').notNull(),
  details: jsonb('details').notNull(),
  shownAt: timestamp('shown_at', { withTimezone: true }),
  accepted: boolean('accepted').notNull().default(false),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  dismissed: boolean('dismissed').notNull().default(false),
  dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  certIdx: index('recommendations_cert_id_idx').on(table.certId),
  memberIdx: index('recommendations_member_id_idx').on(table.memberId),
  typeIdx: index('recommendations_rec_type_idx').on(table.recType),
}));

/**
 * FI Configuration — admin-managed settings
 */
export const fiConfigurations = pgTable('fi_configurations', {
  configId: uuid('config_id').primaryKey().defaultRandom(),
  fiId: varchar('fi_id', { length: 64 }).notNull(),
  configType: configTypeEnum('config_type').notNull(),
  configKey: varchar('config_key', { length: 128 }).notNull(),
  configValue: jsonb('config_value').notNull(),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull().defaultNow(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  createdBy: varchar('created_by', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  fiIdx: index('fi_configurations_fi_id_idx').on(table.fiId),
  typeIdx: index('fi_configurations_config_type_idx').on(table.configType),
  keyIdx: index('fi_configurations_config_key_idx').on(table.configKey),
}));

/**
 * Engagement events — append-only event log for analytics
 */
export const engagementEvents = pgTable('engagement_events', {
  eventId: uuid('event_id').primaryKey().defaultRandom(),
  certId: uuid('cert_id').notNull().references(() => certificates.certId),
  memberId: uuid('member_id').notNull().references(() => members.memberId),
  eventType: eventTypeEnum('event_type').notNull(),
  eventData: jsonb('event_data').notNull().default({}),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  sessionId: varchar('session_id', { length: 128 }),
  source: eventSourceEnum('source'),
}, (table) => ({
  certIdx: index('engagement_events_cert_id_idx').on(table.certId),
  memberIdx: index('engagement_events_member_id_idx').on(table.memberId),
  typeIdx: index('engagement_events_event_type_idx').on(table.eventType),
  timestampIdx: index('engagement_events_timestamp_idx').on(table.timestamp),
}));
