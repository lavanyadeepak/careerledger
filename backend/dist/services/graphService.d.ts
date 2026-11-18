export interface SendEmailInput {
    to: string;
    subject: string;
    body: string;
    attachmentPath?: string;
    attachmentName?: string;
}
export interface SendEmailResult {
    messageId: string;
}
declare class GraphService {
    private getAccessToken;
    getAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<void>;
    private httpClient;
    sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
    testConnection(): Promise<boolean>;
}
export declare const graphService: GraphService;
export {};
