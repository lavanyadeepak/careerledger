"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.port, () => {
    console.log(`ResumeTracker backend running on port ${env_1.env.port}`);
    console.log(`Environment: ${env_1.env.nodeEnv}`);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});
process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down...");
    await db_1.db.$disconnect();
    server.close(() => console.log("Server closed"));
});
exports.default = server;
//# sourceMappingURL=server.js.map