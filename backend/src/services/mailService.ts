import axios from "axios";
import { env } from "../config/env";

export interface SendEmailInput {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachmentPath?: string;
  attachmentName?: string;
}

export interface SendEmailResult {
  messageId: string;
}

export class MailService {
  private static async sendViaMailgun(
    to: string,
    subject: string,
    body: string,
    attachmentPath?: string,
    attachmentName?: string,
    cc?: string
  ): Promise<{ messageId: string }> {
    const domain = env.mailgunDomain;
    const apiKey = env.mailgunApiKey;

    if (!domain || !apiKey) {
      throw new Error("MailGun not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN in .env");
    }

    const formData = new FormData() as any;
    const fromEmail = env.mailFrom || `Resumetracker <postmaster@${domain}>`;
    formData.append("from", fromEmail);
    formData.append("to", to);
    if (cc) {
      formData.append("cc", cc);
    }
    formData.append("subject", subject);
    formData.append("html", body);

    if (attachmentPath && attachmentName) {
      const fs = await import("fs");
      if (fs.existsSync(attachmentPath)) {
        const fileBuffer = fs.readFileSync(attachmentPath);
        formData.append("attachment", fileBuffer.toString("base64"), {
          // filename + contentType encoding is handled by URLSearchParams/Blob
          filename: attachmentName,
          contentType: "application/pdf",
        } as any);
      }
    }

    const response = await axios.post(
      `https://api.mailgun.net/v3/${domain}/messages`,
      formData,
      {
        auth: {
          username: "api",
          password: apiKey,
        },
      }
    );

    return { messageId: response.data.id || `resumetracker-${Date.now()}` };
  }

  static async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const { messageId } = await this.sendViaMailgun(
      input.to,
      input.subject,
      input.body,
      input.attachmentPath,
      input.attachmentName,
      input.cc
    );

    return { messageId };
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.sendViaMailgun(
        env.mailFrom || "test@test.com",
        "Test",
        "<p>Test email</p>"
      );
      return true;
    } catch {
      return false;
    }
  }
}