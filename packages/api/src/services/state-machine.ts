/**
 * Engagement State Machine Service
 * 
 * Manages the lifecycle of certificate maturity engagement states.
 * Enforces valid transitions and tracks state metadata.
 * 
 * States: DORMANT → NOTIFIED → ENGAGED → RESOLVED | EXPIRED
 */

type EngagementStatus = 'DORMANT' | 'NOTIFIED' | 'ENGAGED' | 'RESOLVED' | 'EXPIRED';
type NotificationChannel = 'PUSH' | 'EMAIL' | 'IN_APP' | 'SMS';
type ResolutionAction = 'renew_same' | 'renew_modified' | 'add_funds_renew' | 'ladder_created' | 'redirected' | 'withdrawn';

const VALID_TRANSITIONS: Record<EngagementStatus, EngagementStatus[]> = {
  DORMANT: ['NOTIFIED'],
  NOTIFIED: ['ENGAGED', 'EXPIRED'],
  ENGAGED: ['RESOLVED', 'EXPIRED'],
  RESOLVED: [],
  EXPIRED: [],
};

export interface EngagementRecord {
  engagementId: string;
  certId: string;
  memberId: string;
  status: EngagementStatus;
  enteredStateAt: string;
  notificationCount: number;
  lastNotificationAt: string | null;
  lastNotificationChannel: NotificationChannel | null;
  decisionHubViewedAt: string | null;
  actionTaken: ResolutionAction | null;
  actionTakenAt: string | null;
  actionDetails: Record<string, unknown> | null;
  outcomeBalance: number | null;
  outcomeRate: number | null;
  outcomeTerm: number | null;
  fundsAdded: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TransitionOptions {
  channel?: NotificationChannel;
  actionTaken?: ResolutionAction;
  actionDetails?: Record<string, unknown>;
}

interface ResolveOptions {
  actionTaken: ResolutionAction;
  actionDetails: Record<string, unknown>;
  outcomeBalance?: number;
  outcomeRate?: number;
  outcomeTerm?: number;
  fundsAdded?: number;
}

export class EngagementStateMachine {
  private engagements: Map<string, EngagementRecord> = new Map();
  private idCounter = 0;

  constructor() {
    // Initialize with sample engagement data
    this.initSampleData();
  }

  /**
   * Get all engagement records
   */
  getAllEngagements(): EngagementRecord[] {
    return Array.from(this.engagements.values());
  }

  /**
   * Get engagement record for a specific certificate
   */
  getEngagement(certId: string): EngagementRecord | undefined {
    return this.engagements.get(certId);
  }

  /**
   * Create a new engagement record for a certificate
   */
  createEngagement(certId: string, memberId: string): EngagementRecord {
    if (this.engagements.has(certId)) {
      throw new Error(`Engagement already exists for certificate ${certId}`);
    }

    const now = new Date().toISOString();
    const record: EngagementRecord = {
      engagementId: `eng-${++this.idCounter}`,
      certId,
      memberId,
      status: 'DORMANT',
      enteredStateAt: now,
      notificationCount: 0,
      lastNotificationAt: null,
      lastNotificationChannel: null,
      decisionHubViewedAt: null,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: now,
      updatedAt: now,
    };

    this.engagements.set(certId, record);
    return record;
  }

  /**
   * Transition an engagement to a new state
   */
  transition(certId: string, toStatus: EngagementStatus, options?: TransitionOptions): EngagementRecord {
    const record = this.engagements.get(certId);
    if (!record) {
      throw new Error(`No engagement found for certificate ${certId}`);
    }

    // Validate transition
    const validTargets = VALID_TRANSITIONS[record.status];
    if (!validTargets.includes(toStatus)) {
      throw new Error(
        `Invalid transition: ${record.status} → ${toStatus}. Valid targets: [${validTargets.join(', ')}]`
      );
    }

    const now = new Date().toISOString();
    record.status = toStatus;
    record.enteredStateAt = now;
    record.updatedAt = now;

    // Handle NOTIFIED transition
    if (toStatus === 'NOTIFIED' && options?.channel) {
      record.notificationCount++;
      record.lastNotificationAt = now;
      record.lastNotificationChannel = options.channel;
    }

    // Handle RESOLVED transition
    if (toStatus === 'RESOLVED' && options?.actionTaken) {
      record.actionTaken = options.actionTaken;
      record.actionTakenAt = now;
      record.actionDetails = options.actionDetails || null;
    }

    return { ...record };
  }

  /**
   * Record that a member viewed the decision hub
   * Transitions from NOTIFIED → ENGAGED
   */
  recordDecisionHubView(certId: string): EngagementRecord {
    const record = this.engagements.get(certId);
    if (!record) {
      throw new Error(`No engagement found for certificate ${certId}`);
    }

    const now = new Date().toISOString();
    record.decisionHubViewedAt = now;
    record.updatedAt = now;

    // Auto-transition to ENGAGED if currently NOTIFIED
    if (record.status === 'NOTIFIED') {
      record.status = 'ENGAGED';
      record.enteredStateAt = now;
    }

    return { ...record };
  }

