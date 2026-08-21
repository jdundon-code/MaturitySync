/**
 * Member profile — represents the credit union/bank member
 * Data sourced from the digital banking platform
 */
export interface Member {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  relationshipDepth: RelationshipDepth;
  accountIds: string[]; // all accounts held
  tenure: number; // months as a member
  createdAt: string; // ISO 8601
}

/**
 * Relationship depth scoring
 * Used for recommendation and priority logic
 */
export enum RelationshipDepth {
  /** Only certificate products */
  SINGLE_PRODUCT = 'SINGLE_PRODUCT',
  /** Certificate + 1 other product */
  BASIC = 'BASIC',
  /** Certificate + checking + savings or similar */
  MODERATE = 'MODERATE',
  /** Full relationship: checking, savings, loans, etc. */
  DEEP = 'DEEP',
}

/**
 * Linked account summary — for displaying transfer options
 */
export interface LinkedAccount {
  accountId: string;
  accountType: AccountType;
  accountNumber: string; // masked, e.g., "****5678"
  displayName: string;
  availableBalance: number;
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'money_market'
  | 'certificate'
  | 'ira'
  | 'loan';
