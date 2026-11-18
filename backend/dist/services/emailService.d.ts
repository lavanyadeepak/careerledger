export interface EmailResult {
    messageId: string;
    recipient: string;
    subject: string;
    sentAt: Date;
}
export declare function sendApplicationEmail(applicationId: string, mergeData: Record<string, string>): Promise<EmailResult>;
