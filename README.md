# MaturitySync

## What I Built and Why

MaturitySync is a proactive engagement layer that sits on top of a Digital Banking Platform (DBP), turning certificate (CD) maturity from a passive back-office transaction into a strategic growth opportunity.

**The Problem:** Financial Institutions (FIs) typically treat certificate maturity as a batch process, automatically rolling them over with little to no account holder interaction. This passive approach results in a massive loss of potential deposits (an estimated $45M gap per institution annually) due to attrition, missed cross-sell opportunities, and uncaptured external funds.

**The Solution:** FIs that treat maturity as an engagement opportunity outperform those that don't. MaturitySync provides a digital self-service decision hub, intelligent recommendations, and automated notification orchestration to engage users before their certificates auto-roll.

### Pain Points

**For the financial institution,** the pain isn't just a missed opportunity; it is an active threat to their balance sheet and liquidity.

- **Core Systems Aren't Engagement Engines:** Legacy banking cores are built for ledger math, not human interaction. Relying on them for maturity handling guarantees a sterile, transactional experience that fails to defend against modern challenger banks.

- **The Liquidity Hemorrhage:** In competitive rate environments, unengaged account holders aren't just passively rolling over—they are actively moving "hot money" to competitors with better digital experiences.

- **The Cost of Acquisition:** Replacing a lost $50,000 CD by acquiring a brand-new depositor is exponentially more expensive than offering a targeted, proactive retention rate to an existing one. FIs are bleeding deposits they already own.

- **Blind Spots in the Back Office:** Because maturity is treated as a batch process, FIs have zero visibility into *why* a customer withdrew funds. They lose the money and the data simultaneously.

**For the consumer,** the current maturity process is anxiety-inducing and archaic.

- **The Auto-Renew Trap:** Consumers live in fear of missing a mailed 30-day notice, resulting in their funds being automatically locked into a subpar, non-promotional default rate for another 12 to 60 months.

- **High-Friction Hurdles:** To act on a maturing CD, consumers are often forced out of their preferred digital channels and made to call a support center or visit a physical branch during business hours.

- **The Empathy Void:** Getting a system-generated paper letter feels cold. Consumers want their financial partner to proactively help them optimize their yield, build a laddering strategy, or adapt to a new life stage.

**The Users:**

- **The Account Holder (Member/Customer):** Digital banking users who need clear, self-serve options to renew, ladder, or withdraw maturing certificates.
- **The FI Administrator:** Retail banking and marketing teams who need to configure campaigns, set retention pricing, and view analytics on retention success.

---

## APIs & Integrations

Rather than integrating directly with the banking core, MaturitySync integrates with the Digital Banking Platform (DBP). This architectural choice serves the product by utilizing data the DBP already has access to.

- **Mock DBP Adapter:** Currently implemented as a mock service to simulate fetching account balances, maturity dates, and certificate details from the digital banking environment.

- **MaturitySync API Service:** Built with Node.js, Fastify, and Drizzle ORM (PostgreSQL). It includes:

  - **Recommendation Engine API:** Analyzes account holder data to serve personalized maturity options (e.g., laddering, high-yield cross-sells).
  - **State Machine API:** Manages the engagement lifecycle (approaching maturity, action taken, rolled over, withdrawn).
  - **Action Execution Routes:** Handles the user's ultimate decision (renew, split, transfer) and passes the instructions back to the DBP.

---

## How to Run It Locally

### Live Demo (No Setup Required)

For immediate review on any device (including Chromebooks), this repository includes a fully functional, dependency-free HTML demo.

1. Navigate to the `/demo` folder in the repository.
2. Open `decision-hub.html` directly in your web browser. This file contains all UI flows, states, and the Nymbus Joy design system implementation.

### Full Monorepo Setup

To run the complete API and database stack locally:

1. Ensure Node.js and PostgreSQL are installed.

2. Clone the repository and install dependencies:

```bash
npm install
```

3. Set up your environment variables (copy `.env.example` to `.env`).

