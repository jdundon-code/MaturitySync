# MaturitySync

## What I Built and Why

MaturitySync is a proactive engagement layer that sits on top of a Digital Banking Platform (DBP), turning certificate (CD) maturity from a passive back-office transaction into a strategic growth opportunity.

**The Problem:** Financial Institutions (FIs) typically treat certificate maturity as a batch process, automatically rolling them over with little to no account holder interaction. This passive approach results in a massive loss of potential deposits (an estimated $45M gap per institution annually) due to attrition, missed cross-sell opportunities, and uncaptured external funds.

**The Solution:** FIs that treat maturity as an engagement opportunity outperform those that don't. MaturitySync provides a digital self-service decision hub, intelligent recommendations, and automated notification orchestration to engage users before their certificates auto-roll.

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

**Adopting the Nymbus Joy Design System:** Decision: Mapped custom CSS variables directly to Nymbus Joy primitive and semantic tokens (colors, typography, icons). Reasoning: Ensuring the UI looks native to the target digital banking ecosystem is critical for user trust. We also strictly adhered to WCAG 2.1 AA standards to meet FI compliance requirements.

---

## What I Would Change or Add With More Time

If given more time to expand beyond the Phase 1 MVP, the following additions would be prioritized:

- **Live DBP Integrations:** Replace the Mock DBP Adapter with live API connectors.

- **Advanced Machine Learning Recommendations:** Upgrade the rule-based recommendation engine to a predictive ML model that analyzes a user's broader financial picture to suggest highly personalized wealth-building strategies (Phase 3 Intelligence).

- **Omnichannel Notification Orchestration:** Integrate with an SMS/Email gateway (like Twilio or SendGrid) to actually trigger the external engagement alerts when the State Machine detects a certificate is 30 days from maturity.

- **FI Admin Analytics Dashboard:** Build out the React frontend for the FI Admin persona, visualizing retention rates, dollar amounts saved, and campaign conversion metrics.

- **Component Library Migration:** Convert the standalone HTML/CSS demo components into fully reusable React components utilizing the Nymbus Joy design tokens for the production web app.
