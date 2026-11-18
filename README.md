# ResumeTracker

Personal Job Application Tracker — a lightweight Applicant Tracking System (ATS) for a single job seeker.

Built with **Node.js + Express + TypeScript**, **PostgreSQL 16+**, **Prisma ORM**, **React + Material UI**, and **Microsoft Graph API**.

## Core Modules

| Module | Description |
|--------|-------------|
| Recruiters | Store recruiter details with Source field (Naukri, LinkedIn, Foundit, Referral, etc.) |
| Email Templates | Reusable templates with merge tokens and versioning |
| Resume Repository | Store resume metadata (files stored on disk, paths in DB) |
| Applications | Central entity with mergeData storage (not full email bodies) |
| Follow-Up Engine | Auto-calculates follow-ups (Applied + 7 days) |
| Dashboard | Stats + charts (by month, company, status) |
| Export | Excel and CSV export with filters |
| Email Sending | Microsoft Graph API integration; or configure MailGun API key for alternative email sending |
# ResumeTracker

Personal Job Application Tracker — a lightweight Applicant Tracking System (ATS) for a single job seeker.

Built with **Node.js + Express + TypeScript**, **PostgreSQL 16+**, **Prisma ORM**, **React + Material UI**, and **Microsoft Graph API**.

## Core Modules

| Module | Description |
|--------|-------------|
| **Recruiters** | Store recruiter details (name, email, designation, company, LinkedIn, phone, source, notes) with search and history |
| **Email Templates** | Reusable templates with merge tokens (`{RecruiterName}`, `{Company}`, `{Position}`, `{Location}`) and versioning |
| **Resume Repository** | Store resume metadata (name, version, file path, default flag) |
| **Applications** | Central entity linking recruiter, template, resume; status lifecycle; merge data stored (not full bodies) |
| **Follow-Up Engine** | Auto-calculates follow-ups (Applied + 7 days); dashboard shows overdue / today / next 7 days |
| **Dashboard** | Stats (applications, interviews, offers, rejections, pending followups) + charts (by month, company, status) |
| **Export** | Excel and CSV export with filters |
| **Email Sending** | Microsoft Graph API integration; or configure MailGun API key for alternative email sending; captures MessageId; stores only metadata in EmailAudit |

## Design Principles

- **Single user** (local auth + JWT). Not a sales CRM.
- **Mailbox storage optimization**: full email bodies are never stored; messages are reconstructed from Template + MergeData. Only `MessageId`, recipient, subject, and sent date are persisted.
- **Source tracking**: every recruiter/application records a source (Naukri, LinkedIn, Foundit, Referral, Direct Recruiter, Company Website, X/Twitter, WhatsApp) so you can measure which channel produces interviews.
- **Clean layered architecture**: routes → controllers → services → Prisma → PostgreSQL.
- **REST APIs** with OpenAPI/Swagger-style route structure, environment-based config, error logging, and responsive MUI UI.

## Project Structure

```
careerledger/
├── backend/                 # Node.js + Express + Prisma
│   ├── prisma/schema.prisma # Database models & migrations
│   ├── src/
│   │   ├── config/          # env, database
│   │   ├── controllers/     # route handlers
│   │   ├── middleware/      # auth, error, logging
│   │   ├── routes/          # REST API routes
│   │   ├── services/        # graph, email, follow-up engine
│   │   └── utils/           # merge tokens, encryption
│   ├── seed/seed.ts         # Seed data
│   ├── Dockerfile
│   └── .env.example
├── frontend/                # React + Material UI + Vite
│   ├── src/
│   │   ├── pages/           # UI screens
│   │   ├── components/
│   │   ├── context/         # AuthContext
│   │   ├── services/        # API client + types
│   │   ├── theme.ts
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Postgres + backend + frontend
├── .env.example
└── README.md
```

## REST API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user
- `POST /api/auth/logout` — Logout

### Microsoft Graph (OAuth2)
- `GET /api/auth/microsoft/graph/login` — Connect Outlook
- `GET /api/auth/microsoft/graph/callback` — OAuth callback
- `GET /api/auth/microsoft/graph/status` — Connection status
- `POST /api/email/send` — Send application email (auth required)

### Recruiters
- `GET /api/recruiters` — List (search, company filter, paginated)
- `GET /api/recruiters/:id` — Get + history
- `POST /api/recruiters` — Create
- `PUT /api/recruiters/:id` — Update
- `DELETE /api/recruiters/:id` — Delete
- `GET /api/recruiters/:id/history` — Application history

### Templates

## Quick Start

### Prerequisites
- Node.js LTS (18+)
- PostgreSQL 16+
- Azure AD app registration (for Microsoft Graph email)

