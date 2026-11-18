"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const encryption_1 = require("../utils/encryption");
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
class GraphService {
    async getAccessToken() {
        const token = await db_1.db.graphToken.findFirst();
        if (!token) {
            throw new Error("Microsoft Graph not connected. Authenticate via /api/auth/microsoft/login");
        }
        if (token.expiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
            return token.accessToken;
        }
        if (!token.refreshToken) {
            throw new Error("Graph token expired and no refresh token available. Re-authenticate.");
        }
        try {
            const response = await axios_1.default.post(`https://login.microsoftonline.com/${env_1.env.msGraphTenantId}/oauth2/v2.0/token`, {
                client_id: env_1.env.msGraphClientId,
                client_secret: env_1.env.msGraphClientSecret,
                refresh_token: (0, encryption_1.decrypt)(token.refreshToken, env_1.env.encryptionKey),
                grant_type: "refresh_token",
                scope: env_1.env.msGraphScopes.join(" "),
            }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
            const { access_token, refresh_token, expires_in } = response.data;
            await db_1.db.graphToken.update({
                where: { id: token.id },
                data: {
                    accessToken: access_token,
                    refreshToken: refresh_token ? (0, encryption_1.encrypt)(refresh_token, env_1.env.encryptionKey) : token.refreshToken,
                    expiresAt: new Date(Date.now() + expires_in * 1000),
                },
            });
            return access_token;
        }
        catch (err) {
            throw new Error(`Failed to refresh Graph token: ${err?.response?.data?.error_description || err.message}`);
        }
    }
    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: env_1.env.msGraphClientId,
            response_type: "code",
            redirect_uri: env_1.env.msGraphRedirectUri,
            response_mode: "query",
            scope: env_1.env.msGraphScopes.join(" "),
            state: "resumetracker-auth",
        });
        return `https://login.microsoftonline.com/${env_1.env.msGraphTenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    }
    async exchangeCodeForTokens(code) {
        const response = await axios_1.default.post(`https://login.microsoftonline.com/${env_1.env.msGraphTenantId}/oauth2/v2.0/token`, {
            client_id: env_1.env.msGraphClientId,
            client_secret: env_1.env.msGraphClientSecret,
            code,
            redirect_uri: env_1.env.msGraphRedirectUri,
            grant_type: "authorization_code",
            scope: env_1.env.msGraphScopes.join(" "),
        }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const { access_token, refresh_token, expires_in, scope } = response.data;
        await db_1.db.graphToken.deleteMany({});
        await db_1.db.graphToken.create({
            data: {
                accessToken: access_token,
                refreshToken: refresh_token ? (0, encryption_1.encrypt)(refresh_token, env_1.env.encryptionKey) : undefined,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                scope,
            },
        });
    }
    async httpClient() {
        const axiosInstance = axios_1.default.create({
            baseURL: GRAPH_BASE,
            timeout: 30000,
            headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
        });
        return axiosInstance;
    }
    async sendEmail(input) {
        const http = await this.httpClient();
        const emailPayload = {
            message: {
                subject: input.subject,
                body: {
                    contentType: "HTML",
                    content: input.body,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: input.to,
                        },
                    },
                ],
            },
            saveToSentItems: true,
        };
        // Only metadata (MessageId) is persisted; attachment streamed at send time.
        if (input.attachmentPath && input.attachmentName) {
            try {
                const fs = await import("fs");
                if (fs.existsSync(input.attachmentPath)) {
                    const fileBuffer = fs.readFileSync(input.attachmentPath);
                    emailPayload.message.attachments = [
                        {
                            "@odata.type": "#microsoft.graph.fileAttachment",
                            name: input.attachmentName,
                            contentBytes: fileBuffer.toString("base64"),
                        },
                    ];
                }
            }
            catch (err) {
                console.warn("Could not attach resume:", err);
            }
        }
        await http.post("/me/sendMail", emailPayload);
        const messageId = `resumetracker-${Date.now()}-${Buffer.from(input.to + input.subject).toString("base64").slice(0, 12)}`;
        return { messageId };
    }
    async testConnection() {
        const http = await this.httpClient();
        const response = await http.get("/me");
        return Boolean(response.data);
    }
}
exports.graphService = new GraphService();
//# sourceMappingURL=graphService.js.map