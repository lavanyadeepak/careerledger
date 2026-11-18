-- ResumeTracker Seed Data
-- Run after schema.sql: psql -U youruser -d yourdb -f backend/database/seed.sql

-- Default user (password: ChangeMe123!)
INSERT INTO users (id, email, name, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'user@example.com', 'Job Seeker',
 '$2a$10$K7x1L8mN2oP4qR6sT8uV0wX1y2z3A4b5C6d7E8f9G0h1I2j3k4l', 'user')
ON CONFLICT (email) DO NOTHING;

-- Recruiters (with Source field)
INSERT INTO recruiters (id, name, email, designation, company, linked_in_url, phone, source, notes) VALUES
('00000000-0000-0000-0000-000000000010', 'Sarah Johnson', 'sarah.johnson@techcorp.com', 'Technical Recruiter', 'TechCorp Solutions', 'https://linkedin.com/in/sarahjohnson', '+1-555-0101', 'LinkedIn', 'Senior Architect role, responded quickly'),
('00000000-0000-0000-0000-000000000011', 'Michael Chen', 'm.chen@databyte.io', 'Engineering Manager', 'DataByte Systems', 'https://linkedin.com/in/michaelchen', '+1-555-0202', 'Referral', 'Referred by former colleague'),
('00000000-0000-0000-0000-000000000012', 'Elena Rodriguez', 'elena.r@cloudscale.com', 'Talent Acquisition', 'CloudScale Inc', NULL, '+1-555-0303', 'Company Website', 'Applied via careers page')
ON CONFLICT DO NOTHING;

-- Email Templates
INSERT INTO templates (id, template_name, subject_template, body_template, version, is_active) VALUES
('00000000-0000-0000-0000-000000000020', 'Application - Architect', 'Application for {Position}',
 'Hello {RecruiterName},

I came across your opening for {Position} at {Company}.

I have over 24 years of experience in Microsoft technologies including ASP.NET, C#, Blazor, React, Microservices, Azure and software architecture.

Please find my resume attached.

Regards,
Deepak Kumar Vasudevan', 1, true)
ON CONFLICT DO NOTHING;

-- Template Versions
INSERT INTO template_versions (id, template_id, subject_template, body_template, version) VALUES
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000020', 'Application for {Position}',
 'Hello {RecruiterName},

I came across your opening for {Position} at {Company}.

I have over 24 years of experience in Microsoft technologies including ASP.NET, C#, Blazor, React, Microservices, Azure and software architecture.

Please find my resume attached.

Regards,
Deepak Kumar Vasudevan', 1)
ON CONFLICT DO NOTHING;

-- Resumes
INSERT INTO resumes (id, resume_name, version, file_path, file_size, mime_type, is_default) VALUES
('00000000-0000-0000-0000-000000000030', 'Architect Resume', '2.0', './uploads/resumes/architect-resume.pdf', 1024000, 'application/pdf', true),
('00000000-0000-0000-0000-000000000031', 'Lead Developer Resume', '1.5', './uploads/resumes/lead-dev-resume.pdf', NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- Applications (mergeData stored as JSONB, NOT full email bodies)
INSERT INTO applications (id, recruiter_id, template_id, template_version, resume_id, position, location, source, applied_date, status, merge_data, created_by) VALUES
('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 1, '00000000-0000-0000-0000-000000000030', 'Senior Architect', 'Remote', 'LinkedIn', NOW() - INTERVAL '10 days', 'Applied',
 '{"RecruiterName": "Sarah Johnson", "Company": "TechCorp Solutions", "Position": "Senior Architect", "Location": "Remote"}'::jsonb, '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000020', 1, '00000000-0000-0000-0000-000000000031', 'Lead Developer', 'New York, NY', 'Referral', NOW() - INTERVAL '5 days', 'InterviewScheduled',
 '{"RecruiterName": "Michael Chen", "Company": "DataByte Systems", "Position": "Lead Developer", "Location": "New York, NY"}'::jsonb, '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000012', NULL, NULL, NULL, 'Cloud Architect', 'Chicago, IL', 'Company Website', NOW() - INTERVAL '2 days', 'Draft',
 '{"RecruiterName": "Elena Rodriguez", "Company": "CloudScale Inc", "Position": "Cloud Architect", "Location": "Chicago, IL"}'::jsonb, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Follow-ups (auto-calculated: Applied + 7 days)
INSERT INTO followups (id, application_id, followup_date, status, notes, created_by) VALUES
('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000040', NOW() - INTERVAL '3 days', 'Sent', 'Follow-up email sent', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000041', NOW() + INTERVAL '2 days', 'Pending', NULL, '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000042', NOW() + INTERVAL '5 days', 'Pending', NULL, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;