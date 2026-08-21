# CertificateIQ — Implementation Tasks

## Phase 1: MVP (Weeks 1–8)

**Goal:** Deliver the core maturity engagement loop — notify members, present options, let them act, measure results.

---

### Sprint 1–2: Foundation & Data Layer (Weeks 1–4)

#### Task 1.1: Project scaffolding and infrastructure
- [ ] Initialize monorepo structure (backend services, frontend components, admin console, shared types)
- [ ] Set up CI/CD pipeline (build, test, lint, deploy to staging)
- [ ] Provision database (PostgreSQL) and define migration framework
- [ ] Set up logging, error tracking, and observability baseline
- [ ] Define environment configuration (dev, staging, production)

#### Task 1.2: Data model implementation
- [ ] Implement database schema (Certificate, EngagementState, NotificationLog, Recommendation, FIConfiguration, EngagementEvent tables)
- [ ] Create database migrations
- [ ] Implement repository/data access layer with CRUD operations
- [ ] Add seed data for development and testing
- [ ] Write data access unit tests

#### Task 1.3: DBP integration layer (read path)
- [ ] Define integration interface/contract for DBP data consumption (Account API, Member Profile API, Rate Feed)
- [ ] Implement adapter pattern — abstraction layer that can support multiple DBP vendors
- [ ] Build mock DBP adapter for development/testing with realistic sample data
- [ ] Implement certificate data sync service (batch: daily pull of certificates within engagement window)
- [ ] Implement rate feed sync (pull current rates on-demand or cached with TTL)
- [ ] Write integration tests against mock adapter

#### Task 1.4: Engagement state machine
- [ ] Implement state machine logic (DORMANT → NOTIFIED → ENGAGED → RESOLVED/EXPIRED)
- [ ] State transition validation (prevent invalid transitions)
- [ ] State persistence and retrieval
- [ ] Timestamp tracking for each state entry
- [ ] Unit tests for all valid/invalid state transitions

---

### Sprint 3–4: Orchestration & Notifications (Weeks 3–6)

#### Task 2.1: Orchestration engine — scheduling
- [ ] Implement maturity date scanner (identifies certificates entering each notification interval)
- [ ] Build scheduler service (runs daily, evaluates all active certificates against configured intervals)
- [ ] Implement trigger rule evaluation (interval match + suppression check + state check)
- [ ] Idempotency guarantee — same day re-run produces no duplicate triggers
- [ ] Handle edge cases: maturity date changes, early withdrawal, account closure
- [ ] Performance testing with 100K+ certificates

#### Task 2.2: Notification dispatch
- [ ] Define notification service interface (channel-agnostic)
- [ ] Implement push notification dispatch (via DBP notification service)
- [ ] Implement email dispatch (via DBP notification service)
- [ ] Template rendering with merge fields (member_name, cert_balance, cert_rate, maturity_date, days_remaining)
- [ ] Notification logging (sent timestamp, channel, template used)
- [ ] Delivery status tracking (if DBP provides callbacks)
- [ ] Suppression rule evaluation before dispatch
- [ ] Unit and integration tests

#### Task 2.3: FI admin — notification configuration
- [ ] API endpoints for CRUD on notification timing intervals
- [ ] API endpoints for CRUD on notification templates
- [ ] API endpoints for channel enable/disable per interval
- [ ] API endpoints for suppression rule management
- [ ] Input validation and defaults
- [ ] Admin console UI: notification timing configuration screen
- [ ] Admin console UI: template editor with merge field insertion and preview
- [ ] Admin console UI: suppression rules configuration

---

### Sprint 4–6: Decision Hub UI (Weeks 4–8)

#### Task 3.1: Decision hub — core screen
- [ ] Implement decision hub page/component (certificate summary section)
- [ ] Display current certificate details (account, balance, rate, term, maturity date, days remaining)
- [ ] Fetch and display available renewal options (terms + rates from rate feed)
- [ ] Display rate comparison (original rate vs. current available rates)
- [ ] Implement "Renew Same Term" flow (confirmation + submit)
- [ ] Success/confirmation state with notification trigger
- [ ] Error handling and retry UX
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility audit (WCAG 2.1 AA)

