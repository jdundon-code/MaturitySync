/**
 * Mock Digital Banking Platform (DBP) Adapter
 * 
 * Simulates the data that would come from a real digital banking platform.
 * This adapter provides realistic sample data for development, testing, and demos.
 * 
 * In production, this would be replaced with a real adapter that calls the DBP's APIs
 * for account data, member profiles, rate feeds, and transaction execution.
 */

export interface MockCertificate {
  certId: string;
  memberId: string;
  accountNumber: string;
  balance: number;
  rateApy: number;
  termMonths: number;
  openDate: string;
  maturityDate: string;
  gracePeriodEndDate: string;
  autoRenewalTerm: number;
  dbpSourceId: string;
}

export interface MockMember {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  relationshipDepth: string;
  tenure: number;
}

export interface MockLinkedAccount {
  accountId: string;
  accountType: string;
  accountNumber: string;
  displayName: string;
  availableBalance: number;
}

export interface MockRateTier {
  termMonths: number;
  minBalance: number;
  maxBalance: number | null;
  rateApy: number;
}

export interface MockProduct {
  productId: string;
  productType: string;
  displayName: string;
  rateApy: number;
  description: string;
  benefits: string[];
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

class MockDBPAdapter {
  private certificates: MockCertificate[] = [
    {
      certId: 'cert-001',
      memberId: 'member-001',
      accountNumber: '****1234',
      balance: 25000,
      rateApy: 4.75,
      termMonths: 12,
      openDate: monthsAgo(11),
      maturityDate: daysFromNow(25),
      gracePeriodEndDate: daysFromNow(35),
      autoRenewalTerm: 12,
      dbpSourceId: 'dbp-cert-001',
    },
    {
      certId: 'cert-002',
      memberId: 'member-001',
      accountNumber: '****1235',
      balance: 15000,
      rateApy: 4.50,
      termMonths: 24,
      openDate: monthsAgo(18),
      maturityDate: daysFromNow(180),
      gracePeriodEndDate: daysFromNow(190),
      autoRenewalTerm: 24,
      dbpSourceId: 'dbp-cert-002',
    },
    {
      certId: 'cert-003',
      memberId: 'member-002',
      accountNumber: '****2345',
      balance: 50000,
      rateApy: 4.25,
      termMonths: 6,
      openDate: monthsAgo(5),
      maturityDate: daysFromNow(12),
      gracePeriodEndDate: daysFromNow(22),
      autoRenewalTerm: 6,
      dbpSourceId: 'dbp-cert-003',
    },
    {
      certId: 'cert-004',
      memberId: 'member-003',
      accountNumber: '****3456',
      balance: 10000,
      rateApy: 4.80,
      termMonths: 36,
      openDate: monthsAgo(35),
      maturityDate: daysFromNow(7),
      gracePeriodEndDate: daysFromNow(17),
      autoRenewalTerm: 12,
      dbpSourceId: 'dbp-cert-004',
    },
    {
      certId: 'cert-005',
      memberId: 'member-004',
      accountNumber: '****4567',
      balance: 8000,
      rateApy: 4.60,
      termMonths: 12,
      openDate: monthsAgo(11),
      maturityDate: daysFromNow(45),
      gracePeriodEndDate: daysFromNow(55),
      autoRenewalTerm: 12,
      dbpSourceId: 'dbp-cert-005',
    },
    {
      certId: 'cert-006',
      memberId: 'member-005',
      accountNumber: '****5678',
      balance: 100000,
      rateApy: 5.00,
      termMonths: 60,
      openDate: monthsAgo(59),
      maturityDate: daysFromNow(3),
      gracePeriodEndDate: daysFromNow(13),
      autoRenewalTerm: 12,
      dbpSourceId: 'dbp-cert-006',
    },
  ];

  private members: MockMember[] = [
    {
      memberId: 'member-001',
      firstName: 'Alex',
      lastName: 'Martinez',
      email: 'alex.martinez@example.com',
      phone: '5551234567',
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      relationshipDepth: 'MODERATE',
      tenure: 48,
    },
    {
      memberId: 'member-002',
      firstName: 'Jamie',
      lastName: 'Chen',
      email: 'jamie.chen@example.com',
      phone: '5552345678',
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      relationshipDepth: 'DEEP',
      tenure: 96,
    },
    {
      memberId: 'member-003',
      firstName: 'Pat',
      lastName: 'Johnson',
      email: 'pat.johnson@example.com',
      phone: null,
      pushEnabled: false,
      emailEnabled: true,
      smsEnabled: false,
      relationshipDepth: 'SINGLE_PRODUCT',
      tenure: 14,
    },
    {
      memberId: 'member-004',
      firstName: 'Sam',
      lastName: 'Williams',
      email: 'sam.williams@example.com',
      phone: '5553456789',
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      relationshipDepth: 'BASIC',
      tenure: 24,
    },
    {
      memberId: 'member-005',
      firstName: 'Taylor',
      lastName: 'Brooks',
      email: 'taylor.brooks@example.com',
      phone: '5554567890',
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      relationshipDepth: 'DEEP',
      tenure: 120,
    },
  ];

