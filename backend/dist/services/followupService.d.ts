import { ApplicationStatus } from "@prisma/client";
/**
 * Follow-up engine: auto-calculates follow-up dates (Applied + 7 days)
 * and identifies overdue / today / upcoming follow-ups for the dashboard.
 */
export declare function autoScheduleFollowup(applicationId: string, appliedDate: Date): Promise<void>;
export declare function getOverdueFollowups(): Promise<({
    application: {
        recruiter: {
            id: string;
            email: string | null;
            name: string;
            updatedAt: Date;
            company: string | null;
            designation: string | null;
            linkedInUrl: string | null;
            phone: string | null;
            source: import(".prisma/client").$Enums.ApplicationSource;
            notes: string | null;
            createdDate: Date;
        };
    } & {
        templateVersion: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: import(".prisma/client").$Enums.ApplicationSource;
        appliedDate: Date;
        recruiterId: string;
        templateId: string | null;
        resumeId: string | null;
        position: string;
        location: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        messageId: string | null;
        recipientEmail: string | null;
        sentTimestamp: Date | null;
        nextFollowupDate: Date | null;
        remarks: string | null;
        mergeData: import("@prisma/client/runtime/library").JsonValue | null;
        createdBy: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    status: string;
    messageId: string | null;
    createdBy: string | null;
    followupDate: Date;
    applicationId: string;
    sentDate: Date | null;
})[]>;
export declare function getTodaysFollowups(): Promise<({
    application: {
        recruiter: {
            id: string;
            email: string | null;
            name: string;
            updatedAt: Date;
            company: string | null;
            designation: string | null;
            linkedInUrl: string | null;
            phone: string | null;
            source: import(".prisma/client").$Enums.ApplicationSource;
            notes: string | null;
            createdDate: Date;
        };
    } & {
        templateVersion: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: import(".prisma/client").$Enums.ApplicationSource;
        appliedDate: Date;
        recruiterId: string;
        templateId: string | null;
        resumeId: string | null;
        position: string;
        location: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        messageId: string | null;
        recipientEmail: string | null;
        sentTimestamp: Date | null;
        nextFollowupDate: Date | null;
        remarks: string | null;
        mergeData: import("@prisma/client/runtime/library").JsonValue | null;
        createdBy: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    status: string;
    messageId: string | null;
    createdBy: string | null;
    followupDate: Date;
    applicationId: string;
    sentDate: Date | null;
})[]>;
export declare function getUpcomingFollowups(days?: number): Promise<({
    application: {
        recruiter: {
            id: string;
            email: string | null;
            name: string;
            updatedAt: Date;
            company: string | null;
            designation: string | null;
            linkedInUrl: string | null;
            phone: string | null;
            source: import(".prisma/client").$Enums.ApplicationSource;
            notes: string | null;
            createdDate: Date;
        };
    } & {
        templateVersion: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: import(".prisma/client").$Enums.ApplicationSource;
        appliedDate: Date;
        recruiterId: string;
        templateId: string | null;
        resumeId: string | null;
        position: string;
        location: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        messageId: string | null;
        recipientEmail: string | null;
        sentTimestamp: Date | null;
        nextFollowupDate: Date | null;
        remarks: string | null;
        mergeData: import("@prisma/client/runtime/library").JsonValue | null;
        createdBy: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    status: string;
    messageId: string | null;
    createdBy: string | null;
    followupDate: Date;
    applicationId: string;
    sentDate: Date | null;
})[]>;
export declare function markFollowupSent(followupId: string, messageId?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    status: string;
    messageId: string | null;
    createdBy: string | null;
    followupDate: Date;
    applicationId: string;
    sentDate: Date | null;
}>;
export declare function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<{
    templateVersion: number | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    source: import(".prisma/client").$Enums.ApplicationSource;
    appliedDate: Date;
    recruiterId: string;
    templateId: string | null;
    resumeId: string | null;
    position: string;
    location: string | null;
    status: import(".prisma/client").$Enums.ApplicationStatus;
    messageId: string | null;
    recipientEmail: string | null;
    sentTimestamp: Date | null;
    nextFollowupDate: Date | null;
    remarks: string | null;
    mergeData: import("@prisma/client/runtime/library").JsonValue | null;
    createdBy: string | null;
}>;
