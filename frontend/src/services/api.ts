import axios, { AxiosError } from "axios";

const API_BASE = "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export type ApplicationStatus =
  | "Draft"
  | "Applied"
  | "FollowupDue"
  | "FollowupSent"
  | "InterviewScheduled"
  | "TechnicalRound"
  | "HRRound"
  | "OfferReceived"
  | "Rejected"
  | "Closed";

export type ApplicationSource =
  | "Naukri"
  | "LinkedIn"
  | "Foundit"
  | "Referral"
  | "DirectRecruiter"
  | "CompanyWebsite"
  | "XTwitter"
  | "WhatsApp";

export interface Recruiter {
  id: string;
  name: string;
  email?: string;
  designation?: string;
  company?: string;
  linkedInUrl?: string;
  phone?: string;
  source?: ApplicationSource;
  notes?: string;
  createdDate: string;
  updatedAt?: string;
  _count?: { applications: number };
}

export interface Template {
  id: string;
  templateName: string;
  subjectTemplate: string;
  bodyTemplate: string;
  version: number;
  isActive: boolean;
  createdDate: string;
  updatedAt?: string;
}

export interface Resume {
  id: string;
  resumeName: string;
  version: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  isDefault: boolean;
  createdDate: string;
}

export interface Application {
  id: string;
  recruiterId: string;
  templateId?: string;
  templateVersion?: number;
  resumeId?: string;
  position: string;
  location?: string;
  source?: ApplicationSource;
  appliedDate: string;
  status: ApplicationStatus;
  messageId?: string;
  recipientEmail?: string;
  sentTimestamp?: string;
  nextFollowupDate?: string;
  remarks?: string;
  mergeData?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  recruiter?: Recruiter;
  template?: Template;
  resume?: Resume;
  followups?: Followup[];
  emailAudit?: EmailAudit[];
}

export interface Followup {
  id: string;
  applicationId: string;
  followupDate: string;
  status: string;
  notes?: string;
  messageId?: string;
  sentDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

export interface EmailAudit {
  id: string;
  applicationId: string;
  messageId?: string;
  recipient: string;
  subject?: string;
  sentDate: string;
}

export interface DashboardStats {
  totalApplications: number;
  responsesReceived: number;
  interviewsScheduled: number;
  offersReceived: number;
  rejections: number;
  pendingFollowups: number;
  byStatus: Record<string, number>;
}

export interface FollowupGroup {
  overdue: Followup[];
  today: Followup[];
  upcoming: Followup[];
}

export interface MonthStat {
  month: string;
  count: number;
}

export interface CompanyStat {
  company: string;
  recruiter: string;
  count: number;
}

export interface StatusDist {
  status: string;
  count: number;
}