# MaturitySync — Design Spec

## Architecture Overview

MaturitySync is an engagement layer that sits on top of the existing digital banking platform (DBP). It does not replace or bypass the DBP — it enhances it with orchestration, decision UX, and intelligence capabilities around certificate maturity events.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MEMBER TOUCHPOINTS                            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────────┐  │
│  │   Push   │  │    Email     │  │  In-App   │  │  Decision    │  │
│  │  Notif.  │  │  Sequences   │  │  Banners  │  │    Hub UI    │  │
│  └────┬─────┘  └──────┬───────┘  └─────┬─────┘  └──────┬───────┘  │
└───────┼────────────────┼────────────────┼───────────────┼───────────┘
        │                │                │               │
┌───────┴────────────────┴────────────────┴───────────────┴───────────┐
│                     MATURITYSYNC PLATFORM                           │
│                                                                      │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │  Orchestration │  │  Recommendation │  │   Analytics Engine   │ │
│  │     Engine     │  │     Engine      │  │                      │ │
│  └───────┬────────┘  └────────┬────────┘  └──────────┬───────────┘ │
│          │                    │                       │             │
│  ┌───────┴────────────────────┴───────────────────────┴───────────┐ │
│  │                    Event & Data Store                           │ │
│  └───────────────────────────┬────────────────────────────────────┘ │
│                              │                                      │
│  ┌───────────────────────────┴────────────────────────────────────┐ │
│  │                    FI Admin Console                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────┐
│                   DIGITAL BANKING PLATFORM (DBP)                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │  Account &   │  │  Rate Feed   │  │  Notification Service      ││
│  │  Certificate │  │              │  │  (Push, Email)             ││
│  │  Data API    │  │              │  │                            ││
│  └──────────────┘  └──────────────┘  └────────────────────────────┘│
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │  Transaction │  │  Member      │  │  Authentication &          ││
│  │  Execution   │  │  Profile     │  │  Session Context           ││
│  │  API         │  │  API         │  │                            ││
│  └──────────────┘  └──────────────┘  └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────┐
│                       CORE BANKING SYSTEM                            │
│          (Certificate records, rates, account balances)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Orchestration Engine

**Purpose:** Watches certificate maturity dates and triggers engagement workflows at the right time, through the right channel, with the right message.

**Responsibilities:**
- Poll or subscribe to certificate data from the DBP at a scheduled interval (daily batch or event-driven)
- Maintain a maturity timeline for each active certificate
- Evaluate trigger rules at each interval checkpoint (e.g., "30 days out → send push + email")
- Respect suppression rules (member opted out, already took action, balance below threshold)
- Track engagement state per certificate (untouched, notified, viewed, acted)

**Design Decisions:**
- **Event-driven preferred, batch fallback:** If the DBP supports webhooks or event streams for account changes, subscribe to them. Otherwise, run a daily batch scan of all certificates with maturity dates within the engagement window.
- **Stateful per certificate:** Each certificate has an engagement state machine (see below).
- **Idempotent triggers:** Re-running the engine for the same day produces no duplicate notifications.

**Certificate Engagement State Machine:**

```
┌──────────┐     notification     ┌──────────┐     member views      ┌──────────┐
│  DORMANT │ ──── sent ─────────► │ NOTIFIED │ ──── decision hub ──► │ ENGAGED  │
└──────────┘                      └──────────┘                        └──────────┘
                                        │                                   │
                                        │ grace period expires              │ takes action
                                        ▼                                   ▼
                                  ┌──────────┐                        ┌──────────┐
                                  │ EXPIRED  │                        │ RESOLVED │
                                  │(rolled   │                        │(renewed/ │
                                  │ over)    │                        │ redirected)
                                  └──────────┘                        └──────────┘
```

States:
- **DORMANT** — Certificate exists but is outside the engagement window
- **NOTIFIED** — At least one notification has been sent; member has not yet engaged
- **ENGAGED** — Member has opened the decision hub / viewed options
- **RESOLVED** — Member took an action (renewed, modified, redirected, withdrew)
- **EXPIRED** — Grace period ended with no member action; certificate auto-rolled

---

### 2. Recommendation Engine

**Purpose:** Generate personalized suggestions for each member at their maturity decision point.

**Inputs:**
- Certificate details (balance, original rate, original term)
- Current rate environment (available terms and rates from the DBP rate feed)
- Member profile (relationship depth, other accounts, tenure, age)
- Balance tier thresholds (configured by FI admin)
- FI product priorities (configured by admin — which products to promote)

**Recommendation Logic (rule-based, Phase 1):**