  /**
   * Resolve an engagement — member took action
   * Transitions to RESOLVED with action details
   */
  resolve(certId: string, options: ResolveOptions): EngagementRecord {
    const record = this.engagements.get(certId);
    if (!record) {
      throw new Error(`No engagement found for certificate ${certId}`);
    }

    if (record.status === 'RESOLVED') {
      throw new Error(`Engagement for ${certId} is already resolved`);
    }

    if (record.status === 'EXPIRED') {
      throw new Error(`Engagement for ${certId} has expired and cannot be resolved`);
    }

    const now = new Date().toISOString();
    record.status = 'RESOLVED';
    record.enteredStateAt = now;
    record.actionTaken = options.actionTaken;
    record.actionTakenAt = now;
    record.actionDetails = options.actionDetails;
    record.outcomeBalance = options.outcomeBalance || null;
    record.outcomeRate = options.outcomeRate || null;
    record.outcomeTerm = options.outcomeTerm || null;
    record.fundsAdded = options.fundsAdded || null;
    record.updatedAt = now;

    return { ...record };
  }

  /**
   * Expire an engagement — grace period ended without action
   */
  expire(certId: string): EngagementRecord {
    const record = this.engagements.get(certId);
    if (!record) {
      throw new Error(`No engagement found for certificate ${certId}`);
    }

    if (record.status === 'RESOLVED') {
      throw new Error(`Cannot expire a resolved engagement`);
    }

    if (record.status === 'EXPIRED') {
      return { ...record }; // already expired, idempotent
    }

    const now = new Date().toISOString();
    record.status = 'EXPIRED';
    record.enteredStateAt = now;
    record.updatedAt = now;

    return { ...record };
  }

  /**
   * Check if a transition is valid
   */
  canTransition(certId: string, toStatus: EngagementStatus): boolean {
    const record = this.engagements.get(certId);
    if (!record) return false;
    return VALID_TRANSITIONS[record.status].includes(toStatus);
  }

  /**
   * Initialize with sample data matching the mock DBP adapter
   */
  private initSampleData() {
    const now = new Date().toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    // Alex's 12-month cert (maturing in 25 days) - NOTIFIED
    this.engagements.set('cert-001', {
      engagementId: 'eng-1',
      certId: 'cert-001',
      memberId: 'member-001',
      status: 'NOTIFIED',
      enteredStateAt: fiveDaysAgo,
      notificationCount: 2,
      lastNotificationAt: fiveDaysAgo,
      lastNotificationChannel: 'PUSH',
      decisionHubViewedAt: null,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    });

    // Jamie's 6-month cert (maturing in 12 days) - NOTIFIED
    this.engagements.set('cert-003', {
      engagementId: 'eng-2',
      certId: 'cert-003',
      memberId: 'member-002',
      status: 'NOTIFIED',
      enteredStateAt: twoDaysAgo,
      notificationCount: 3,
      lastNotificationAt: twoDaysAgo,
      lastNotificationChannel: 'EMAIL',
      decisionHubViewedAt: null,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    });

    // Pat's 36-month cert (maturing in 7 days) - NOTIFIED
    this.engagements.set('cert-004', {
      engagementId: 'eng-3',
      certId: 'cert-004',
      memberId: 'member-003',
      status: 'NOTIFIED',
      enteredStateAt: twoDaysAgo,
      notificationCount: 4,
      lastNotificationAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastNotificationChannel: 'EMAIL',
      decisionHubViewedAt: null,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    });

    // Sam's 12-month cert (maturing in 45 days) - DORMANT
    this.engagements.set('cert-005', {
      engagementId: 'eng-4',
      certId: 'cert-005',
      memberId: 'member-004',
      status: 'DORMANT',
      enteredStateAt: now,
      notificationCount: 0,
      lastNotificationAt: null,
      lastNotificationChannel: null,
      decisionHubViewedAt: null,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: now,
      updatedAt: now,
    });

    // Taylor's 60-month cert (maturing in 3 days) - ENGAGED
    this.engagements.set('cert-006', {
      engagementId: 'eng-5',
      certId: 'cert-006',
      memberId: 'member-005',
      status: 'ENGAGED',
      enteredStateAt: now,
      notificationCount: 5,
      lastNotificationAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastNotificationChannel: 'PUSH',
      decisionHubViewedAt: now,
      actionTaken: null,
      actionTakenAt: null,
      actionDetails: null,
      outcomeBalance: null,
      outcomeRate: null,
      outcomeTerm: null,
      fundsAdded: null,
      createdAt: fiveDaysAgo,
      updatedAt: now,
    });

    this.idCounter = 5;
  }
}