  private linkedAccounts: Record<string, MockLinkedAccount[]> = {
    'member-001': [
      { accountId: 'acct-001a', accountType: 'checking', accountNumber: '****5678', displayName: 'Primary Checking', availableBalance: 12450.32 },
      { accountId: 'acct-001b', accountType: 'savings', accountNumber: '****9012', displayName: 'Savings', availableBalance: 8200.00 },
    ],
    'member-002': [
      { accountId: 'acct-002a', accountType: 'checking', accountNumber: '****6789', displayName: 'Checking', availableBalance: 34500.00 },
      { accountId: 'acct-002b', accountType: 'savings', accountNumber: '****0123', displayName: 'Premium Savings', availableBalance: 28750.00 },
      { accountId: 'acct-002c', accountType: 'money_market', accountNumber: '****1234', displayName: 'Money Market', availableBalance: 75000.00 },
    ],
    'member-003': [
      { accountId: 'acct-003a', accountType: 'checking', accountNumber: '****7890', displayName: 'Checking', availableBalance: 3200.00 },
    ],
    'member-004': [
      { accountId: 'acct-004a', accountType: 'checking', accountNumber: '****8901', displayName: 'Checking', availableBalance: 5600.00 },
      { accountId: 'acct-004b', accountType: 'savings', accountNumber: '****2345', displayName: 'Savings', availableBalance: 2100.00 },
    ],
    'member-005': [
      { accountId: 'acct-005a', accountType: 'checking', accountNumber: '****9012', displayName: 'Primary Checking', availableBalance: 45000.00 },
      { accountId: 'acct-005b', accountType: 'savings', accountNumber: '****3456', displayName: 'Savings', availableBalance: 22000.00 },
      { accountId: 'acct-005c', accountType: 'money_market', accountNumber: '****4567', displayName: 'Money Market Plus', availableBalance: 120000.00 },
      { accountId: 'acct-005d', accountType: 'ira', accountNumber: '****5678', displayName: 'IRA', availableBalance: 85000.00 },
    ],
  };

  private rateTiers: MockRateTier[] = [
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
  ];

  private alternativeProducts: MockProduct[] = [
    {
      productId: 'prod-mm-01',
      productType: 'money_market',
      displayName: 'Money Market Account',
      rateApy: 3.90,
      description: 'Earn competitive rates with unlimited access to your funds.',
      benefits: ['No lock-up period', 'Check-writing privileges', 'NCUA insured'],
    },
    {
      productId: 'prod-hys-01',
      productType: 'high_yield_savings',
      displayName: 'High-Yield Savings',
      rateApy: 4.10,
      description: 'Earn more on your savings with 6 transactions per month.',
      benefits: ['4.10% APY', '6 monthly transactions', 'Great for emergency funds'],
    },
    {
      productId: 'prod-ira-01',
      productType: 'ira_certificate',
      displayName: 'IRA Certificate',
      rateApy: 4.55,
      description: 'Tax-advantaged growth for your retirement savings.',
      benefits: ['Tax-deferred growth', 'Higher rates than standard CDs', 'Flexible terms'],
    },
  ];

  // ===== PUBLIC API =====

  getCertificates(): MockCertificate[] {
    return [...this.certificates];
  }

  getCertificate(certId: string): MockCertificate | undefined {
    return this.certificates.find(c => c.certId === certId);
  }

  getMember(memberId: string): MockMember | undefined {
    return this.members.find(m => m.memberId === memberId);
  }

  getLinkedAccounts(memberId: string): MockLinkedAccount[] {
    return this.linkedAccounts[memberId] || [];
  }

  getRateSheet(): MockRateTier[] {
    return [...this.rateTiers];
  }

  getAlternativeProducts(): MockProduct[] {
    return [...this.alternativeProducts];
  }

  getRateForBalanceAndTerm(balance: number, termMonths: number): MockRateTier | undefined {
    return this.rateTiers
      .filter(r => r.termMonths === termMonths && r.minBalance <= balance && (!r.maxBalance || r.maxBalance >= balance))
      .sort((a, b) => b.minBalance - a.minBalance)[0];
  }
}

// Singleton instance
export const mockDbpAdapter = new MockDBPAdapter();
