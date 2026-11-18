-- ResumeTracker Database Schema (PostgreSQL 16+)
-- Run this on your PostgreSQL database after configuring .env with DATABASE_URL
-- Example: psql -U youruser -d yourdb -f backend/database/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE application_status AS ENUM (
    'Draft', 'Applied', 'FollowupDue', 'FollowupSent',
    'InterviewScheduled', 'TechnicalRound', 'HRRound',
    'OfferReceived', 'Rejected', 'Closed'
);

CREATE TYPE application_source AS ENUM (
    'Naukri', 'LinkedIn', 'Foundit', 'Referral',
    'DirectRecruiter', 'CompanyWebsite', 'XTwitter', 'WhatsApp'
);
-- ResumeTracker Database Schema (PostgreSQL 16+)
-- Run this on your PostgreSQL database after updating .env with DATABASE_URL
-- Example: psql -U youruser -d yourdb -f backend/database/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE application_status AS ENUM (
    'Draft', 'Applied', 'FollowupDue', 'FollowupSent',
    'InterviewScheduled', 'TechnicalRound', 'HRRound',
    'OfferReceived', 'Rejected', 'Closed'
);

CREATE TYPE application_source AS ENUM (
    'Naukri', 'LinkedIn', 'Foundit', 'Referral',
    'DirectRecruiter', 'CompanyWebsite', 'XTwitter', 'WhatsApp'
);

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50) DEFAULT 'user',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recruiters (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255),
    designation   VARCHAR(255),
    company       VARCHAR(255),
    linked_in_url VARCHAR(500),
    phone         VARCHAR(50),
    source        application_source DEFAULT 'DirectRecruiter',
    notes         TEXT,
    created_date  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recruiters_company ON recruiters(company);
CREATE INDEX idx_recruiters_email ON recruiters(email);
-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50) DEFAULT 'user',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recruiters (includes Source field)
CREATE TABLE recruiters (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255),
    designation   VARCHAR(255),
    company       VARCHAR(255),
    linked_in_url VARCHAR(500),
    phone         VARCHAR(50),
    source        application_source DEFAULT 'DirectRecruiter',
    notes         TEXT,
    created_date  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recruiters_company ON recruiters(company);
CREATE INDEX idx_recruiters_email ON recruiters(email);
-- Email Templates
CREATE TABLE templates (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name  VARCHAR(255) NOT NULL,
    subject_template TEXT NOT NULL,
    body_template   TEXT NOT NULL,
    version        INTEGER DEFAULT 1,
    is_active      BOOLEAN DEFAULT TRUE,
    created_date   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Versions (history)
CREATE TABLE template_versions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id     UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    subject_template TEXT NOT NULL,
    body_template    TEXT NOT NULL,
    version         INTEGER NOT NULL,
    created_date    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume Repository (metadata only - file stored on disk)
CREATE TABLE resumes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_name VARCHAR(255) NOT NULL,
    version     VARCHAR(50) DEFAULT '1.0',
    file_path   TEXT NOT NULL,
    file_size   INTEGER,
    mime_type   VARCHAR(100),
    is_default  BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Applications (central entity - stores mergeData, not full email bodies)
CREATE TABLE applications (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id     UUID NOT NULL REFERENCES recruiters(id),
    template_id      UUID REFERENCES templates(id),
    template_version INTEGER,
    resume_id        UUID REFERENCES resumes(id),
    position         VARCHAR(255) NOT NULL,
    location         VARCHAR(255),
    source           application_source DEFAULT 'DirectRecruiter',
    applied_date     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status           application_status DEFAULT 'Draft',
    message_id       VARCHAR(255),
    recipient_email  VARCHAR(255),
    sent_timestamp   TIMESTAMP WITH TIME ZONE,
    next_followup_date TIMESTAMP WITH TIME ZONE,
    remarks          TEXT,
    merge_data       JSONB,
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_recruiter_id ON applications(recruiter_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);
CREATE INDEX idx_applications_next_followup_date ON applications(next_followup_date);

-- Follow-ups
CREATE TABLE followups (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status      VARCHAR(50) DEFAULT 'Pending', -- Pending, Sent, Completed, Skipped
    notes       TEXT,
    message_id  VARCHAR(255),
    sent_date   TIMESTAMP WITH TIME ZONE,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_followups_application_id ON followups(application_id);
CREATE INDEX idx_followups_followup_date ON followups(followup_date);
CREATE INDEX idx_followups_status ON followups(status);
-- Email Audit (metadata only - NO full email bodies stored)
CREATE TABLE email_audit (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    message_id     VARCHAR(255),
    recipient      VARCHAR(255) NOT NULL,
    subject        VARCHAR(500),
    sent_date      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by     UUID REFERENCES users(id)
);

CREATE INDEX idx_email_audit_application_id ON email_audit(application_id);
CREATE INDEX idx_email_audit_message_id ON email_audit(message_id);
CREATE INDEX idx_email_audit_sent_date ON email_audit(sent_date);

-- Refresh Tokens (JWT)
CREATE TABLE refresh_tokens (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token     VARCHAR(500) UNIQUE NOT NULL,
    user_id   UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Microsoft Graph OAuth Tokens (encrypted at rest)
CREATE TABLE graph_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token  TEXT NOT NULL,
    refresh_token TEXT,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    scope       VARCHAR(500),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);