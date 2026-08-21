import { FastifyInstance } from 'fastify';
import { mockDbpAdapter } from '../adapters/mock-dbp.js';

export async function certificateRoutes(server: FastifyInstance) {
  /**
   * GET /api/certificates
   * List all certificates (optionally filtered)
   */
  server.get('/', async (request) => {
    const { memberId, maturityWindow } = request.query as {
      memberId?: string;
      maturityWindow?: number; // days from now
    };

    let certs = mockDbpAdapter.getCertificates();

    if (memberId) {
      certs = certs.filter(c => c.memberId === memberId);
    }

    if (maturityWindow) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + maturityWindow);
      certs = certs.filter(c => new Date(c.maturityDate) <= cutoff);
    }

    return { data: certs, total: certs.length };
  });

  /**
   * GET /api/certificates/:certId
   * Get a single certificate with full details
   */
  server.get<{ Params: { certId: string } }>('/:certId', async (request, reply) => {
    const { certId } = request.params;
    const cert = mockDbpAdapter.getCertificate(certId);

    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    return { data: cert };
  });

  /**
   * GET /api/certificates/:certId/maturity-options
   * Get available options for a maturing certificate
   */
  server.get<{ Params: { certId: string } }>('/:certId/maturity-options', async (request, reply) => {
    const { certId } = request.params;
    const cert = mockDbpAdapter.getCertificate(certId);

    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    const rates = mockDbpAdapter.getRateSheet();
    const linkedAccounts = mockDbpAdapter.getLinkedAccounts(cert.memberId);

    // Calculate options based on current balance and rates
    const renewalOptions = rates.map(r => ({
      termMonths: r.termMonths,
      rateApy: r.rateApy,
      projectedEarnings: Math.round(cert.balance * (r.rateApy / 100) * (r.termMonths / 12) * 100) / 100,
      maturityDate: calculateMaturityDate(r.termMonths),
      isCurrentTerm: r.termMonths === cert.termMonths,
    }));

    // Find next rate tier
    const currentTierRates = rates.filter(r => r.termMonths === cert.termMonths);
    const nextTier = currentTierRates.find(r => r.minBalance > cert.balance);
    const tierNudge = nextTier ? {
      amountNeeded: nextTier.minBalance - cert.balance,
      tierRate: nextTier.rateApy,
      currentRate: currentTierRates.find(r => r.minBalance <= cert.balance && (!r.maxBalance || r.maxBalance >= cert.balance))?.rateApy || cert.rateApy,
    } : null;

    return {
      data: {
        certificate: cert,
        renewalOptions,
        tierNudge,
        linkedAccounts,
        alternativeProducts: mockDbpAdapter.getAlternativeProducts(),
      },
    };
  });

  /**
   * POST /api/certificates/:certId/renew
   * Execute a certificate renewal
   */
  server.post<{
    Params: { certId: string };
    Body: {
      termMonths: number;
      addFundsAmount?: number;
      fundSourceAccountId?: string;
    };
  }>('/:certId/renew', async (request, reply) => {
    const { certId } = request.params;
    const { termMonths, addFundsAmount, fundSourceAccountId } = request.body;

    const cert = mockDbpAdapter.getCertificate(certId);
    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    const newBalance = cert.balance + (addFundsAmount || 0);
    const rates = mockDbpAdapter.getRateSheet();
    const applicableRate = rates
      .filter(r => r.termMonths === termMonths && r.minBalance <= newBalance)
      .sort((a, b) => b.minBalance - a.minBalance)[0];

    if (!applicableRate) {
      return reply.status(400).send({ error: 'No rate available for this term and balance combination' });
    }

    const result = {
      certId,
      action: addFundsAmount ? 'add_funds_renew' : (termMonths === cert.termMonths ? 'renew_same' : 'renew_modified'),
      newBalance,
      newRate: applicableRate.rateApy,
      newTermMonths: termMonths,
      newMaturityDate: calculateMaturityDate(termMonths),
      projectedEarnings: Math.round(newBalance * (applicableRate.rateApy / 100) * (termMonths / 12) * 100) / 100,
      fundsAdded: addFundsAmount || 0,
      fundSource: fundSourceAccountId || null,
      executedAt: new Date().toISOString(),
    };

    server.log.info({ certId, action: result.action }, 'Certificate renewed');
    return { data: result };
  });

  /**
   * POST /api/certificates/:certId/ladder
   * Create a certificate ladder from a maturing certificate
   */
  server.post<{
    Params: { certId: string };
    Body: {
      splits: Array<{ termMonths: number; amount: number }>;
    };
  }>('/:certId/ladder', async (request, reply) => {
    const { certId } = request.params;
    const { splits } = request.body;

    const cert = mockDbpAdapter.getCertificate(certId);
    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    const totalAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(totalAmount - cert.balance) > 0.01) {
      return reply.status(400).send({ error: 'Split amounts must equal the certificate balance' });
    }

    const rates = mockDbpAdapter.getRateSheet();
    const ladderResult = splits.map(split => {
      const rate = rates
        .filter(r => r.termMonths === split.termMonths && r.minBalance <= split.amount)
        .sort((a, b) => b.minBalance - a.minBalance)[0];

      return {
        termMonths: split.termMonths,
        amount: split.amount,
        rateApy: rate?.rateApy || 0,
        maturityDate: calculateMaturityDate(split.termMonths),
        projectedEarnings: Math.round(split.amount * ((rate?.rateApy || 0) / 100) * (split.termMonths / 12) * 100) / 100,
      };
    });

    const weightedRate = ladderResult.reduce((sum, s) => sum + (s.rateApy * s.amount), 0) / totalAmount;

    const result = {
      certId,
      action: 'ladder_created',
      splits: ladderResult,
      totalAmount,
      weightedAverageRate: Math.round(weightedRate * 1000) / 1000,
      totalProjectedEarnings: ladderResult.reduce((sum, s) => sum + s.projectedEarnings, 0),
      executedAt: new Date().toISOString(),
    };

    server.log.info({ certId, numSplits: splits.length }, 'Certificate ladder created');
    return { data: result };
  });

  /**
   * POST /api/certificates/:certId/redirect
   * Transfer maturing certificate funds to another account
   */
  server.post<{
    Params: { certId: string };
    Body: {
      destinationAccountId: string;
      amount: number;
    };
  }>('/:certId/redirect', async (request, reply) => {
    const { certId } = request.params;
    const { destinationAccountId, amount } = request.body;

    const cert = mockDbpAdapter.getCertificate(certId);
    if (!cert) {
      return reply.status(404).send({ error: 'Certificate not found' });
    }

    if (amount > cert.balance) {
      return reply.status(400).send({ error: 'Amount exceeds certificate balance' });
    }

    const destination = mockDbpAdapter.getLinkedAccounts(cert.memberId)
      .find(a => a.accountId === destinationAccountId);

    const result = {
      certId,
      action: 'redirected',
      amount,
      remainingBalance: cert.balance - amount,
      destinationAccountId,
      destinationName: destination?.displayName || 'Unknown Account',
      executedAt: new Date().toISOString(),
    };

    server.log.info({ certId, amount, destinationAccountId }, 'Certificate funds redirected');
    return { data: result };
  });
}

function calculateMaturityDate(termMonths: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + termMonths);
  return d.toISOString();
}
