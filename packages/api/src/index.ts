/**
 * MaturitySync API Server
 * Fastify-based REST API for the certificate maturity engagement platform
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { certificateRoutes } from './routes/certificates.js';
import { engagementRoutes } from './routes/engagements.js';
import { recommendationRoutes } from './routes/recommendations.js';
import { configRoutes } from './routes/config.js';
import { analyticsRoutes } from './routes/analytics.js';
import { healthRoutes } from './routes/health.js';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

async function start() {
  // Plugins
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Routes
  await server.register(healthRoutes, { prefix: '/api' });
  await server.register(certificateRoutes, { prefix: '/api/certificates' });
  await server.register(engagementRoutes, { prefix: '/api/engagements' });
  await server.register(recommendationRoutes, { prefix: '/api/recommendations' });
  await server.register(configRoutes, { prefix: '/api/config' });
  await server.register(analyticsRoutes, { prefix: '/api/analytics' });

  // Start
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 3001;

  try {
    await server.listen({ host, port });
    server.log.info(`🚀 MaturitySync API running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

export { server };