#### Task 3.2: Decision hub — change term flow
- [ ] Display all available terms as selectable options (cards or table)
- [ ] Rate and projected earnings calculation per term selection
- [ ] Confirmation screen with full summary
- [ ] Submit renewal with modified term via DBP Transaction API
- [ ] Success state

#### Task 3.3: Decision hub — add funds flow
- [ ] Display linked accounts with available balances
- [ ] Amount input (manual entry or suggested amount for tier nudge)
- [ ] Rate tier threshold display ("Add $X to reach Y% tier")
- [ ] Validation (sufficient balance in source account, meets minimum)
- [ ] Combined confirmation (renewal + fund transfer)
- [ ] Submit both transactions via DBP APIs
- [ ] Success state with new balance and rate confirmed

#### Task 3.4: Decision hub — redirect flow
- [ ] Display linked accounts as transfer destinations
- [ ] Amount input (full or partial balance)
- [ ] If partial: remaining balance routes to renewal sub-flow
- [ ] Submit transfer via DBP Transaction API
- [ ] Success state

#### Task 3.5: In-app awareness (banner/card)
- [ ] Implement dashboard banner component (appears when certificate within engagement window)
- [ ] Display: certificate identifier, days to maturity, CTA to decision hub
- [ ] Handle multiple maturing certificates (consolidated view)
- [ ] Dismiss/snooze behavior
- [ ] Banner disappears after member takes action

#### Task 3.6: DBP integration layer (write path)
- [ ] Implement transaction execution adapter (renewal, transfer, add-funds)
- [ ] Error handling for transaction failures (insufficient funds, session timeout, system errors)
- [ ] Transaction confirmation and receipt generation
- [ ] Rollback/compensation logic if multi-step transaction partially fails
- [ ] Integration tests against mock DBP transaction API

---

### Sprint 5–7: Recommendations & Analytics (Weeks 5–8)

#### Task 4.1: Recommendation engine (rule-based)
- [ ] Implement recommendation rule evaluation pipeline
- [ ] Rule: Balance tier nudge (within threshold of next tier)
- [ ] Rule: Default renewal (FI-preferred term)
- [ ] Rule: Term optimization (rate environment comparison)
- [ ] Rule: Product cross-sell (single-product member detection)
- [ ] Recommendation ranking (primary + secondary)
- [ ] FI configuration integration (which rules active, product priorities)
- [ ] Recommendation logging (what was shown to whom)
- [ ] Unit tests for each rule and priority logic

#### Task 4.2: Recommendation display in decision hub
- [ ] "Recommended for You" card component
- [ ] Display rationale text (configurable by rule type)
- [ ] One-tap accept flow (routes to appropriate action sub-flow)
- [ ] Dismiss capability
- [ ] Track acceptance/dismissal events

#### Task 4.3: Analytics event capture
- [ ] Implement event ingestion service
- [ ] Capture all events per taxonomy (maturity.approaching through maturity.expired)
- [ ] Event validation and schema enforcement
- [ ] Event storage (append-only event log)
- [ ] Session correlation (link events to member sessions)

#### Task 4.4: Analytics dashboard — MVP
- [ ] Retention rate calculation and display (overall + by time period)
- [ ] Engagement funnel visualization (notified → viewed → acted)
- [ ] Notification effectiveness by channel and interval
- [ ] Dollar value of deposits retained vs. baseline
- [ ] Add-on deposits captured (incremental funds added at renewal)
- [ ] Date range selector and basic filtering
- [ ] Export to CSV

---

### Sprint 7–8: Admin Console & Polish (Weeks 7–8)

#### Task 5.1: Admin console — product configuration
- [ ] UI for selecting available certificate terms for renewal
- [ ] UI for configuring rate tier thresholds
- [ ] UI for adding alternative product recommendations
- [ ] UI for loyalty/retention premium settings
- [ ] Save and preview changes before publishing