```
IF balance is within threshold of next rate tier:
  → PRIMARY: "Add $X to unlock Y% rate" (balance tier nudge)

ELSE IF member has only certificate products (no checking/savings):
  → PRIMARY: "Renew at best available term"
  → SECONDARY: "Consider opening a [Money Market / Savings] for flexibility"

ELSE IF rate gap (original rate - current best renewal rate) > threshold:
  → PRIMARY: "Lock in [longest competitive term] before rates move"
  → SECONDARY: "Consider a ladder to balance access and rate"

ELSE IF balance > ladder threshold:
  → PRIMARY: "Build a ladder for regular access + competitive rates"

ELSE (default):
  → PRIMARY: "Renew at [FI-preferred term] at [current rate]"
```

**Phase 2 (future):** Replace rule-based logic with ML model trained on historical renewal behavior, attrition patterns, and rate sensitivity.

---

### 3. Decision Hub UI

**Purpose:** The member-facing experience where they view options and take action on a maturing certificate.

**Embedded within the DBP as:**
- A dedicated screen/route accessible from account details, notifications, and dashboard banners
- OR an SDK/widget rendered within the DBP's existing UI framework

**Screen Flow:**

```
┌─────────────────────────────────────────────────────┐
│              MATURITY DECISION HUB                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  YOUR CERTIFICATE                            │    │
│  │  Account: ****1234                           │    │
│  │  Balance: $25,000                            │    │
│  │  Rate: 4.75% APY                            │    │
│  │  Term: 12 months                            │    │
│  │  Matures: September 15, 2026 (25 days)      │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  ★ RECOMMENDED FOR YOU                       │    │
│  │  Add $5,000 to reach our $30K+ tier          │    │
│  │  → 4.50% APY (12-month) vs 4.25% standard   │    │
│  │  Projected earnings: $1,350 over 12 months   │    │
│  │  [Add Funds & Renew]                         │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ── OTHER OPTIONS ──────────────────────────────    │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐      │
│  │  Renew   │  │  Change  │  │   Build a    │      │
│  │  Same    │  │  Term    │  │   Ladder     │      │
│  │  Term    │  │          │  │              │      │
│  │  4.25%   │  │  See all │  │  Split into  │      │
│  │  12 mo   │  │  terms   │  │  multiple    │      │
│  └──────────┘  └──────────┘  └──────────────┘      │
│                                                      │
│  ┌──────────────────┐  ┌─────────────────────┐      │
│  │  Move to Another │  │  Explore Other      │      │
│  │  Account         │  │  Products           │      │
│  └──────────────────┘  └─────────────────────┘      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Sub-Flows:**

**Renew Same Term:**
1. Confirm current balance, new rate, new maturity date
2. [Optional] Add funds
3. Confirm & submit
4. Success confirmation + notification

**Change Term:**
1. Display available terms with rates (table/cards)
2. Select term → show projected earnings
3. [Optional] Add funds
4. Confirm & submit

**Ladder Builder:**
1. Display total balance available to split
2. Add splits (2–5) with term selector per split
3. Visual timeline of maturity dates
4. Show combined weighted rate & total projected earnings
5. Adjust amounts (slider or input)
6. Confirm & submit all

**Move to Another Account:**
1. Select destination account from linked accounts
2. Enter amount (default: full balance, allow partial)
3. If partial: remaining balance flows into renewal path
4. Confirm & submit

---

### 4. Analytics Engine

**Purpose:** Capture engagement events, calculate retention metrics, and power the reporting dashboard.

**Event Taxonomy:**

| Event | Trigger | Data Captured |
|-------|---------|---------------|
| `maturity.approaching` | Certificate enters engagement window | cert_id, member_id, balance, maturity_date, days_remaining |
| `notification.sent` | Notification dispatched | cert_id, channel, interval_days, template_id |
| `notification.opened` | Member opens notification | cert_id, channel, timestamp |
| `decision_hub.viewed` | Member opens decision screen | cert_id, source (notification/banner/direct), timestamp |
| `recommendation.shown` | Recommendation displayed | cert_id, rec_type, rec_details |
| `recommendation.accepted` | Member follows recommendation | cert_id, rec_type |
| `action.renew_same` | Renewed same term | cert_id, new_balance, new_rate, new_term |
| `action.renew_modified` | Renewed with changes | cert_id, new_balance, new_rate, new_term, funds_added |
| `action.ladder_created` | Ladder built | cert_id, num_splits, terms[], amounts[] |
| `action.redirected` | Funds moved elsewhere | cert_id, destination_type, amount |
| `action.withdrawn` | Funds withdrawn | cert_id, amount |
| `maturity.expired_no_action` | Grace period ended, auto-rolled | cert_id, balance, new_rate, new_term |

**Calculated Metrics:**

- **Retention Rate** = (balance renewed + balance laddered) / total maturing balance
- **Engagement Rate** = decision_hub.viewed / maturity.approaching
- **Conversion Rate** = action.* / decision_hub.viewed
- **Add-On Rate** = sum(funds_added) / sum(maturing_balance)
- **Attrition Rate** = (balance redirected + withdrawn) / total maturing balance
- **Notification Effectiveness** = notification.opened / notification.sent (per channel, per interval)

---

### 5. FI Admin Console

**Purpose:** Allow FI administrators to configure all aspects of the engagement experience without requiring code changes or deployments.

**Sections:**

#### 5a. Notification Configuration
- Timeline intervals (add/remove/modify days-before-maturity triggers)
- Channel selection per interval
- Template editor (subject line, body copy, CTA) with merge fields: `{{member_name}}`, `{{cert_balance}}`, `{{cert_rate}}`, `{{cert_maturity_date}}`, `{{days_remaining}}`
- Preview & test send capability

#### 5b. Product & Rate Configuration
- Select available certificate terms for renewal
- Add alternative products to recommend
- Configure rate tier thresholds and balance breakpoints
- Set loyalty/retention rate premiums (flat or percentage)
- Define which recommendation rules are active

#### 5c. Engagement Rules
- Priority tier definitions (balance thresholds, relationship depth criteria)
- Suppression rules (min balance, do-not-contact flags, recent engagement)
- A/B test configuration (split traffic between messaging variants)

#### 5d. Reporting Access
- Role-based access to dashboards
- Scheduled report delivery (email)
- Export formats (CSV, PDF)

---

## Data Model

### Core Entities

```
┌─────────────────────────────┐
│         Certificate         │
├─────────────────────────────┤
│ cert_id (PK)                │
│ member_id (FK)              │
│ account_number              │
│ balance                     │
│ rate_apy                    │
│ term_months                 │
│ open_date                   │
│ maturity_date               │
│ grace_period_end_date       │
│ auto_renewal_term           │
│ dbp_source_id              │
│ last_synced_at              │
└──────────────┬──────────────┘
               │ 1:many
               ▼
