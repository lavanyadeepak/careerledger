/**
 * Render email template subject and body using merge tokens.
 * Supported tokens: {RecruiterName}, {Company}, {Position}, {Location}
 */
export type MergeData = Record<string, string | number | boolean | null | undefined>;
export declare function renderTemplate(template: string, mergeData: MergeData): string;
export declare function extractTokens(template: string): string[];