### Option 1: Docker (Recommended)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Edit backend/.env with your values
docker compose up --build
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### Option 2: Manual Install

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # optional seed data
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### Default Seed Credentials
- Email: `user@example.com`
- Password: `ChangeMe123!`
- `GET /api/templates` — List
- `GET /api/templates/:id` — Get
- `POST /api/templates` — Create
- `PUT /api/templates/:id` — Update
- `DELETE /api/templates/:id` — Delete
- `POST /api/templates/render` — Preview with merge data

### Resumes
- `GET /api/resumes` — List
- `POST /api/resumes` — Create (metadata only)
- `DELETE /api/resumes/:id` — Delete

### Applications
- `GET /api/applications` — List (filters: company, recruiter, position, status, source, date range; paginated)
- `GET /api/applications/:id` — Get details
- `POST /api/applications` — Create (auto schedules follow-up = applied + 7 days)
- `PUT /api/applications/:id` — Update
- `DELETE /api/applications/:id` — Delete

### Follow-ups
- `GET /api/followups` — List (?overdue=true, ?today=true, ?upcoming=true)
- `POST /api/followups` — Create
- `PUT /api/followups/:id` — Update
- `DELETE /api/followups/:id` — Delete

### Dashboard
- `GET /api/dashboard/stats` — Summary statistics
- `GET /api/dashboard/charts/applications-by-month`
- `GET /api/dashboard/charts/company-wise`
- `GET /api/dashboard/charts/status-distribution`
- `GET /api/dashboard/followups` — overdue / today / upcoming

### Export
- `GET /api/export/excel`
- `GET /api/export/csv`

## Quick Start

### Prerequisites
- Node.js LTS (18+)
- PostgreSQL 16+
- Azure AD app registration (for Microsoft Graph email)

### 1. Clone & install

```bash
cd careerledger

# Backend
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, MS_GRAPH_* values
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # optional seed data
npm run dev           # http://localhost:3001


## REST API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user
- `POST /api/auth/logout` — Logout

### Microsoft Graph (OAuth2)
- `GET /api/auth/microsoft/graph/login` — Connect Outlook
- `GET /api/auth/microsoft/graph/callback` — OAuth callback
- `GET /api/auth/microsoft/graph/status` — Connection status
- `POST /api/email/send` — Send application email

### Recruiters
- `GET /api/recruiters` — List (search, company filter, paginated)
- `GET /api/recruiters/:id` — Get + history
- `POST /api/recruiters` — Create
- `PUT /api/recruiters/:id` — Update
- `DELETE /api/recruiters/:id` — Delete
- `GET /api/recruiters/:id/history` — Application history

### Templates
- `GET /api/templates` — List
- `GET /api/templates/:id` — Get
- `POST /api/templates` — Create
- `PUT /api/templates/:id` — Update
- `DELETE /api/templates/:id` — Delete
- `POST /api/templates/render` — Preview with merge data

### Resumes
- `GET /api/resumes` — List
- `POST /api/resumes` — Create (metadata only)
- `DELETE /api/resumes/:id` — Delete

### Applications
- `GET /api/applications` — List (filters: company, recruiter, position, status, source, date range)
- `GET /api/applications/:id` — Get details
- `POST /api/applications` — Create (auto schedules follow-up = applied + 7 days)
- `PUT /api/applications/:id` — Update
- `DELETE /api/applications/:id` — Delete

### Follow-ups
- `GET /api/followups` — List (?overdue=true, ?today=true, ?upcoming=true)
- `POST /api/followups` — Create
- `PUT /api/followups/:id` — Update
- `DELETE /api/followups/:id` — Delete

### Dashboard
- `GET /api/dashboard/stats` — Summary statistics
- `GET /api/dashboard/charts/applications-by-month`
- `GET /api/dashboard/charts/company-wise`
- `GET /api/dashboard/charts/status-distribution`
- `GET /api/dashboard/followups` — overdue / today / upcoming

### Export
- `GET /api/export/excel`
- `GET /api/export/csv`
# Frontend (new terminal)
cd ../frontend
npm install
npm run dev           # http://localhost:5173
```

### 2. Docker (single command)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Edit backend/.env with your values
docker compose up --build
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### 3. Default seed credentials

After `npm run seed`:
- Email: `user@example.com`
- Password: `ChangeMe123!`

## Microsoft Graph Setup

