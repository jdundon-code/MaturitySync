import { FastifyInstance } from 'fastify';
import { EngagementStateMachine } from '../services/state-machine.js';

const stateMachine = new EngagementStateMachine();

export async function engagementRoutes(server: FastifyInstance) {
  /**
   * GET /api/engagements
   * List engagement states (optionally filtered)
   */
  server.get('/', async (request) => {
    const { memberId, status } = request.query as {
      memberId?: string;
      status?: string;
    };

    let engagements = stateMachine.getAllEngagements();

    if (memberId) {
      engagements = engagements.filter(e => e.memberId === memberId);
    }
    if (status) {
      engagements = engagements.filter(e => e.status === status);
    }

    return { data: engagements, total: engagements.length };
  });

  /**
   * GET /api/engagements/:certId
   * Get engagement state for a specific certificate
   */
  server.get<{ Params: { certId: string } }>('/:certId', async (request, reply) => {
    const { certId } = request.params;
    const engagement = stateMachine.getEngagement(certId);

    if (!engagement) {
      return reply.status(404).send({ error: 'Engagement not found for this certificate' });
    }

    return { data: engagement };
  });

  /**
   * POST /api/engagements/:certId/transition
   * Trigger a state transition for a certificate engagement
   */
  server.post<{
    Params: { certId: string };
    Body: {
      toStatus: string;
      channel?: string;
      actionTaken?: string;
      actionDetails?: Record<string, unknown>;
    };
  }>('/:certId/transition', async (request, reply) => {
    const { certId } = request.params;
    const { toStatus, channel, actionTaken, actionDetails } = request.body;

    try {
      const result = stateMachine.transition(certId, toStatus as any, {
        channel: channel as any,
        actionTaken: actionTaken as any,
        actionDetails,
      });
      return { data: result };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  /**
   * POST /api/engagements/:certId/view
   * Record that a member viewed the decision hub for this certificate
   */
  server.post<{ Params: { certId: string } }>('/:certId/view', async (request, reply) => {
    const { certId } = request.params;

    try {
      const result = stateMachine.recordDecisionHubView(certId);
      return { data: result };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  /**
   * POST /api/engagements/:certId/resolve
   * Record that a member took action on a maturing certificate
   */
  server.post<{
    Params: { certId: string };
    Body: {
      actionTaken: string;
      actionDetails: Record<string, unknown>;
      outcomeBalance?: number;
      outcomeRate?: number;
      outcomeTerm?: number;
      fundsAdded?: number;
    };
  }>('/:certId/resolve', async (request, reply) => {
    const { certId } = request.params;
    const body = request.body;

    try {
      const result = stateMachine.resolve(certId, {
        actionTaken: body.actionTaken as any,
        actionDetails: body.actionDetails,
        outcomeBalance: body.outcomeBalance,
        outcomeRate: body.outcomeRate,
        outcomeTerm: body.outcomeTerm,
        fundsAdded: body.fundsAdded,
      });
      return { data: result };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
