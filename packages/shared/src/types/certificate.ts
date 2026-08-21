/**
 * Core certificate/share certificate entity
 * Represents a time deposit product held by a member
 */
export interface Certificate {
  certId: string;
  memberId: string;
  accountNumber: string;
  balance: number;
  rateApy: number;
  termMonths: number;
  openDate: string; // ISO 8601
  maturityDate: string; // ISO 8601
  gracePeriodEndDate: string; // ISO 8601
  autoRenewalTerm: number | null; // months, null if no auto-renewal
  dbpSourceId: string; // reference ID in the digital banking platform
  lastSyncedAt: string; // ISO 8601
}

/**
 * Rate tier — defines balance thresholds and corresponding rates
 */
export interface RateTier {
  tierId: string;
  termMonths: number;
  minBalance: number;
  maxBalance: number | null; // null = no upper limit
  rateApy: number;
  isPromotional: boolean;
  effectiveFrom: string; // ISO 8601
  effectiveTo: string | null; // ISO 8601, null = no expiration
}

/**
 * Available certificate product/term offered by the FI
 */
export interface CertificateProduct {
  productId: string;
  termMonths: number;
  minDeposit: number;
  maxDeposit: number | null;
  rateTiers: RateTier[];
  isActive: boolean;
  displayName: string;
  description: string;
}

/**
 * Renewal action details — captures what the member chose
 */
export interface RenewalDetails {
  originalCertId: string;
  newTermMonths: number;
  newRateApy: number;
  newBalance: number;
  fundsAdded: number;
  fundSourceAccountId: string | null;
  renewalType: RenewalType;
}

export type RenewalType =
  | 'same_term'
  | 'modified_term'
  | 'add_funds'
  | 'ladder'
  | 'redirect'
  | 'withdraw';

/**
 * Ladder split — one segment of a certificate ladder
 */
export interface LadderSplit {
  termMonths: number;
  amount: number;
  rateApy: number;
  projectedMaturityDate: string; // ISO 8601
  projectedEarnings: number;
}

/**
 * Ladder creation details
 */
export interface LadderDetails {
  originalCertId: string;
  splits: LadderSplit[];
  totalAmount: number;
  weightedAverageRate: number;
  totalProjectedEarnings: number;
}