#### Task 5.2: Admin console — reporting access
- [ ] Embed analytics dashboard within admin console
- [ ] Role-based access control (viewer, editor, admin roles)
- [ ] Scheduled report delivery configuration (weekly/monthly email)

#### Task 5.3: End-to-end testing & QA
- [ ] E2E test: full member journey (notification → decision hub → renewal)
- [ ] E2E test: add funds flow
- [ ] E2E test: redirect flow
- [ ] E2E test: grace period expiration (no action → auto-roll)
- [ ] E2E test: admin configuration changes take effect without deploy
- [ ] Load testing: simulate 10K concurrent maturity events
- [ ] Security review: verify no PII leakage, transaction auth enforcement
- [ ] Accessibility testing with screen reader

#### Task 5.4: Documentation & deployment
- [ ] API documentation (OpenAPI spec for DBP integration points)
- [ ] Admin user guide
- [ ] DBP integration guide (how to connect a new DBP vendor)
- [ ] Deployment runbook (infrastructure requirements, environment variables, health checks)
- [ ] Release notes for Phase 1

---

## Phase 2: Enhancement (Weeks 9–16)

### Epic: Certificate Ladder Builder
- [ ] Ladder builder UI (visual timeline, split amount sliders, multi-term selection)
- [ ] Ladder execution (open multiple certificates in one flow)
- [ ] Ladder recommendation rule integration
- [ ] Analytics: ladder adoption rate, average splits, balance per split

### Epic: SMS Channel
- [ ] SMS notification adapter
- [ ] Opt-in/consent management
- [ ] SMS template configuration in admin
- [ ] Delivery tracking and analytics

### Epic: A/B Testing Framework
- [ ] Traffic splitting logic (percentage or segment-based)
- [ ] Variant tracking in analytics events
- [ ] A/B test reporting (significance calculation, winner determination)
- [ ] Admin UI for creating/managing experiments

### Epic: Priority Tier Escalation
- [ ] Priority scoring model (balance × relationship × rate_gap × first_maturity)
- [ ] High-priority escalation actions (personal outreach task in CRM, enhanced offer unlock)
- [ ] Priority tier reporting in dashboard

### Epic: CRM/Marketing Automation Integration
- [ ] Export engagement events to FI's CRM (Salesforce, HubSpot, etc.)
- [ ] Trigger CRM workflows based on attrition risk score
- [ ] Sync member engagement history for holistic view

---

## Phase 3: Intelligence (Weeks 17–24)

### Epic: ML-Driven Recommendations
- [ ] Historical data pipeline (past renewal behaviors, attrition outcomes)
- [ ] Feature engineering (rate sensitivity, tenure, balance trajectory, product portfolio)
- [ ] Train attrition risk prediction model
- [ ] Train optimal product recommendation model
- [ ] A/B test ML recommendations vs. rule-based
- [ ] Continuous model retraining pipeline

### Epic: Attrition Risk Scoring
- [ ] Real-time risk score per maturing certificate
- [ ] Risk score factors visible to admin (explainability)
- [ ] Risk-driven automation (high risk → earlier/more frequent outreach, enhanced offers)
- [ ] Risk dashboard with portfolio-level heat map

### Epic: Competitive Rate Context (Optional)
- [ ] Rate data ingestion from public rate sources
- [ ] "How your renewal compares to market" context for member
- [ ] Admin view: competitive positioning for their rates

---

## Success Criteria by Phase

| Phase | Timeline | Key Outcome |
|-------|----------|-------------|
| Phase 1 MVP | Weeks 1–8 | Core loop live: notify → present options → member acts → measure. Target: 5% retention rate improvement over FI baseline. |
| Phase 2 Enhancement | Weeks 9–16 | Ladder builder, SMS, A/B testing, CRM integration. Target: 10% retention improvement, measurable add-on deposits. |
| Phase 3 Intelligence | Weeks 17–24 | ML recommendations, predictive risk scoring. Target: Personalized interventions reduce attrition by 15%+ vs. baseline. |
