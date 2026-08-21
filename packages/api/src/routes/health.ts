import { FastifyInstance } from 'fastify';

export async function healthRoutes(server: FastifyInstance) {
  server.get('/health', async () => ({
    status: 'ok',
    service: 'certiq-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }));
}
