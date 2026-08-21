/**
 * Recommendation Engine Service
 * 
 * Rule-based recommendation generation for Phase 1.
 * Evaluates member/certificate context and produces prioritized recommendations.
 */
import { MockCertificate, MockMember, MockRateTier } from '../adapters/mock-dbp.js';

export interface GeneratedRecommendation {
  recId: string;
  recType: string;
  priority: number;
  title: string;
  description: string;
  rationale: string;
  details: Record<string, unknown>;
}

export class RecommendationService {
  private config = {
    balanceTierNudgeThreshold: 10000,  // nudge if within $10K of next tier
    ladderSuggestionMinBalance: 15000, // suggest ladders for $15K+
    loyaltyPremiumBps: 10,             // 0.10% loyalty premium
    preferredDefaultTerm: 12,
  };

  generate(
    cert: MockCertificate,
    member: MockMember,
    rates: MockRateTier[],
  ): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];
    let priority = 1;

    // Rule 1: Balance tier nudge
    const tierNudge = this.evaluateBalanceTierNudge(cert, rates);
    if (tierNudge) {
      recommendations.push({ ...tierNudge, priority: priority++ });
    }

    // Rule 2: Ladder suggestion (for balances >= threshold)
    if (cert.balance >= this.config.ladderSuggestionMinBalance) {
      const ladder = this.evaluateLadderSuggestion(cert, rates);
      if (ladder) {
        recommendations.push({ ...ladder, priority: priority++ });
      }
    }

    // Rule 3: Product cross-sell (for single-product members)
    if (member.relationshipDepth === 'SINGLE_PRODUCT') {
      recommendations.push({
        recId: `rec-cross-${cert.certId}`,
        recType: 'PRODUCT_CROSS_SELL',
        priority: priority++,
        title: 'Consider a Money Market for flexibility',
        description: 'Earn 3.90% APY with no lock-up period. Great complement to your certificate.',
        rationale: 'You only have certificate products with us. A Money Market gives you competitive rates with daily access.',
        details: {
          type: 'product_cross_sell',
          productType: 'money_market',
          productName: 'Money Market Account',
          productRate: 3.90,
          benefits: ['No lock-up', 'Check writing', 'Unlimited access'],
        },
      });
    }

    // Rule 4: Loyalty renewal (for deep/long-tenure members)
    if (member.tenure >= 60 || member.relationshipDepth === 'DEEP') {
      const loyaltyRate = this.calculateLoyaltyRate(cert, rates);
      if (loyaltyRate) {
        recommendations.push({
          recId: `rec-loyalty-${cert.certId}`,
          recType: 'LOYALTY_RENEWAL',
          priority: priority++,
          title: 'Loyalty rate available',
          description: `As a valued member of ${member.tenure} months, you qualify for a ${loyaltyRate.rate}% APY loyalty rate.`,
          rationale: 'Your relationship depth qualifies you for a premium rate above our standard offering.',
          details: {
            type: 'loyalty_renewal',
            standardRate: loyaltyRate.standardRate,
            loyaltyRate: loyaltyRate.rate,
            premiumBps: this.config.loyaltyPremiumBps,
            termMonths: cert.termMonths,
            projectedEarnings: Math.round(cert.balance * (loyaltyRate.rate / 100) * (cert.termMonths / 12) * 100) / 100,
          },
        });
      }
    }

    // Rule 5: Default renewal (always present as fallback)
    const defaultRate = this.getDefaultRate(cert, rates);
    recommendations.push({
      recId: `rec-default-${cert.certId}`,
      recType: 'DEFAULT_RENEWAL',
      priority: priority++,
      title: `Renew at ${this.config.preferredDefaultTerm} months`,
      description: `Renew your certificate at ${defaultRate}% APY for ${this.config.preferredDefaultTerm} months.`,
      rationale: 'Standard renewal at our current best rate for your balance.',
      details: {
        type: 'default_renewal',
        termMonths: this.config.preferredDefaultTerm,
        rate: defaultRate,
        projectedEarnings: Math.round(cert.balance * (defaultRate / 100) * (this.config.preferredDefaultTerm / 12) * 100) / 100,
      },
    });

    return recommendations;
  }

  private evaluateBalanceTierNudge(
    cert: MockCertificate,
    rates: MockRateTier[],
  ): Omit<GeneratedRecommendation, 'priority'> | null {
    // Find rates for the same term with a higher minimum balance
    const sameTerm = rates.filter(r => r.termMonths === cert.termMonths);
    const nextTier = sameTerm
      .filter(r => r.minBalance > cert.balance)
      .sort((a, b) => a.minBalance - b.minBalance)[0];

    if (!nextTier) return null;

    const amountNeeded = nextTier.minBalance - cert.balance;
    if (amountNeeded > this.config.balanceTierNudgeThreshold) return null;

    const currentRate = sameTerm
      .filter(r => r.minBalance <= cert.balance && (!r.maxBalance || r.maxBalance >= cert.balance))
      .sort((a, b) => b.minBalance - a.minBalance)[0];

    const newBalance = nextTier.minBalance;
    const earnings = Math.round(newBalance * (nextTier.rateApy / 100) * (cert.termMonths / 12) * 100) / 100;

    return {
      recId: `rec-tier-${cert.certId}`,
      recType: 'BALANCE_TIER_NUDGE',
      title: `Add $${amountNeeded.toLocaleString()} to reach the ${nextTier.rateApy}% tier`,
      description: `Bring your balance to $${newBalance.toLocaleString()} to unlock a higher rate. Projected earnings: $${earnings.toLocaleString()}.`,
      rationale: `You're only $${amountNeeded.toLocaleString()} away from our next rate tier, which offers ${nextTier.rateApy}% APY vs your current ${currentRate?.rateApy || cert.rateApy}% renewal rate.`,
      details: {
        type: 'balance_tier_nudge',
        currentBalance: cert.balance,
        tierThreshold: nextTier.minBalance,
        amountNeeded,
        currentRate: currentRate?.rateApy || cert.rateApy,
        tierRate: nextTier.rateApy,
        projectedEarnings: earnings,
        termMonths: cert.termMonths,
      },
    };
  }

  private evaluateLadderSuggestion(
    cert: MockCertificate,
    rates: MockRateTier[],
  ): Omit<GeneratedRecommendation, 'priority'> | null {
    // Suggest a 3-rung ladder: 6mo, 12mo, 24mo
    const terms = [6, 12, 24];
    const splitAmount = Math.round(cert.balance / terms.length * 100) / 100;

    const splits = terms.map(term => {
      const rate = rates
        .filter(r => r.termMonths === term && r.minBalance <= splitAmount)
        .sort((a, b) => b.minBalance - a.minBalance)[0];
      return { term, amount: splitAmount, rate: rate?.rateApy || 0 };
    });

    const weightedRate = splits.reduce((sum, s) => sum + (s.rate * s.amount), 0) / cert.balance;
    const totalEarnings = splits.reduce((sum, s) => sum + (s.amount * (s.rate / 100) * (s.term / 12)), 0);

    return {
      recId: `rec-ladder-${cert.certId}`,
      recType: 'LADDER_SUGGESTION',
      title: 'Build a certificate ladder',
      description: `Split your $${cert.balance.toLocaleString()} across ${terms.length} terms for regular access and a ${(Math.round(weightedRate * 100) / 100)}% weighted rate.`,
      rationale: 'A ladder gives you access to a portion of funds every 6 months while maintaining competitive rates on the rest.',
      details: {
        type: 'ladder_suggestion',
        suggestedSplits: terms.length,
        terms,
        weightedRate: Math.round(weightedRate * 1000) / 1000,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        firstAccessMonths: terms[0],
      },
    };
  }

  private calculateLoyaltyRate(
    cert: MockCertificate,
    rates: MockRateTier[],
  ): { rate: number; standardRate: number } | null {
    const standardRate = rates
      .filter(r => r.termMonths === cert.termMonths && r.minBalance <= cert.balance && (!r.maxBalance || r.maxBalance >= cert.balance))
      .sort((a, b) => b.minBalance - a.minBalance)[0];

    if (!standardRate) return null;

    return {
      rate: Math.round((standardRate.rateApy + this.config.loyaltyPremiumBps / 100) * 1000) / 1000,
      standardRate: standardRate.rateApy,
    };
  }

  private getDefaultRate(cert: MockCertificate, rates: MockRateTier[]): number {
    const rate = rates
      .filter(r => r.termMonths === this.config.preferredDefaultTerm && r.minBalance <= cert.balance && (!r.maxBalance || r.maxBalance >= cert.balance))
      .sort((a, b) => b.minBalance - a.minBalance)[0];

    return rate?.rateApy || 4.00;
  }
}