4. Push the database schema and seed the mock data:

```bash
npm run db:push
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

---

## Product Decisions & Reasoning

**Decoupling from the Core:** Decision: I built MaturitySync as an engagement layer on top of the DBP rather than integrating directly with the core processor. Reasoning: The DBP already houses the necessary maturity and balance data. Bypassing a direct core integration drastically reduces implementation friction, accelerates time-to-market, and creates a highly compelling "no core integration required" sales narrative for FIs.

**Standalone HTML Demo for MVP Review:** Decision: Created a vanilla HTML/CSS/JS file alongside the React/Node stack. Reasoning: I needed to review the UX and functionality on a Chromebook immediately. A standalone file removed local environment dependencies and compilation steps, enabling instant stakeholder review.

**Adopting the Nymbus Joy Design System:** Decision: Mapped custom CSS variables directly to Nymbus Joy primitive and semantic tokens (colors, typography, icons). Reasoning: Ensuring the UI looks native to the target digital banking ecosystem is critical for user trust. I also strictly adhered to WCAG 2.1 AA standards to meet FI compliance requirements.

---

## What I Would Change or Add With More Time

If given more time to expand beyond the Phase 1 MVP, the following additions would be prioritized:

- **Live DBP Integrations:** Replace the Mock DBP Adapter with live API connectors.

- **Rate Change Notifications:** If the FI changes the rate *after* a member has scheduled their maturity decision, notify the member (via push and/or email) that the rate underlying their scheduled action has changed. The notification returns them to the Decision Hub with updated figures, giving them the opportunity to revise, confirm, or cancel their selection before the maturity date. This is a critical trust feature — members must never feel surprised on their effective date by a rate they didn't agree to.

- **Advanced Machine Learning Recommendations:** Upgrade the rule-based recommendation engine to a predictive ML model that analyzes a user's broader financial picture to suggest highly personalized wealth-building strategies (Phase 3 Intelligence).

- **Omnichannel Notification Orchestration:** Integrate with an SMS/Email gateway (like Twilio or SendGrid) to actually trigger the external engagement alerts when the State Machine detects a certificate is 30 days from maturity.

- **FI Admin Analytics Dashboard:** Build out the React frontend for the FI Admin persona, visualizing retention rates, dollar amounts saved, and campaign conversion metrics.

- **Component Library Migration:** Convert the standalone HTML/CSS demo components into fully reusable React components utilizing the Nymbus Joy design tokens for the production web app.

- **Commercial / SMB Digital Banking Variant:** Adapt MaturitySync for the business banking space. Key enhancements required:
  - **Multi-signer authorization:** Business CDs often require multiple authorized signers to approve maturity decisions. The scheduling flow would need an approval workflow (initiate → route for co-signer approval → execute at maturity).
  - **Entity-level account structures:** Businesses hold certificates under LLCs, trusts, or DBAs with complex ownership hierarchies. The Decision Hub must support entity-level views, not just individual accounts.
  - **Cash flow integration:** Replace consumer-oriented "earnings" framing with business cash flow planning — show how maturity timing aligns with payroll cycles, tax obligations, or seasonal revenue patterns.
  - **Bulk maturity management:** Businesses may hold dozens of certificates as part of a treasury strategy. Provide a portfolio-level dashboard for managing multiple maturities simultaneously, with batch scheduling.
  - **Tone and UX simplification:** Remove gamification, celebration animations, and emotional engagement. Use a professional, data-driven UI focused on yield optimization, duration management, and liquidity planning.
  - **Treasury/CFO reporting:** Export scheduled decisions, projected cash flows, and rate comparisons in formats compatible with accounting software and board reporting.
  - **Delegation and roles:** Allow a business owner to delegate maturity management to a bookkeeper or CFO with appropriate permissions (view-only, recommend, execute).
  - **Rate negotiation hooks:** Larger commercial deposits often have negotiated rates. The Decision Hub should surface "contact your relationship manager" for balances above a threshold, or integrate with an RM notification workflow.
