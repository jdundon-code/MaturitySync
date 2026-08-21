/**
 * Database seed script
 * Populates the database with realistic sample data for development and demo
 *
 * Usage: npm run seed --workspace=packages/api
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as schema from './schema.js';

const { Pool } = pg;

// ===== SAMPLE DATA =====

const MEMBER_IDS = {
  alex: uuidv4(),
  jamie: uuidv4(),
  pat: uuidv4(),
  sam: uuidv4(),
  taylor: uuidv4(),
};

const CERT_IDS = {
  alex_12mo: uuidv4(),
  alex_24mo: uuidv4(),
  jamie_6mo: uuidv4(),
  pat_36mo: uuidv4(),
  sam_12mo: uuidv4(),
  taylor_60mo: uuidv4(),
};

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/certiq';
  
  console.log('🌱 Seeding database...');
  
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // Clear existing data
    await db.delete(schema.engagementEvents);
    await db.delete(schema.recommendations);
    await db.delete(schema.notificationLogs);
    await db.delete(schema.engagementStates);
    await db.delete(schema.fiConfigurations);
    await db.delete(schema.certificates);
    await db.delete(schema.members);
    console.log('   Cleared existing data.');

    // ===== MEMBERS =====
    await db.insert(schema.members).values([
      {
        memberId: MEMBER_IDS.alex,
        firstName: 'Alex',
        lastName: 'Martinez',
        email: 'alex.martinez@example.com',
        phone: '5551234567',
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        relationshipDepth: 'MODERATE',
        tenure: 48,
        dbpSourceId: 'dbp-member-001',
      },
      {
        memberId: MEMBER_IDS.jamie,
        firstName: 'Jamie',
        lastName: 'Chen',
        email: 'jamie.chen@example.com',
        phone: '5552345678',
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
        relationshipDepth: 'DEEP',
        tenure: 96,
        dbpSourceId: 'dbp-member-002',
      },
      {
        memberId: MEMBER_IDS.pat,
        firstName: 'Pat',
        lastName: 'Johnson',
        email: 'pat.johnson@example.com',
        phone: null,
        pushEnabled: false,
        emailEnabled: true,
        smsEnabled: false,
        relationshipDepth: 'SINGLE_PRODUCT',
        tenure: 14,
        dbpSourceId: 'dbp-member-003',
      },
      {
        memberId: MEMBER_IDS.sam,
        firstName: 'Sam',
        lastName: 'Williams',
        email: 'sam.williams@example.com',
        phone: '5553456789',
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        relationshipDepth: 'BASIC',
        tenure: 24,
        dbpSourceId: 'dbp-member-004',
      },
      {
        memberId: MEMBER_IDS.taylor,
        firstName: 'Taylor',
        lastName: 'Brooks',
        email: 'taylor.brooks@example.com',
        phone: '5554567890',
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
        relationshipDepth: 'DEEP',
        tenure: 120,
        dbpSourceId: 'dbp-member-005',
      },
    ]);
    console.log('   ✓ Members seeded (5)');

    // ===== CERTIFICATES =====
    await db.insert(schema.certificates).values([
      {
        certId: CERT_IDS.alex_12mo,
        memberId: MEMBER_IDS.alex,
        accountNumber: '****1234',
        balance: '25000.00',
        rateApy: '4.750',
        termMonths: 12,
        openDate: monthsAgo(11),
        maturityDate: daysFromNow(25),
        gracePeriodEndDate: daysFromNow(35),
        autoRenewalTerm: 12,
        dbpSourceId: 'dbp-cert-001',
      },
      {
        certId: CERT_IDS.alex_24mo,
        memberId: MEMBER_IDS.alex,
        accountNumber: '****1235',
        balance: '15000.00',
        rateApy: '4.500',
        termMonths: 24,
        openDate: monthsAgo(18),
        maturityDate: daysFromNow(180),
        gracePeriodEndDate: daysFromNow(190),
        autoRenewalTerm: 24,
        dbpSourceId: 'dbp-cert-002',
      },
      {
        certId: CERT_IDS.jamie_6mo,
        memberId: MEMBER_IDS.jamie,
        accountNumber: '****2345',
        balance: '50000.00',
        rateApy: '4.250',
        termMonths: 6,
        openDate: monthsAgo(5),
        maturityDate: daysFromNow(12),
        gracePeriodEndDate: daysFromNow(22),
        autoRenewalTerm: 6,
        dbpSourceId: 'dbp-cert-003',
      },
      {
        certId: CERT_IDS.pat_36mo,
        memberId: MEMBER_IDS.pat,
        accountNumber: '****3456',
        balance: '10000.00',
        rateApy: '4.800',
        termMonths: 36,
        openDate: monthsAgo(35),
        maturityDate: daysFromNow(7),
        gracePeriodEndDate: daysFromNow(17),
        autoRenewalTerm: 12,
        dbpSourceId: 'dbp-cert-004',
      },
      {
        certId: CERT_IDS.sam_12mo,
        memberId: MEMBER_IDS.sam,
        accountNumber: '****4567',
        balance: '8000.00',
        rateApy: '4.600',
        termMonths: 12,
        openDate: monthsAgo(11),
        maturityDate: daysFromNow(45),
        gracePeriodEndDate: daysFromNow(55),
        autoRenewalTerm: 12,
        dbpSourceId: 'dbp-cert-005',
      },
      {
        certId: CERT_IDS.taylor_60mo,
        memberId: MEMBER_IDS.taylor,
        accountNumber: '****5678',
        balance: '100000.00',
        rateApy: '5.000',
        termMonths: 60,
        openDate: monthsAgo(59),
        maturityDate: daysFromNow(3),
        gracePeriodEndDate: daysFromNow(13),
        autoRenewalTerm: 12,
        dbpSourceId: 'dbp-cert-006',
      },
    ]);
    console.log('   ✓ Certificates seeded (6)');

    // ===== ENGAGEMENT STATES =====
    await db.insert(schema.engagementStates).values([
      {
        certId: CERT_IDS.alex_12mo,
        memberId: MEMBER_IDS.alex,
        status: 'NOTIFIED',
        notificationCount: 2,
        lastNotificationAt: daysFromNow(-5),
        lastNotificationChannel: 'PUSH',
      },
      {
        certId: CERT_IDS.jamie_6mo,
        memberId: MEMBER_IDS.jamie,
        status: 'NOTIFIED',
        notificationCount: 3,
        lastNotificationAt: daysFromNow(-2),
        lastNotificationChannel: 'EMAIL',
      },
      {
        certId: CERT_IDS.pat_36mo,
        memberId: MEMBER_IDS.pat,
        status: 'NOTIFIED',
        notificationCount: 4,
        lastNotificationAt: daysFromNow(-1),
        lastNotificationChannel: 'EMAIL',
      },
      {
        certId: CERT_IDS.sam_12mo,
        memberId: MEMBER_IDS.sam,
        status: 'DORMANT',
        notificationCount: 0,
      },
      {
        certId: CERT_IDS.taylor_60mo,
        memberId: MEMBER_IDS.taylor,
        status: 'ENGAGED',
        notificationCount: 5,
        lastNotificationAt: daysFromNow(-1),
        lastNotificationChannel: 'PUSH',
        decisionHubViewedAt: daysFromNow(0),
      },
    ]);
    console.log('   ✓ Engagement states seeded (5)');

    // ===== FI CONFIGURATIONS =====
    const FI_ID = 'demo-credit-union';
    await db.insert(schema.fiConfigurations).values([
      {
        fiId: FI_ID,
        configType: 'NOTIFICATION_TIMING',
        configKey: 'maturity_notification_intervals',
        configValue: {
          intervals: [
            { daysBeforeMaturity: 60, channels: ['EMAIL'], priority: 'low', enabled: true },
            { daysBeforeMaturity: 30, channels: ['PUSH', 'EMAIL'], priority: 'medium', enabled: true },
            { daysBeforeMaturity: 15, channels: ['PUSH', 'EMAIL'], priority: 'medium', enabled: true },
            { daysBeforeMaturity: 7, channels: ['PUSH', 'EMAIL', 'IN_APP'], priority: 'high', enabled: true },
            { daysBeforeMaturity: 3, channels: ['PUSH', 'IN_APP'], priority: 'high', enabled: true },
            { daysBeforeMaturity: 1, channels: ['PUSH', 'IN_APP'], priority: 'high', enabled: true },
          ],
        },
        createdBy: 'system-init',
      },
      {
        fiId: FI_ID,
        configType: 'RATE_TIERS',
        configKey: 'certificate_rate_tiers',
        configValue: {
          tiers: [
            { termMonths: 6, minBalance: 1000, maxBalance: 9999, rateApy: 3.75 },
            { termMonths: 6, minBalance: 10000, maxBalance: 24999, rateApy: 4.00 },
            { termMonths: 6, minBalance: 25000, maxBalance: null, rateApy: 4.15 },
            { termMonths: 12, minBalance: 1000, maxBalance: 9999, rateApy: 4.00 },
            { termMonths: 12, minBalance: 10000, maxBalance: 24999, rateApy: 4.25 },
            { termMonths: 12, minBalance: 25000, maxBalance: 49999, rateApy: 4.35 },
            { termMonths: 12, minBalance: 50000, maxBalance: null, rateApy: 4.50 },
            { termMonths: 18, minBalance: 1000, maxBalance: 24999, rateApy: 4.20 },
            { termMonths: 18, minBalance: 25000, maxBalance: null, rateApy: 4.35 },
            { termMonths: 24, minBalance: 1000, maxBalance: 24999, rateApy: 4.25 },
            { termMonths: 24, minBalance: 25000, maxBalance: null, rateApy: 4.40 },
            { termMonths: 36, minBalance: 1000, maxBalance: 24999, rateApy: 4.30 },
            { termMonths: 36, minBalance: 25000, maxBalance: null, rateApy: 4.45 },
            { termMonths: 60, minBalance: 1000, maxBalance: 24999, rateApy: 4.35 },
            { termMonths: 60, minBalance: 25000, maxBalance: null, rateApy: 4.50 },
          ],
        },
        createdBy: 'system-init',
      },
      {
        fiId: FI_ID,
        configType: 'SUPPRESSION_RULES',
        configKey: 'default_suppression_rules',
        configValue: {
          rules: [
            { condition: 'balance_below', value: 500, enabled: true, description: 'Do not notify for certificates under $500' },
            { condition: 'already_engaged', value: true, enabled: true, description: 'Stop notifications after member views decision hub' },
            { condition: 'action_taken', value: true, enabled: true, description: 'Stop notifications after member takes action' },
            { condition: 'opt_out', value: true, enabled: true, description: 'Respect member opt-out preference' },
          ],
        },
        createdBy: 'system-init',
      },
      {
        fiId: FI_ID,
        configType: 'RECOMMENDATION_RULES',
        configKey: 'recommendation_settings',
        configValue: {
          balanceTierNudgeThreshold: 10000, // nudge if within $10K of next tier
          ladderSuggestionMinBalance: 15000, // suggest ladders for $15K+
          loyaltyPremiumBps: 10, // 0.10% loyalty premium
          preferredDefaultTerm: 12,
          enabledRules: ['BALANCE_TIER_NUDGE', 'TERM_OPTIMIZATION', 'LADDER_SUGGESTION', 'PRODUCT_CROSS_SELL', 'LOYALTY_RENEWAL', 'DEFAULT_RENEWAL'],
        },
        createdBy: 'system-init',
      },
    ]);
    console.log('   ✓ FI configurations seeded (4)');

    console.log('\n✅ Seed complete!');
    console.log(`   FI ID: ${FI_ID}`);
    console.log(`   Members: ${Object.keys(MEMBER_IDS).length}`);
    console.log(`   Certificates: ${Object.keys(CERT_IDS).length}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
