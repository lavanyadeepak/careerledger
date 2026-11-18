import { createApp } from "./app";
import { env } from "./config/env";
import { db } from "./config/db";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`ResumeTracker backend running on port ${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});

process.on("unhandledRejection", (err: unknown) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: unknown) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");
  await db.$disconnect();
  server.close(() => console.log("Server closed"));
});

export default server;