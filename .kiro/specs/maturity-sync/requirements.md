# MaturitySync — Requirements Spec

## Product Overview

**Product Name:** MaturitySync
**Problem:** FIs that treat certificate maturity as a back-office transaction are being outperformed by FIs that treat it as an engagement opportunity. ~$300B in deposits are at risk annually across the industry due to passive maturity handling.
**Solution:** A digital banking engagement layer that transforms certificate maturity from a silent rollover into a personalized, guided decision moment — increasing deposit retention, growing balances, and deepening member relationships.

---

## Personas

### P1: Member/Customer ("Alex")
- Has one or more certificates approaching maturity
- May or may not be aware of the maturity date
- Wants to make a smart decision with their money without calling the branch
- Values convenience, clarity, and feeling like their FI is looking out for them

### P2: Digital Banking Administrator ("Jordan")
- Manages the FI's digital banking experience
- Responsible for engagement metrics, deposit retention KPIs
- Needs to configure timing, channels, messaging, and product offerings
- Wants measurable ROI from digital initiatives

### P3: Deposit Strategist ("Morgan")
- Owns the FI's deposit growth strategy and certificate pricing
- Needs visibility into attrition risk, retention rates, and balance trends
- Wants to run targeted retention campaigns for at-risk certificates
- Uses data to inform rate decisions and product design

---

## User Stories & Acceptance Criteria

### Epic 1: Pre-Maturity Awareness & Engagement

#### US-1.1: Pre-maturity notification sequence
**As** a member with a maturing certificate,
**I want** to be notified in advance that my certificate is approaching maturity,
**So that** I have time to consider my options before it auto-renews.

**Acceptance Criteria:**
- [ ] Member receives notifications at FI-configured intervals (default: 30, 15, 7 days before maturity)
- [ ] Notifications are delivered via push notification and/or email based on member preferences
- [ ] Each notification includes: certificate details (account, balance, rate, term, maturity date) and a CTA to view options
- [ ] Notification sequence stops if the member takes action (renews, redirects, or withdraws)
- [ ] Members can opt out of maturity notifications per certificate

#### US-1.2: In-app maturity awareness
**As** a member who logs into digital banking,
**I want** to see a prominent indicator when a certificate is approaching maturity,
**So that** I'm reminded to take action even if I missed a notification.

**Acceptance Criteria:**
- [ ] A visual indicator (badge, banner, or card) appears on the dashboard when a certificate is within the notification window
- [ ] The indicator shows: which certificate, days remaining, and a CTA to manage maturity
- [ ] The indicator disappears after the member takes action or the grace period expires
- [ ] Multiple maturing certificates show as a consolidated view with individual actions

---

### Epic 2: Digital Self-Service Decision Experience

#### US-2.1: View maturity options
**As** a member with a maturing certificate,
**I want** to see all my options clearly in one place,
**So that** I can make an informed decision without calling or visiting a branch.

**Acceptance Criteria:**
- [ ] Decision screen presents current certificate details (balance, original rate, original term, maturity date)
- [ ] Available options include: renew same term, select different term, add funds and renew, withdraw to another account, or explore alternative products
- [ ] Each option shows the projected outcome (new rate, new maturity date, estimated earnings)
- [ ] Rate comparison shows current offered rates vs. original rate
- [ ] Member can complete any option in ≤3 taps/clicks from the decision screen

#### US-2.2: Renew with modifications
**As** a member renewing a certificate,
**I want** to adjust the term and/or add funds during renewal,
**So that** I can optimize my return without opening a brand new certificate.

**Acceptance Criteria:**
- [ ] Member can select from available terms with corresponding rates displayed
- [ ] Member can add funds from a linked account (checking/savings) during renewal
- [ ] System shows rate tier thresholds ("Add $2,000 to reach the $25,000+ rate tier")
- [ ] Confirmation screen summarizes: new term, new rate, new balance, new maturity date
- [ ] Successful renewal triggers confirmation notification (push + email)

#### US-2.3: Certificate ladder builder
**As** a member with a large maturing certificate,
**I want** to split my balance across multiple terms,
**So that** I can build a ladder strategy that gives me regular access to funds at competitive rates.

**Acceptance Criteria:**
- [ ] Ladder builder allows splitting the maturing balance into 2–5 certificates
- [ ] Member can select different terms for each split
- [ ] Visual timeline shows when each certificate in the ladder matures
- [ ] System displays combined weighted average rate and projected earnings
- [ ] Member can adjust split amounts with a slider or manual entry
- [ ] Minimum balance requirements are enforced and displayed per split

#### US-2.4: Redirect to alternative product
**As** a member who doesn't want to renew a certificate,
**I want** to easily move my funds to another account or product,
**So that** my money keeps working for me without friction.

**Acceptance Criteria:**
- [ ] Member can transfer maturing funds to any linked account (checking, savings, money market)
- [ ] Alternative product recommendations are shown (e.g., "Consider our Money Market at X% with no lock-up")
- [ ] If opening a new product is required, the flow links to the appropriate application
- [ ] Partial redirect is supported (e.g., renew $10K, move $5K to savings)

---

### Epic 3: Intelligent Recommendations

#### US-3.1: Personalized renewal recommendation
**As** a member viewing maturity options,
**I want** to see a recommendation tailored to my situation,
**So that** I don't have to figure out the best option on my own.

**Acceptance Criteria:**
- [ ] System generates a primary recommendation based on: member's relationship depth, balance tier proximity, rate environment, and account history
- [ ] Recommendation is clearly labeled (e.g., "Recommended for you") with a brief rationale
- [ ] Member can dismiss the recommendation and choose freely
- [ ] Recommendations are configurable by the FI (which products/terms to prioritize)

