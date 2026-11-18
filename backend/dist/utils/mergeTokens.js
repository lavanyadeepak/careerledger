"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
exports.extractTokens = extractTokens;
const TOKEN_REGEX = /\{([^}]+)\}/g;
function renderTemplate(template, mergeData) {
    return template.replace(TOKEN_REGEX, (match, token) => {
        const key = token.trim();
        const value = mergeData[key];
        if (value === null || value === undefined) {
            return match;
        }
        return String(value);
    });
}
function extractTokens(template) {
    const tokens = [];
    let match;
    TOKEN_REGEX.lastIndex = 0;
    while ((match = TOKEN_REGEX.exec(template))) {
        if (match[1] !== undefined) {
            tokens.push(match[1].trim());
        }
    }
    return [...new Set(tokens)];
}
//# sourceMappingURL=mergeTokens.js.map