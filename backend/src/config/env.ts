import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  databaseUrl: process.env.DATABASE_URL!,
  msGraphClientId: process.env.MS_GRAPH_CLIENT_ID || "",
  msGraphClientSecret: process.env.MS_GRAPH_CLIENT_SECRET || "",
  msGraphTenantId: process.env.MS_GRAPH_TENANT_ID || "common",
  msGraphRedirectUri: process.env.MS_GRAPH_REDIRECT_URI || "",
  msGraphSenderEmail: process.env.MS_GRAPH_SENDER_EMAIL || "",
  msGraphScopes: (process.env.MS_GRAPH_SCOPES || "Mail.Send User.Read offline_access").split(" "),
  resumeUploadDir: process.env.RESUME_UPLOAD_DIR || "./uploads/resumes",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
  encryptionKey: process.env.ENCRYPTION_KEY || "default-key-change-me",
};