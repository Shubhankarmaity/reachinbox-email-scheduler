# 📧 ReachInbox — Full-Stack Email Job Scheduler

> A production-oriented full-stack email scheduling platform built for the **ReachInbox Software Development Intern** hiring assignment.

ReachInbox provides an authenticated dashboard for creating email campaigns, importing leads, scheduling email delivery, managing multiple SMTP senders, monitoring BullMQ jobs, searching email records with Elasticsearch, and integrating external services such as Google OAuth and Slack OAuth.

---

## 📑 Table of Contents

- [Assignment Overview](#1-assignment-overview)
- [Solution Summary](#2-solution-summary)
- [Technology Stack](#3-technology-stack)
- [Project Structure](#4-project-structure)
- [Backend Design](#5-backend-design)
- [Why BullMQ Instead of Cron](#6-why-bullmq-instead-of-cron)
- [Persistence and Restart Recovery](#7-persistence-and-restart-recovery)
- [Idempotency and Duplicate Protection](#8-idempotency-and-duplicate-protection)
- [Worker Concurrency](#9-worker-concurrency)
- [Minimum Delay Between Emails](#10-minimum-delay-between-emails)
- [Hourly Rate Limiting](#11-hourly-rate-limiting)
- [High-Load Behavior](#12-high-load-behavior)
- [Elasticsearch Search](#13-elasticsearch-search)
- [Google OAuth](#14-google-oauth)
- [Slack Integration](#15-slack-integration)
- [Bull Board](#16-bull-board)
- [Frontend Features](#17-frontend-features)
- [Frontend Routes](#18-frontend-routes)
- [Environment Configuration](#19-environment-configuration)
- [Prerequisites](#21-prerequisites)
- [Getting Started](#22-run-infrastructure)
- [API Overview](#29-api-overview)
- [Ethereal Email](#30-ethereal-email)
- [Testing](#33-testing)
- [End-to-End Test Procedure](#34-end-to-end-test-procedure)
- [Security Notes](#41-security-notes)
- [Design Decisions](#42-design-decisions)
- [Submission Checklist](#44-submission-checklist)
- [Final Architecture Summary](#47-final-architecture-summary)

---

## 1. Assignment Overview

The assignment requires a reliable email scheduler and dashboard that can:

- Accept email scheduling requests through APIs.
- Schedule messages for a specific future time.
- Use **BullMQ + Redis** for delayed job execution instead of cron.
- Persist application state in **PostgreSQL**.
- Send messages through **Ethereal Email** SMTP.
- Support **multiple senders**.
- Support **configurable worker concurrency**.
- Enforce a **minimum delay** between sends.
- Enforce **configurable hourly email limits**.
- Coordinate rate limiting safely across workers using **shared state**.
- Reschedule rate-limited jobs rather than dropping them.
- Prevent duplicate scheduling/processing through **idempotency and state guards**.
- Index email records in **Elasticsearch** for search.
- Expose a live **BullMQ/Bull Board** queue dashboard.
- Survive application and worker restarts.
- Provide a **React dashboard** with Google OAuth authentication.
- Allow **CSV/TXT lead import** and recipient management.
- Support **Slack OAuth** and Slack notifications for rate-limit events.

### 🎬 Walkthrough & Demo Video

> Watch the **5-Minute System Walkthrough**:
> 🔗 [Google Drive — Demo Video](https://drive.google.com/drive/folders/1D5hb5a1cqRtoiE0WKnxxPFpNGjvzDZP6?usp=sharing)
>
> *(Covers: Campaign scheduling, BullMQ delayed queue, worker rate-limiting, Ethereal delivery proof, and server crash/restart recovery)*

**Figma reference** supplied with the assignment:
[ReachInbox Assignment UI (Figma)](https://www.figma.com/design/uVjz66YBpL2TVNApQXETSt/ReachInbox-Assignment-UI?node-id=6-3&t=7onVG9Mp0ClziUfn-1)

---

## 2. Solution Summary

The project is organized as a **monorepo**:

```
reachinbox/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

The API server and email worker are **deliberately separate processes**:

```
Browser
   │
   ▼
React + Vite
   │
   │ /api
   ▼
Express API
   │
   ├──────────────► PostgreSQL
   │
   ├──────────────► Redis
   │                    │
   │                    ▼
   │                 BullMQ
   │                    │
   │                    ▼
   │              Email Worker
   │                    │
   │                    ▼
   │               Ethereal SMTP
   │
   └──────────────► Elasticsearch
```

**Additional integrations:**

```
Express API
   ├── Google OAuth
   ├── Slack OAuth
   └── Bull Board
```

### Source of Truth

- **PostgreSQL** is the authoritative source for business state.
- **Redis/BullMQ** handles asynchronous job execution, delayed jobs, sessions, and shared rate-limit state.
- **Elasticsearch** is a secondary search index.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js 22+, TypeScript, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Queue | BullMQ |
| Queue/Session/Rate-limit Store | Redis |
| Search | Elasticsearch |
| SMTP | Ethereal Email + Nodemailer |
| Authentication | Google OAuth |
| Integration | Slack OAuth |
| Queue Monitoring | Bull Board |
| Infrastructure | Docker / Docker Compose |

---

## 4. Project Structure

```
reachinbox/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── integrations/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   └── workers/
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   │
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 5. Backend Design

### 5.1 Scheduling Flow

```
User creates campaign
        │
        ▼
POST /api/emails/schedule
        │
        ▼
Request validation
        │
        ├── Idempotency check
        ├── Sender validation
        ├── Campaign persistence
        └── Email persistence
        │
        ▼
BullMQ delayed jobs
        │
        ▼
Redis
        │
        ▼
Email Worker
        │
        ├── Verify persistent email state
        ├── Apply rate limit
        ├── Apply minimum delay
        ├── Mark PROCESSING
        └── Send SMTP message
        │
        ▼
Ethereal SMTP
        │
        ▼
Update PostgreSQL
        │
        ├── SENT
        └── FAILED
        │
        ▼
Index/update Elasticsearch
```

> The API request does **not** perform the SMTP send synchronously. It persists the scheduling state and creates the asynchronous queue jobs.

### 5.2 Email Status Lifecycle

The email state machine is:

```
SCHEDULED
    │
    ▼
QUEUED
    │
    ▼
PROCESSING
    │
    ├──────────────► SENT
    │
    └──────────────► FAILED
```

When a **rate limit** is reached:

```
QUEUED / PROCESSING
        │
        ▼
RATE_LIMITED
        │
        ▼
Rescheduled for a later window
        │
        ▼
QUEUED
```

> A rate-limited message is **not** intentionally discarded.

---

## 6. Why BullMQ Instead of Cron

The assignment **explicitly prohibits** cron-based scheduling.

This project does **not** use:

- `node-cron`
- `cron`
- `Agenda`
- OS-level cron jobs
- polling-based timer scheduling for email delivery

Future messages are represented as **BullMQ delayed jobs** in Redis. That allows the queue itself to retain the future execution state independently of the Express process.

---

## 7. Persistence and Restart Recovery

The project uses two complementary persistence layers:

**PostgreSQL** — Stores authoritative business state including:
- Users
- Campaigns
- Senders
- Emails
- Slack connections

**Redis/BullMQ** — Stores:
- Delayed jobs
- Queue state
- Session state
- Shared rate-limit counters/state

### Recovery Strategy

At application startup, reconciliation checks persisted application state and queue state.

```
Future scheduled email
        │
        ▼
Application restart
        │
        ▼
Persisted state remains
        │
        ▼
Queue state is reconciled
        │
        ▼
Worker continues processing
```

> Emails already marked **SENT** are not treated as new unsent messages.

---

## 8. Idempotency and Duplicate Protection

The scheduling endpoint accepts an `Idempotency-Key` header.

```
Idempotency-Key: <unique-request-id>
```

The key is stored with the campaign and protected by a **database uniqueness constraint**.

This means a retry using the same idempotency key can safely identify the existing scheduling request instead of creating another campaign.

```
Request #1
   ↓
Campaign created

Request #2 (same Idempotency-Key)
   ↓
Existing campaign found
   ↓
No duplicate campaign
```

The worker also checks persisted email state before performing the external SMTP side effect.

### Exactly-once Caveat

True exactly-once delivery cannot be guaranteed across an application boundary and an external SMTP provider because the SMTP operation itself is an external side effect.

The implementation therefore uses **application-level protections**:

- Idempotent scheduling
- Persistent email status
- `PROCESSING` state
- `SENT` state checks
- Queue reconciliation
- Worker-side state validation

> These protections are designed to prevent intentional duplicate submission by the application.

---

## 9. Worker Concurrency

Worker concurrency is configurable through environment configuration.

```env
WORKER_CONCURRENCY=5
```

Conceptually:

```
Worker concurrency = 5

Job 1 ─┐
Job 2 ─┤
Job 3 ─┼──► Email Worker
Job 4 ─┤
Job 5 ─┘
```

The worker is run separately from the Express API, allowing the processing capacity to be scaled independently.

---

## 10. Minimum Delay Between Emails

A configurable minimum delay is used to mimic provider throttling.

```env
EMAIL_SEND_DELAY_MS=2000
```

This corresponds to a configured minimum spacing of approximately **2 seconds** between individual sends handled by the scheduler.

The value can be changed through the environment without changing application source code.

---

## 11. Hourly Rate Limiting

The scheduler supports a configurable per-sender hourly limit.

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

Rate-limit state is backed by **Redis** rather than an in-memory counter.

```
Sender
  │
  ▼
Redis rate-limit state
  │
  ├── Limit available
  │       │
  │       ▼
  │      SEND
  │
  └── Limit reached
          │
          ▼
     RATE_LIMITED
          │
          ▼
      Reschedule
```

This design allows multiple worker processes to coordinate against shared state.

> When the limit is reached, the job is **delayed/rescheduled** instead of being permanently dropped.

---

## 12. High-Load Behavior

The scheduler is designed for workloads where **1000+ emails** are scheduled around the same time.

The API does **not** synchronously send all messages. Instead:

```
1000+ email records
        │
        ▼
PostgreSQL
        +
BullMQ delayed jobs
        │
        ▼
Redis
        │
        ▼
Concurrent workers
        │
        ├── rate limiting
        ├── send delay
        └── controlled SMTP delivery
```

For a large campaign, the system keeps persistent email records while BullMQ controls asynchronous execution.

> Ethereal remains a testing SMTP service, so the demo does not need to actually deliver 1000 real emails.

---

## 13. Elasticsearch Search

Email records are indexed into Elasticsearch as a secondary search representation.

**Typical searchable fields include:**
- Recipient
- Sender
- Subject
- Campaign
- Status
- User
- Timestamps

**Flow:**

```
Search page
     │
     ▼
GET /api/search/emails
     │
     ▼
Express API
     │
     ▼
Elasticsearch
     │
     ▼
Search results
     │
     ▼
React UI
```

> PostgreSQL remains the authoritative data store.

---

## 14. Google OAuth

The application uses **real Google OAuth** authentication.

```
Login
  │
  ▼
Google Authorization
  │
  ▼
Backend OAuth Callback
  │
  ▼
Server-side Session
  │
  ▼
Dashboard
```

The authenticated user is shown in the application header with:
- Name
- Email
- Avatar
- Logout action

Protected frontend routes redirect unauthenticated users to `/login`.

---

## 15. Slack Integration

Slack is implemented as a separate OAuth-based integration.

```
Integrations
     │
     ▼
Connect Slack
     │
     ▼
Slack OAuth
     │
     ▼
OAuth callback
     │
     ▼
Slack connection stored
     │
     ▼
Connected state in dashboard
```

The application also supports **disconnect/reconnect**.

> Slack is not required for the core email scheduling path, but it is required by the assignment for rate-limit notifications.

**Backend configuration:**

```env
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/slack/oauth/callback
```

> [!CAUTION]
> The Slack secrets must **never** be committed to source control.

---

## 16. Bull Board

Bull Board provides live visibility into the email queue.

The backend exposes the queue dashboard at:

```
http://localhost:5000/api/admin/queues
```

The ReachInbox dashboard provides a link to open it.

**Useful queue states:**
- Waiting
- Delayed
- Active
- Completed
- Failed

A scheduled email should generally progress through:

```
Delayed → Active → Completed
```

---

## 17. Frontend Features

The frontend implements the required dashboard flow.

### Authentication
- Google Login
- Authenticated session
- User name, email, avatar
- Logout
- Protected routes
- Unauthorized-session handling

### Dashboard
- Scheduled count
- Sent count
- Sender count
- Failed count
- Recent emails
- Queue status
- Bull Board access
- Quick navigation to Compose, Scheduled, and Search

### Compose
- Campaign name
- Sender selection
- Recipient entry
- CSV lead import
- TXT lead import
- Lead count & duplicate removal
- Subject & body
- Start time
- Minimum delay
- Hourly limit
- Schedule action

### Scheduled
Displays: Email, Subject, Scheduled time, Status, Email details

### Sent
Displays: Email, Subject, Sent/update time, Status

### Search
Provides Elasticsearch-backed email search and filters.

### Senders
- Create sender
- View sender list
- Active/inactive state
- SMTP configuration

### Integrations
- Google account information
- Slack connection management

---

## 18. Frontend Routes

| Route | Purpose |
|---|---|
| `/login` | Google authentication |
| `/dashboard` | Main dashboard |
| `/compose` | Create and schedule campaign |
| `/scheduled` | Scheduled email list |
| `/sent` | Sent/failed email list |
| `/senders` | Sender management |
| `/search` | Elasticsearch search |
| `/integrations` | Google and Slack integrations |

---

## 19. Environment Configuration

### Backend `.env`

Create `backend/.env`:

```env
NODE_ENV=development

PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/reachinbox

REDIS_URL=redis://localhost:6379

ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

SESSION_SECRET=replace_with_a_random_secret_at_least_32_characters

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/slack/oauth/callback

ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=
ETHEREAL_PASSWORD=

WORKER_CONCURRENCY=5
EMAIL_SEND_DELAY_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

> [!WARNING]
> **Never** commit the real `.env`. Only commit `.env.example` files containing placeholders.

---

## 20. Frontend Environment

For the current local setup, the frontend uses `/api` requests and the Vite development server proxies them to the local backend.

```
Browser
http://localhost:5173/api
        │
        ▼
Vite proxy
        │
        ▼
http://localhost:5000/api
```

> No backend secrets should be placed in the frontend.

> [!CAUTION]
> **Never** expose these values in frontend environment variables:
> - `DATABASE_URL`
> - `REDIS_URL`
> - `SESSION_SECRET`
> - `GOOGLE_CLIENT_SECRET`
> - `SLACK_CLIENT_SECRET`
> - `ETHEREAL_PASSWORD`

---

## 21. Prerequisites

Install the following:

- **Node.js 22+**
- **npm**
- **Docker Desktop**
- **Git**

---

## 22. Run Infrastructure

From the repository root:

```bash
docker compose up -d
```

Check the services:

```bash
docker compose ps
```

Required infrastructure includes: **PostgreSQL**, **Redis**, **Elasticsearch**.

---

## 23. Run Backend API

Open **Terminal 1**:

```bash
cd backend
npm install
```

Run migrations:

```bash
npx prisma migrate deploy
```

Start the API:

```bash
npm run dev
```

- **API:** `http://localhost:5000`
- **Health check:** `http://localhost:5000/health`

---

## 24. Run Email Worker

Open **Terminal 2**:

```bash
cd backend
npm run dev:worker
```

The worker runs independently from the API.

For a production-style compiled run:

```bash
npm run build
npm start
npm run start:worker
```

---

## 25. Run Frontend

Open **Terminal 3**:

```bash
cd frontend
npm install
npm run dev
```

**Frontend:** `http://localhost:5173`

---

## 26. Local Development Setup

The complete local runtime is:

| Terminal | Command |
|---|---|
| Terminal 1 | `docker compose up -d` |
| Terminal 2 | `cd backend && npm run dev` |
| Terminal 3 | `cd backend && npm run dev:worker` |
| Terminal 4 | `cd frontend && npm run dev` |

---

## 27. Backend NPM Scripts

```bash
npm run dev          # Start API in development mode
npm run dev:worker   # Start email worker in development mode
npm run build        # Compile TypeScript
npm start            # Run compiled API
npm run start:worker # Run compiled worker
npm run typecheck    # Type checking
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## 28. Frontend NPM Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run typecheck # Type checking
npm run preview   # Preview production build
```

---

## 29. API Overview

### Authentication

```
GET  /api/auth/me
GET  /api/auth/google
POST /api/auth/logout
```

### Senders

```
GET   /api/senders
POST  /api/senders
PATCH /api/senders/:senderId/status
```

### Emails

```
POST /api/emails/schedule
GET  /api/emails/scheduled
GET  /api/emails/sent
GET  /api/emails/:emailId
```

### Search

```
GET /api/search/emails
```

### Slack

```
GET  /api/slack/status
GET  /api/slack/oauth
POST /api/slack/disconnect
```

### Queue Monitoring

```
GET /api/admin/queues
```

---

## 30. Ethereal Email

Ethereal is used because the assignment requires a fake SMTP provider for testing.

Create an Ethereal account: [https://ethereal.email/](https://ethereal.email/)

Configure the generated credentials in `.env`:

```env
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_username
ETHEREAL_PASSWORD=your_ethereal_password
```

### Pre-Configured Test Senders (Ready for Evaluator Testing)

To test the system immediately with multiple senders without needing to manually generate new Ethereal accounts, you can add either or both of these pre-created test senders via the **/senders** page:

#### Sender 1

| Field | Value |
|---|---|
| Display Name | `Evie Kemmer` |
| Email | `evie6@ethereal.email` |
| SMTP Host | `smtp.ethereal.email` |
| SMTP Port | `587` |
| SMTP Username | `evie6@ethereal.email` |
| SMTP Password | `qZB54fBF5MczAvWrnt` |
| Web Mailbox | [https://ethereal.email/messages](https://ethereal.email/messages) *(Log in with `evie6@ethereal.email` / `qZB54fBF5MczAvWrnt`)* |

#### Sender 2

| Field | Value |
|---|---|
| Display Name | `Perry Rau` |
| Email | `perry60@ethereal.email` |
| SMTP Host | `smtp.ethereal.email` |
| SMTP Port | `587` |
| SMTP Username | `perry60@ethereal.email` |
| SMTP Password | `E8gpPJwBj19d2AeWh9` |
| Web Mailbox | [https://ethereal.email/messages](https://ethereal.email/messages) *(Log in with `perry60@ethereal.email` / `E8gpPJwBj19d2AeWh9`)* |

> [!IMPORTANT]
> Ethereal captures test messages for inspection; it is **not** a production delivery provider.
>
> For the assignment demo:
> ```
> ReachInbox → BullMQ → Worker → Ethereal SMTP → Ethereal Mailbox
> ```
> Do **not** expect the test message to arrive in the real recipient's Gmail inbox.

---

## 31. Google OAuth Setup

1. Create Google OAuth credentials in **Google Cloud**.
2. Configure the authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
3. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

---

## 32. Slack OAuth Setup

1. Create a **Slack app** and configure the OAuth redirect URL:
   ```
   http://localhost:5000/api/slack/oauth/callback
   ```
2. Add to `.env`:
   ```env
   SLACK_CLIENT_ID=
   SLACK_CLIENT_SECRET=
   SLACK_REDIRECT_URI=http://localhost:5000/api/slack/oauth/callback
   ```

> The Client ID and Client Secret must be taken from the Slack app configuration. **Do not commit the secret.**

---

## 33. Testing

### Backend Type Checking

```bash
cd backend
npm run typecheck
```

### Frontend Type Checking

```bash
cd frontend
npm run typecheck
```

### Backend Tests

```bash
cd backend
npm test
```

### Production Builds

**Backend:**

```bash
cd backend
npm run build
```

**Frontend:**

```bash
cd frontend
npm run build
```

---

## 34. End-to-End Test Procedure

The following flow tests the application from the browser.

### Step 1 — Start Infrastructure

```bash
docker compose up -d
docker compose ps
```

### Step 2 — Start Backend

```bash
cd backend
npm run dev
```

### Step 3 — Start Worker

```bash
cd backend
npm run dev:worker
```

### Step 4 — Start Frontend

```bash
cd frontend
npm run dev
```

### Step 5 — Login

1. Open: `http://localhost:5173`
2. Sign in using Google OAuth.
3. **Verify:**
   - Dashboard opens.
   - User name is shown.
   - User email is shown.
   - Avatar is shown.
   - Logout is visible.

### Step 6 — Create Sender(s)

1. Open: `/senders`
2. Add the Ethereal SMTP sender (you can use either of the pre-configured test senders detailed in [Section 30](#30-ethereal-email), e.g. `evie6@ethereal.email` or `perry60@ethereal.email`). You can add both to test multi-sender support.

### Step 7 — Compose Campaign

1. Open: `/compose`
2. Set:
   - Campaign name
   - Sender
   - Recipient(s)
   - Subject
   - Body
   - Start time
   - Email delay
   - Hourly limit

### Step 8 — Test CSV/TXT Import

1. Upload a `.csv` or `.txt` file containing email addresses.
2. **Verify:**
   - Addresses are extracted.
   - Duplicates are removed.
   - Detected lead count is displayed.

### Step 9 — Schedule

1. Click **Schedule**.
2. Verify that the campaign appears on `/scheduled`.

### Step 10 — Worker Processing

1. Wait for the configured start time.
2. Verify the worker processes the delayed job.

### Step 11 — Sent State

1. Open: `/sent`
2. Verify the email reaches `SENT`.

### Step 12 — Ethereal

Open the Ethereal mailbox and verify the captured message.

### Step 13 — Search

1. Open: `/search`
2. Search by subject or recipient.
3. Verify the email is returned by Elasticsearch.

### Step 14 — Bull Board

1. Open the queue dashboard: `/api/admin/queues`
2. Inspect delayed, active and completed jobs.

### Step 15 — Logout

1. Click **Logout**.
2. Verify redirect to `/login` and that protected routes redirect unauthenticated users to login.

---

## 35. Restart Persistence Test

A **critical assignment requirement** is that future jobs survive a restart.

### Test

1. Schedule an email several minutes into the future.
2. Confirm it appears on `/scheduled`.
3. **Stop** the backend.
4. **Start** the backend again.
5. Restart the worker if needed.
6. Confirm the email still exists.
7. Wait for its scheduled time.
8. Confirm it is processed and reaches `SENT`.
9. Confirm the email is **not** duplicated.

**Expected:**

```
SCHEDULED → Backend restart → Still persisted → Worker resumes → SENT
```

---

## 36. Rate-Limit Test

Use a small controlled campaign:

| Parameter | Value |
|---|---|
| Recipients | 2 |
| Hourly limit | 1 |

**Expected behavior:**

```
Email 1 → SENT
Email 2 → RATE_LIMITED / rescheduled
```

> The second job should remain recoverable and should **not** be silently dropped.
> Restore the normal rate limit after testing.

---

## 37. Minimum Delay Test

| Parameter | Value |
|---|---|
| Recipients | 3 |
| Delay | 5000 ms |

The worker should maintain approximately the configured spacing between sends.

---

## 38. Idempotency Test

Use the same `Idempotency-Key` for two scheduling attempts.

**Expected:**

```
Request 1 → campaign created
Request 2 → existing scheduling operation recognized
```

> There should **not** be a second duplicate campaign generated from the same idempotency request.

---

## 39. 1000+ Lead Test

1. Create a CSV containing **1000+ unique addresses**.
2. Upload it through Compose.
3. **Verify:**
   - The browser remains responsive.
   - Lead parsing completes.
   - The displayed count is correct.
   - Duplicate addresses are removed.
   - The scheduler can persist the resulting email records.
   - BullMQ receives the jobs.

> The assignment does not require actually delivering 1000 emails through Ethereal during the demo.

---

## 40. Error and Empty States

The frontend includes states for:

- Loading
- Empty collections
- API failures
- Invalid input
- Unauthorized sessions
- Failed operations

**Examples:**
- No scheduled emails
- No sent emails
- No senders configured
- No matching search results
- Unable to load dashboard

> The application should not display an unhandled blank screen for normal API failures.

---

## 41. Security Notes

- Secrets are **backend-only**.
- The project should not commit `.env` or `.env.local`.
- Authentication uses **server-side session handling**.
- OAuth flows use **callback validation/state handling**.
- Input validation is performed through **Zod**.
- HTTP security headers are configured with **Helmet**.
- Authenticated API calls use **session cookies**.
- Idempotency protects retry behavior on scheduling operations.

---

## 42. Design Decisions

| Decision | Rationale |
|---|---|
| **PostgreSQL** | Source of truth — campaign, sender, and email state must survive application restarts independently of worker execution. |
| **Redis + BullMQ** | Durable delayed jobs and asynchronous execution without cron. Redis also provides shared state for sessions and rate limiting. |
| **Separate Worker** | SMTP delivery does not block HTTP requests and worker concurrency can be scaled independently. |
| **Elasticsearch** | Secondary read/search index while PostgreSQL remains authoritative. |
| **Ethereal** | Safe SMTP testing environment for demonstrating the scheduler without sending production email. |

---

## 43. Assumptions and Trade-offs

- Ethereal is used for testing rather than production deliverability.
- SMTP exactly-once delivery cannot be guaranteed across an external provider boundary.
- PostgreSQL is authoritative; Elasticsearch can be rebuilt from persistent data.
- Redis is expected to use persistent Docker storage in the provided development environment.
- Email sending is asynchronous and therefore eventual from the user's point of view.
- The local demo uses localhost ports for frontend and backend.
- Google and Slack OAuth depend on valid external application credentials configured in the evaluator environment.

---

## 44. Submission Checklist

### Repository

- [ ] Private GitHub repository created.
- [ ] Required reviewers/access added.
- [ ] `.env` and secrets are excluded from Git.
- [ ] Root README is present.
- [ ] Backend and frontend build successfully.

### Backend

- [ ] API starts successfully.
- [ ] Worker starts separately.
- [ ] PostgreSQL works.
- [ ] Redis works.
- [ ] Elasticsearch works.
- [ ] BullMQ delayed scheduling works.
- [ ] No cron scheduler is used.
- [ ] Idempotency works.
- [ ] Restart recovery works.
- [ ] Worker concurrency is configurable.
- [ ] Email delay is configurable.
- [ ] Hourly rate limiting works.
- [ ] Rate-limited jobs are rescheduled.
- [ ] Slack rate-limit notification is tested live.
- [ ] Bull Board works.

### Frontend

- [ ] Google OAuth works.
- [ ] Dashboard loads real data.
- [ ] User information is displayed.
- [ ] Logout works.
- [ ] Sender creation works.
- [ ] Compose works.
- [ ] CSV/TXT import works.
- [ ] Lead count is shown.
- [ ] Scheduled list works.
- [ ] Sent list works.
- [ ] Search works.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error states work.
- [ ] Responsive layout works.

---

## 46. Useful Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| Backend Health | `http://localhost:5000/health` |
| Bull Board | `http://localhost:5000/api/admin/queues` |
| Elasticsearch | `http://localhost:9200` |

---

## 47. Final Architecture Summary

```
                       ┌──────────────────────┐
                       │       Browser        │
                       │  React + TypeScript  │
                       │      :5173           │
                       └──────────┬───────────┘
                                  │
                              /api proxy
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │    Express API       │
                       │      :5000           │
                       └───────┬─────┬────────┘
                               │     │
                    ┌──────────┘     └──────────────┐
                    ▼                               ▼
             ┌──────────────┐              ┌────────────────┐
             │  PostgreSQL  │              │ Redis / BullMQ │
             │ Source State │              │ Queue + State  │
             └──────────────┘              └───────┬────────┘
                                                   │
                                                   ▼
                                           ┌────────────────┐
                                           │ Email Worker   │
                                           └───────┬────────┘
                                                   │
                                                   ▼
                                           ┌────────────────┐
                                           │ Ethereal SMTP  │
                                           └────────────────┘

                       ┌──────────────────────┐
                       │   Elasticsearch      │
                       │   Search Index       │
                       └──────────────────────┘

                       ┌──────────────────────┐
                       │ Google OAuth / Slack │
                       │ OAuth Integrations   │
                       └──────────────────────┘

                       ┌──────────────────────┐
                       │      Bull Board      │
                       │ Queue Monitoring     │
                       └──────────────────────┘
```

---

> **Built for the ReachInbox SDE Intern Assignment**
>
> The project focuses on the assignment's core engineering concerns: durable scheduling, asynchronous processing, persistence, rate limiting, concurrency, idempotency, search, authentication, integrations, and a usable frontend dashboard.