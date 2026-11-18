import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { httpLogger } from "./middleware/logging";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import recruiterRoutes from "./routes/recruiters";
import templateRoutes from "./routes/templates";
import resumeRoutes from "./routes/resumes";
import applicationRoutes from "./routes/applications";
import followupRoutes from "./routes/followups";
import dashboardRoutes from "./routes/dashboard";
import exportRoutes from "./routes/export";
import mailgunRoutes from "./routes/mailgun";
import emailRoutes from "./routes/email";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(httpLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "resumetracker-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/auth/microsoft", emailRoutes);
  app.use("/api/recruiters", recruiterRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/resumes", resumeRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/followups", followupRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/export", exportRoutes);
  app.use("/api/email/mailgun", mailgunRoutes);
  app.use("/api/email", emailRoutes);

  app.use(errorHandler);

  return app;
}
