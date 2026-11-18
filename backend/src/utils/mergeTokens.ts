/**
 * Render email template subject and body using merge tokens.
 * Supported tokens: {RecruiterName}, {Company}, {Position}, {Location}
 */
export type MergeData = Record<string, string | number | boolean | null | undefined>;

const TOKEN_REGEX = /\{([^}]+)\}/g;

export function renderTemplate(
  template: string,
  mergeData: MergeData
): string {
  return template.replace(TOKEN_REGEX, (match, token) => {
    const key = token.trim();
    const value = mergeData[key];
    if (value === null || value === undefined) {
      return match;
    }
    return String(value);
  });
}

export function extractTokens(template: string): string[] {
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(template))) {
    if (match[1] !== undefined) {
      tokens.push(match[1].trim());
    }
  }
  return [...new Set(tokens)];
}
