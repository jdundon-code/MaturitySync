import { FastifyInstance } from 'fastify';
import { RecommendationService } from '../services/recommendations.js';
import { mockDbpAdapter } from '../adapters/mock-dbp.js';

const recService = new RecommendationService();

export async function recommendationRoutes(server: FastifyInstance) {
  /**
   * GET /api/recommendations/:certId
   * Get personalized recommendations for a maturing certificate
   */
  server.get<{ Params: { certId: string } }>('/:certId', async (request, reply) => {
    const { certId } = request.params;
    const cert = mockDbpAdapter.getCertificate(certId);

    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    const member = mockDbpAdapter.getMember(cert.memberId);
    if (!member) {
      return reply.status(404).send({ error: 'Member not found' });
    }

    const rates = mockDbpAdapter.getRateSheet();
    const recommendations = recService.generate(cert, member, rates);

    return { data: recommendations };
  });

  /**
   * POST /api/recommendations/:recId/shown
   * Record that a recommendation was shown to the member
   */
  server.post<{ Params: { recId: string } }>('/:recId/shown', async (request) => {
    return {
      data: {
        recId: request.params.recId,
        shownAt: new Date().toISOString(),
        recorded: true,
      },
    };
  });

  /**
   * POST /api/recommendations/:recId/accept
   * Record that a member accepted a recommendation
   */
  server.post<{ Params: { recId: string } }>('/:recId/accept', async (request) => {
    return {
      data: {
        recId: request.params.recId,
        accepted: true,
        acceptedAt: new Date().toISOString(),
      },
    };
  });

  /**
   * POST /api/recommendations/:recId/dismiss
   * Record that a member dismissed a recommendation
   */
  server.post<{ Params: { recId: string } }>('/:recId/dismiss', async (request) => {
    return {
      data: {
        recId: request.params.recId,
        dismissed: true,
        dismissedAt: new Date().toISOString(),
      },
    };
  });
}