┌─────────────────────────────┐
│     EngagementState         │
├─────────────────────────────┤
│ engagement_id (PK)          │
│ cert_id (FK)                │
│ state (enum)                │
│ entered_state_at            │
│ notification_count          │
│ last_notification_at        │
│ last_notification_channel   │
│ decision_hub_viewed_at      │
│ action_taken                │
│ action_taken_at             │
│ action_details (JSON)       │
│ outcome_balance             │
│ outcome_rate                │
│ outcome_term                │
│ funds_added                 │
└─────────────────────────────┘

┌─────────────────────────────┐
│     NotificationLog         │
├─────────────────────────────┤
│ log_id (PK)                 │
│ cert_id (FK)                │
│ member_id (FK)              │
│ channel (enum)              │
│ interval_days               │
│ template_id                 │
│ sent_at                     │
│ opened_at (nullable)        │
│ clicked_at (nullable)       │
│ suppressed (boolean)        │
│ suppression_reason          │
└─────────────────────────────┘

┌─────────────────────────────┐
│     Recommendation          │
├─────────────────────────────┤
│ rec_id (PK)                 │
│ cert_id (FK)                │
│ member_id (FK)              │
│ rec_type (enum)             │
│ rec_details (JSON)          │
│ shown_at                    │
│ accepted (boolean)          │
│ accepted_at (nullable)      │
└─────────────────────────────┘

┌─────────────────────────────┐
│     FIConfiguration         │
├─────────────────────────────┤
│ config_id (PK)              │
│ fi_id (FK)                  │
│ config_type (enum)          │
│ config_key                  │
│ config_value (JSON)         │
│ effective_from              │
│ effective_to (nullable)     │
│ created_by                  │
│ created_at                  │
│ updated_at                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│     EngagementEvent         │
├─────────────────────────────┤
│ event_id (PK)               │
│ cert_id (FK)                │
│ member_id (FK)              │
│ event_type (enum)           │
│ event_data (JSON)           │
│ timestamp                   │
│ session_id                  │
│ source (enum)               │
└─────────────────────────────┘
```

### Enums

```
EngagementState.state:
  DORMANT | NOTIFIED | ENGAGED | RESOLVED | EXPIRED

NotificationLog.channel:
  PUSH | EMAIL | IN_APP | SMS

Recommendation.rec_type:
  BALANCE_TIER_NUDGE | TERM_OPTIMIZATION | LADDER_SUGGESTION |
  PRODUCT_CROSS_SELL | LOYALTY_RENEWAL | DEFAULT_RENEWAL