1. Register an app in [Azure AD](https://portal.azure.com) (Microsoft Entra ID).
2. Enable "Treat application as a public client" = No (web app).
3. Add redirect URI: `http://localhost:3001/api/auth/microsoft/graph/callback`.
4. Grant API permission: `Mail.Send`, `User.Read`, `offline_access` (Microsoft Graph).
5. Add Client ID / Client Secret / Tenant ID to `backend/.env`.
6. Set `MS_GRAPH_SENDER_EMAIL` to your mailbox address.
7. In the app, open **Settings → Connect Microsoft Account** and complete OAuth consent.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing key for access tokens |
| `MS_GRAPH_CLIENT_ID` | Azure AD app client ID |
| `MS_GRAPH_CLIENT_SECRET` | Azure AD app client secret |
| `MS_GRAPH_TENANT_ID` | Azure AD tenant ID (or `common`) |
| `MS_GRAPH_SENDER_EMAIL` | Sender mailbox address |
| `MAILGUN_API_KEY` | MailGun API key |
| `MAILGUN_DOMAIN` | Verified MailGun domain |
| `MAIL_FROM` | Sender email address |

## Microsoft Graph Setup

1. Register an app in [Azure AD](https://portal.azure.com) (Microsoft Entra ID).
2. Add redirect URI: `http://localhost:3001/api/auth/microsoft/graph/callback`.
3. Grant API permission: `Mail.Send`, `User.Read`, `offline_access` (Microsoft Graph).
4. Add Client ID / Client Secret / Tenant ID to `backend/.env`.
5. Set `MS_GRAPH_SENDER_EMAIL` to your mailbox address.
6. In the app, open **Settings → Connect Microsoft Account** and complete OAuth consent.

## MailGun Setup

1. Sign up for a MailGun account at [mailgun.com](https://mailgun.com).
2. Verify your domain in the MailGun dashboard.
3. Add the following to `backend/.env`:
   - `MAILGUN_API_KEY=your_mailgun_api_key`
   - `MAILGUN_DOMAIN=your_verified_mailgun_domain`
   - `MAIL_FROM=your@sender.com`
4. In the app, open **Settings → Connect MailGun** and verify the connection.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing key for access tokens |
| `MS_GRAPH_CLIENT_ID` | Azure AD app client ID |
| `MS_GRAPH_CLIENT_SECRET` | Azure AD app client secret |
| `MS_GRAPH_TENANT_ID` | Azure AD tenant ID (or `common`) |
| `MS_GRAPH_SENDER_EMAIL` | Sender mailbox address |
| `ENCRYPTION_KEY` | Key to encrypt stored OAuth tokens (min 32 chars) |

## Production Notes

- Change all secrets in `.env` before production use.
- Run `npx prisma migrate deploy` on startup (Dockerfile does this automatically).
- Use a reverse proxy (Nginx/Traefik) with TLS in production.
- OAuth refresh tokens are encrypted at rest with `ENCRYPTION_KEY`.
- Resume files are stored on disk under `RESUME_UPLOAD_DIR`; only paths are saved in the DB.

## Database Schema

Run `backend/database/schema.sql` on your PostgreSQL database, or use Prisma migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

Key design decision: **EmailAudit stores only metadata** (MessageId, recipient, subject, sent date). Full email bodies are never stored — they are reconstructed from Template + MergeData when needed.

## Source Tracking

Every Recruiter and Application includes a `Source` field:
- Naukri, LinkedIn, Foundit, Referral, DirectRecruiter, CompanyWebsite, XTwitter, WhatsApp

This lets you analyze which channel produces interviews vs. just applications after 6 months.

## Future Enhancements

- Outlook inbox synchronization
- Automatic reply detection
- Microsoft Graph webhook notifications
- LinkedIn tracking notes
- Calendar integration
- WhatsApp notes
- AI-generated personalized email drafts
- AI-assisted follow-up recommendations
| `MS_GRAPH_CLIENT_ID` | Azure AD app client ID |
| `MS_GRAPH_CLIENT_SECRET` | Azure AD app client secret |
| `MS_GRAPH_TENANT_ID` | Azure AD tenant ID (or `common`) |
| `MS_GRAPH_SENDER_EMAIL` | Sender mailbox address |
| `ENCRYPTION_KEY` | Key to encrypt stored OAuth tokens |

## Production Notes

- Change all secrets in `.env`.
- Run `npx prisma migrate deploy` on startup (Dockerfile does this).
- Use a reverse proxy (Nginx/Traefik) with TLS in production.
- OAuth refresh tokens are encrypted at rest with `ENCRYPTION_KEY`.
- Resume files are stored on disk under `RESUME_UPLOAD_DIR`; only paths are saved in the DB.

## Future Enhancements (designed in)

- Outlook inbox synchronization
- Automatic reply detection
- Microsoft Graph webhook notifications
- LinkedIn tracking notes
- Calendar integration
- WhatsApp notes
- AI-generated personalized email drafts
- AI-assisted follow-up recommendations