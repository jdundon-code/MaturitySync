import { FastifyInstance } from 'fastify';

/**
 * Analytics routes — returns calculated metrics
 * In MVP, uses in-memory mock data. Production uses event store.
 */
export async function analyticsRoutes(server: FastifyInstance) {
  /**
   * GET /api/analytics/retention
   * Retention metrics dashboard data
   */
  server.get('/retention', async (request) => {
    const { period } = request.query as { period?: string };

    // Mock analytics data for MVP demonstration
    return {
      data: {
        period: period || 'last_30_days',
        overallRetentionRate: 0.87,
        engagedRetentionRate: 0.94,
        unengagedRetentionRate: 0.72,
        totalMaturingBalance: 2450000,
        retainedBalance: 2131500,
        attritionBalance: 318500,
        addOnDeposits: 185000,
        trend: [
          { month: '2026-03', rate: 0.82 },
          { month: '2026-04', rate: 0.84 },
          { month: '2026-05', rate: 0.85 },
          { month: '2026-06', rate: 0.87 },
          { month: '2026-07', rate: 0.89 },
          { month: '2026-08', rate: 0.87 },
        ],
      },
    };
  });

  /**
   * GET /api/analytics/funnel
   * Engagement funnel metrics
   */
  server.get('/funnel', async () => {
    return {
      data: {
        maturityApproaching: 142,
        notificationsSent: 426, // multiple per cert
        notificationsOpened: 298,
        decisionHubViewed: 89,
        actionTaken: 67,
        byChannel: {
          push: { sent: 213, opened: 170, clickThrough: 62 },
          email: { sent: 185, opened: 112, clickThrough: 34 },
          inApp: { sent: 28, opened: 16, clickThrough: 12 },
        },
        byInterval: {
          60: { sent: 42, opened: 15, actionRate: 0.05 },
          30: { sent: 84, opened: 52, actionRate: 0.12 },
          15: { sent: 78, opened: 61, actionRate: 0.18 },
          7: { sent: 120, opened: 98, actionRate: 0.28 },
          3: { sent: 68, opened: 52, actionRate: 0.35 },
          1: { sent: 34, opened: 20, actionRate: 0.41 },
        },
      },
    };
  });

  /**
   * GET /api/analytics/growth
   * Deposit growth attribution metrics
   */
  server.get('/growth', async () => {
    return {
      data: {
        totalAddOnDeposits: 185000,
        averageAddOnAmount: 4625,
        addOnRate: 0.28, // 28% of renewals included add-on funds
        balanceRetainedAboveBaseline: 412000,
        newProductOpenings: 12,
        ladderCreations: 8,
        byAction: {
          renew_same: { count: 34, totalBalance: 892000 },
          renew_modified: { count: 12, totalBalance: 445000 },
          add_funds_renew: { count: 15, totalBalance: 623000, fundsAdded: 185000 },
          ladder_created: { count: 8, totalBalance: 312000 },
          redirected: { count: 9, totalBalance: 178000 },
          withdrawn: { count: 4, totalBalance: 65000 },
        },
      },
    };
  });

  /**
   * GET /api/analytics/summary
   * Executive summary card data
   */
  server.get('/summary', async () => {
    return {
      data: {
        certificatesInWindow: 142,
        totalBalanceAtRisk: 4250000,
        retentionRate: 0.87,
        retentionRateChange: 0.05, // +5% vs prior period
        depositsRetained: 3697500,
        incrementalDeposits: 185000,
        engagementRate: 0.63,
        averageTimeToAction: 4.2, // days from first notification
      },
    };
  });
}