EngagementEvent.event_type:
  MATURITY_APPROACHING | NOTIFICATION_SENT | NOTIFICATION_OPENED |
  DECISION_HUB_VIEWED | RECOMMENDATION_SHOWN | RECOMMENDATION_ACCEPTED |
  ACTION_RENEW_SAME | ACTION_RENEW_MODIFIED | ACTION_LADDER_CREATED |
  ACTION_REDIRECTED | ACTION_WITHDRAWN | MATURITY_EXPIRED

EngagementEvent.source:
  PUSH_NOTIFICATION | EMAIL_LINK | IN_APP_BANNER | ACCOUNT_DETAIL |
  DIRECT_NAVIGATION

FIConfiguration.config_type:
  NOTIFICATION_TIMING | NOTIFICATION_TEMPLATE | CHANNEL_SETTINGS |
  PRODUCT_AVAILABILITY | RATE_TIERS | RECOMMENDATION_RULES |
  SUPPRESSION_RULES | PRIORITY_TIERS | AB_TEST
```

---

## Integration Points with Digital Banking Platform

### Consumed from DBP (Read)

| Data | Purpose | Method |
|------|---------|--------|
| Certificate account list | Identify all active certificates | DBP Account API |
| Certificate details (balance, rate, term, maturity date) | Populate decision hub, drive orchestration | DBP Account API |
| Member profile (name, email, push token, preferences) | Deliver notifications, personalize recommendations | DBP Member Profile API |
| Current rate sheet (terms and rates) | Show renewal options, calculate recommendations | DBP Rate Feed |
| Linked accounts (checking, savings, money market) | Enable fund transfers and add-funds flow | DBP Account API |
| Available products | Recommend alternatives at maturity | DBP Product Catalog API |

### Executed via DBP (Write)

| Action | Purpose | Method |
|--------|---------|--------|
| Send push notification | Maturity reminders | DBP Notification Service |
| Send email | Maturity reminders and confirmations | DBP Notification Service |
| Renew certificate | Execute member's renewal decision | DBP Transaction Execution API |
| Transfer funds | Move funds between accounts | DBP Transaction Execution API |
| Open new certificate(s) | Ladder creation | DBP Account Opening API |
| Display in-app message/banner | Awareness during active sessions | DBP In-App Messaging SDK |

### MaturitySync Owns

| Data/Service | Notes |
|--------------|-------|
| Engagement state per certificate | MaturitySync's state machine |
| Notification history & analytics | What was sent, opened, acted on |
| Recommendation history | What was shown, accepted/dismissed |
| FI configuration | Admin-defined rules, templates, thresholds |
| Engagement events log | Full audit trail for analytics |
| Calculated metrics & reports | Retention, conversion, growth attribution |

---

## Deployment Model

MaturitySync is designed to deploy as:

**Option A: Embedded Module** (preferred for tight DBP integrations)
- Deployed within the DBP's infrastructure
- Shares authentication/session context natively
- UI components rendered as part of the DBP's frontend
- Backend services run as microservices alongside DBP services

**Option B: Sidecar SaaS** (for DBPs without deep plugin architecture)
- Deployed as a standalone service with API integration to the DBP
- SSO/token exchange for seamless member authentication
- UI embedded via iframe or web component in the DBP frontend
- Webhook subscriptions for real-time data sync

---

## Security Considerations

- **No PII storage duplication:** MaturitySync references member data by ID; PII (name, email, account numbers) is fetched from DBP at render/send time, not stored long-term in MaturitySync's data store.
- **Transactional authorization:** All financial actions (renew, transfer, open) are executed through the DBP's existing transaction APIs, inheriting the DBP's authorization controls (MFA, session validation, limits).
- **Admin access control:** FI Admin Console access governed by role-based permissions within the DBP's admin framework.
- **Audit trail:** All engagement events and actions logged with timestamps, member IDs, and session IDs for compliance.
- **Data retention:** Engagement event data retained per FI's data retention policy (configurable, default 24 months).

---

## Technology Considerations

### Frontend (Decision Hub UI)
- Built as framework-agnostic web components OR as an SDK for major DBP frontend frameworks (React, Angular, Vue)
- Responsive design — mobile-first, works on desktop
- Theming support — inherits the FI's design system (colors, typography, spacing)

### Backend (Orchestration, Recommendations, Analytics)
- RESTful API for DBP integration
- Event-driven architecture for notification triggers (scheduled jobs + event subscriptions)
- Horizontally scalable — stateless services with shared data store
- Database: relational (PostgreSQL) for transactional/config data; time-series or columnar store for analytics events

### Admin Console
- Web-based SPA
- Real-time preview of notification templates
- Drag-and-drop timeline configuration
- Dashboard visualizations (charting library — e.g., D3, Chart.js, or Recharts)