#### US-3.2: Balance tier nudge
**As** a member close to a higher rate tier,
**I want** to be informed about how much more I'd need to deposit to reach the next tier,
**So that** I can decide if the better rate is worth the additional deposit.

**Acceptance Criteria:**
- [ ] If member's maturing balance is within a configurable threshold of the next rate tier, a nudge is displayed
- [ ] Nudge shows: additional amount needed, rate improvement, and projected earnings difference over the new term
- [ ] Member can add the suggested amount in one action (pull from linked account)
- [ ] Nudge does not display if no linked account has sufficient available balance

---

### Epic 4: FI Administration & Configuration

#### US-4.1: Configure notification timing and channels
**As** a digital banking administrator,
**I want** to set when and how members are notified about approaching maturities,
**So that** I can align the engagement cadence with our institution's strategy.

**Acceptance Criteria:**
- [ ] Admin can configure notification intervals (e.g., 60, 30, 15, 7, 3, 1 days before maturity)
- [ ] Admin can enable/disable channels per interval (push, email, SMS, in-app)
- [ ] Admin can customize notification templates (subject, body, CTA text)
- [ ] Admin can set suppression rules (e.g., don't notify if balance < $X, or if member already engaged)
- [ ] Changes take effect for all future maturity events without requiring a deployment

#### US-4.2: Configure available products and rates at maturity
**As** a deposit strategist,
**I want** to control which products and terms are offered to members at maturity,
**So that** I can align the digital experience with our current pricing and deposit goals.

**Acceptance Criteria:**
- [ ] Admin can select which certificate terms are available for renewal
- [ ] Admin can add alternative products to recommend (money market, savings, etc.)
- [ ] Rate information is pulled from the DBP's existing rate source (no separate rate entry)
- [ ] Admin can set promotional/loyalty rate premiums for renewal (e.g., +0.10% for existing members)
- [ ] Admin can configure rate tier thresholds and nudge messaging

#### US-4.3: Define engagement priority rules
**As** a deposit strategist,
**I want** to prioritize engagement efforts for high-value or at-risk certificates,
**So that** we focus resources where they'll have the most impact on retention.

**Acceptance Criteria:**
- [ ] Admin can define priority tiers based on: balance amount, member relationship depth, first-time maturity, rate gap (original vs. renewal rate)
- [ ] Higher-priority certificates can trigger additional engagement (e.g., personal outreach task, enhanced offer)
- [ ] Priority rules are visible in the analytics dashboard

---

### Epic 5: Analytics & Reporting

#### US-5.1: Retention performance dashboard
**As** a deposit strategist,
**I want** to see how well we're retaining deposits at maturity,
**So that** I can measure the impact of our engagement efforts and identify areas for improvement.

**Acceptance Criteria:**
- [ ] Dashboard shows overall retention rate (% of maturing balances retained)
- [ ] Retention is breakable by: term, balance tier, channel used, time period, member segment
- [ ] Dashboard shows trend over time (month-over-month, quarter-over-quarter)
- [ ] Comparison view: retention rate for members who engaged with the decision experience vs. those who didn't
- [ ] Dollar value of deposits retained is displayed prominently

#### US-5.2: Engagement funnel metrics
**As** a digital banking administrator,
**I want** to see how members are interacting with maturity notifications and the decision experience,
**So that** I can optimize timing, messaging, and UX.

**Acceptance Criteria:**
- [ ] Funnel shows: notifications sent → opened → decision screen viewed → action taken
- [ ] Breakdown by channel (push vs. email vs. in-app)
- [ ] Breakdown by notification interval (which timing drove the most action?)
- [ ] Drop-off points identified (where do members abandon the flow?)
- [ ] A/B test results displayed when experiments are active

#### US-5.3: Deposit growth attribution
**As** a deposit strategist,
**I want** to see incremental deposits captured through the maturity engagement experience,
**So that** I can calculate ROI and justify continued investment.

**Acceptance Criteria:**
- [ ] Report shows: total add-on deposits at renewal (funds members added above their maturing balance)
- [ ] Report shows: balance retained that would have been projected to attrit based on historical baseline
- [ ] Report shows: new product openings attributed to maturity redirect recommendations
- [ ] Export capability for executive reporting

---

## Non-Functional Requirements

### NFR-1: Performance
- Notification triggers must fire within 1 hour of the configured interval (e.g., if set for 30 days before, notification is sent within 1 hour of the 30-day mark)
- Decision screen must load in <2 seconds
- Renewal/redirect transactions must complete in <5 seconds

### NFR-2: Security
- All member data handled per the existing digital banking platform's security model
- No storage of sensitive account data outside the DBP's existing infrastructure
- Renewal/fund-transfer actions require the same authentication level as other account transactions in the DBP

### NFR-3: Accessibility
- Decision experience must meet WCAG 2.1 AA standards
- Notification content must be screen-reader compatible
- All interactive elements must be keyboard navigable

### NFR-4: Scalability
- Support FIs with 1,000 to 500,000+ certificates in portfolio
- Handle maturity date clustering (e.g., month-end or quarter-end spikes) without degraded performance

### NFR-5: Integration
- Must operate within the digital banking platform's existing authentication and session context
- No separate member login or account linking required
- Must work with the DBP's existing account data and rate feeds

---

## Out of Scope (Phase 1)

- Branch/call center agent-facing tools
- SMS channel (Phase 2)
- AI-driven rate negotiation or dynamic pricing
- External rate comparison (competitor rates)
- SMB/commercial certificate maturity (future product variant)
- Integration with CRM or marketing automation platforms (Phase 2)
