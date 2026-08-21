import { FastifyInstance } from 'fastify';
import { mockDbpAdapter } from '../adapters/mock-dbp.js';

export async function configRoutes(server: FastifyInstance) {
  /**
   * GET /api/config/rates
   * Get current rate sheet
   */
  server.get('/rates', async () => {
    return { data: mockDbpAdapter.getRateSheet() };
  });

  /**
   * GET /api/config/notification-timing
   * Get notification timing configuration
   */
  server.get('/notification-timing', async () => {
    return {
      data: {
        intervals: [
          { daysBeforeMaturity: 60, channels: ['EMAIL'], priority: 'low', enabled: true },
          { daysBeforeMaturity: 30, channels: ['PUSH', 'EMAIL'], priority: 'medium', enabled: true },
          { daysBeforeMaturity: 15, channels: ['PUSH', 'EMAIL'], priority: 'medium', enabled: true },
          { daysBeforeMaturity: 7, channels: ['PUSH', 'EMAIL', 'IN_APP'], priority: 'high', enabled: true },
          { daysBeforeMaturity: 3, channels: ['PUSH', 'IN_APP'], priority: 'high', enabled: true },
          { daysBeforeMaturity: 1, channels: ['PUSH', 'IN_APP'], priority: 'high', enabled: true },
        ],
      },
    };
  });

  /**
   * PUT /api/config/notification-timing
   * Update notification timing configuration
   */
  server.put('/notification-timing', async (request) => {
    const body = request.body as any;
    // In production: persist to FI configurations table
    server.log.info({ intervals: body.intervals?.length }, 'Notification timing updated');
    return { data: body, updated: true };
  });

  /**
   * GET /api/config/suppression-rules
   * Get suppression rules
   */
  server.get('/suppression-rules', async () => {
    return {
      data: {
        rules: [
          { condition: 'balance_below', value: 500, enabled: true, description: 'Do not notify for certificates under $500' },
          { condition: 'already_engaged', value: true, enabled: true, description: 'Stop notifications after member views decision hub' },
          { condition: 'action_taken', value: true, enabled: true, description: 'Stop notifications after member takes action' },
          { condition: 'opt_out', value: true, enabled: true, description: 'Respect member opt-out preference' },
        ],
      },
    };
  });

  /**
   * GET /api/config/products
   * Get available products for recommendation
   */
  server.get('/products', async () => {
    return { data: mockDbpAdapter.getAlternativeProducts() };
  });
}
