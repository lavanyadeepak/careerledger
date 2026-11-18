import { db } from "../src/config/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Create default user
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  const user = await db.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Job Seeker",
      passwordHash,
      role: "user",
    },
  });
  console.log("Created user:", user.email);

  // Create recruiters
  const r1 = await db.recruiter.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      designation: "Technical Recruiter",
      company: "TechCorp Solutions",
      linkedInUrl: "https://linkedin.com",
      phone: "+1-555-0101",
      source: "LinkedIn",
      notes: "Senior Architect role, responded quickly",
    },
  });
  const r2 = await db.recruiter.create({
    data: {
      name: "Michael Chen",
      email: "m.chen@databyte.io",
      designation: "Engineering Manager",
      company: "DataByte Systems",
      linkedInUrl: "https://linkedin.com",
      phone: "+1-555-0202",
      source: "Referral",
      notes: "Referred by former colleague",
    },
  });
  const r3 = await db.recruiter.create({
    data: {
      name: "Elena Rodriguez",
      email: "elena.r@cloudscale.com",
      designation: "Talent Acquisition",
      company: "CloudScale Inc",
      phone: "+1-555-0303",
      source: "CompanyWebsite",
      notes: "Applied via careers page",
    },
  });
  console.log("Created recruiters:", r1.id, r2.id, r3.id);

  // Create email templates
  const t1 = await db.template.create({
    data: {
      templateName: "Application - Architect",
      subjectTemplate: "Application for {Position}",
      bodyTemplate: `Hello {RecruiterName},

I came across your opening for {Position} at {Company}.

I have over 24 years of experience in Microsoft technologies including ASP.NET, C#, Blazor, React, Microservices, Azure and software architecture.

Please find my resume attached.

Regards,
Deepak Kumar Vasudevan`,
      version: 1,
      isActive: true,
    },
  });
  await db.templateVersion.create({
    data: {
      templateId: t1.id,
      subjectTemplate: t1.subjectTemplate,
      bodyTemplate: t1.bodyTemplate,
      version: 1,
    },
  });
  console.log("Created template:", t1.id);

  // Create resumes
  const resume1 = await db.resume.create({
    data: {
      resumeName: "Architect Resume",
      version: "2.0",
      filePath: "./uploads/resumes/architect-resume.pdf",
      fileSize: 1024000,
      mimeType: "application/pdf",
      isDefault: true,
    },
  });
  const resume2 = await db.resume.create({
    data: {
      resumeName: "Lead Developer Resume",
      version: "1.5",
      filePath: "./uploads/resumes/lead-dev-resume.pdf",
      isDefault: false,
    },
  });
  console.log("Created resumes:", resume1.id, resume2.id);

  // Create applications
  const now = new Date();
  const a1 = await db.application.create({
    data: {
      recruiterId: r1.id,
      templateId: t1.id,
      templateVersion: 1,
      resumeId: resume1.id,
      position: "Senior Architect",
      location: "Remote",
      source: "LinkedIn",
      appliedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      status: "Applied",
      mergeData: {
        RecruiterName: "Sarah Johnson",
        Company: "TechCorp Solutions",
        Position: "Senior Architect",
        Location: "Remote",
      },
      createdBy: user.id,
    },
  });
  await db.followup.create({
    data: {
      applicationId: a1.id,
      followupDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: "Sent",
    },
  });

  const a2 = await db.application.create({
    data: {
      recruiterId: r2.id,
      templateId: t1.id,
      templateVersion: 1,
      resumeId: resume2.id,
      position: "Lead Developer",
      location: "New York, NY",
      source: "Referral",
      appliedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: "InterviewScheduled",
      mergeData: {
        RecruiterName: "Michael Chen",
        Company: "DataByte Systems",
        Position: "Lead Developer",
        Location: "New York, NY",
      },
      createdBy: user.id,
    },
  });

  const a3 = await db.application.create({
    data: {
      recruiterId: r3.id,
      position: "Cloud Architect",
      location: "Chicago, IL",
      source: "CompanyWebsite",
      appliedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: "Draft",
      mergeData: {
        RecruiterName: "Elena Rodriguez",
        Company: "CloudScale Inc",
        Position: "Cloud Architect",
        Location: "Chicago, IL",
      },
      createdBy: user.id,
    },
  });

  await db.followup.create({
    data: {
      applicationId: a2.id,
      followupDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "Pending",
    },
  });
  await db.followup.create({
    data: {
      applicationId: a3.id,
      followupDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "Pending",
    },
  });

  console.log("Created applications:", a1.id, a2.id, a3.id);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
