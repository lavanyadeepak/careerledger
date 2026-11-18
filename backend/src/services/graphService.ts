import axios from "axios";
import { env } from "../config/env";
import { db } from "../config/db";
import { encrypt, decrypt } from "../utils/encryption";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

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

class GraphService {
  private async getAccessToken(): Promise<string> {
    const token = await db.graphToken.findFirst();
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
      const response = await axios.post(
        `https://login.microsoftonline.com/${env.msGraphTenantId}/oauth2/v2.0/token`,
        {
          client_id: env.msGraphClientId,
          client_secret: env.msGraphClientSecret,
          refresh_token: decrypt(token.refreshToken, env.encryptionKey),
          grant_type: "refresh_token",
          scope: env.msGraphScopes.join(" "),
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      await db.graphToken.update({
        where: { id: token.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token ? encrypt(refresh_token, env.encryptionKey) : token.refreshToken,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });
      return access_token;
    } catch (err: any) {
      throw new Error(`Failed to refresh Graph token: ${err?.response?.data?.error_description || err.message}`);
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: env.msGraphClientId,
      response_type: "code",
      redirect_uri: env.msGraphRedirectUri,
      response_mode: "query",
      scope: env.msGraphScopes.join(" "),
      state: "resumetracker-auth",
    });
    return `https://login.microsoftonline.com/${env.msGraphTenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    const response = await axios.post(
      `https://login.microsoftonline.com/${env.msGraphTenantId}/oauth2/v2.0/token`,
      {
        client_id: env.msGraphClientId,
        client_secret: env.msGraphClientSecret,
        code,
        redirect_uri: env.msGraphRedirectUri,
        grant_type: "authorization_code",
        scope: env.msGraphScopes.join(" "),
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in, scope } = response.data;

    await db.graphToken.deleteMany({});
    await db.graphToken.create({
      data: {
        accessToken: access_token,
        refreshToken: refresh_token ? encrypt(refresh_token, env.encryptionKey) : undefined,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scope,
      },
    });
  }

  private async httpClient() {
    const axiosInstance = axios.create({
      baseURL: GRAPH_BASE,
      timeout: 30000,
      headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
    });
    return axiosInstance;
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const http = await this.httpClient();

    const emailPayload: any = {
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
        if (fs.existsSync(input.attachmentPath!)) {
          const fileBuffer = fs.readFileSync(input.attachmentPath!);
          emailPayload.message.attachments = [
            {
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: input.attachmentName,
              contentBytes: fileBuffer.toString("base64"),
            },
          ];
        }
      } catch (err) {
        console.warn("Could not attach resume:", err);
      }
    }

    await http.post("/me/sendMail", emailPayload);

    const messageId = `resumetracker-${Date.now()}-${Buffer.from(input.to + input.subject).toString("base64").slice(0, 12)}`;

    return { messageId };
  }

  async testConnection(): Promise<boolean> {
    const http = await this.httpClient();
    const response = await http.get("/me");
    return Boolean(response.data);
  }
}

export const graphService = new GraphService();