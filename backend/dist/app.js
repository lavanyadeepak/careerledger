"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logging_1 = require("./middleware/logging");
const error_1 = require("./middleware/error");
const auth_1 = __importDefault(require("./routes/auth"));
const recruiters_1 = __importDefault(require("./routes/recruiters"));
const templates_1 = __importDefault(require("./routes/templates"));
const resumes_1 = __importDefault(require("./routes/resumes"));
const applications_1 = __importDefault(require("./routes/applications"));
const followups_1 = __importDefault(require("./routes/followups"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const export_1 = __importDefault(require("./routes/export"));
const mailgun_1 = __importDefault(require("./routes/mailgun"));
const email_1 = __importDefault(require("./routes/email"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use(logging_1.httpLogger);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "resumetracker-backend" });
    });
    app.use("/api/auth", auth_1.default);
    app.use("/api/auth/microsoft", email_1.default);
    app.use("/api/recruiters", recruiters_1.default);
    app.use("/api/templates", templates_1.default);
    app.use("/api/resumes", resumes_1.default);
    app.use("/api/applications", applications_1.default);
    app.use("/api/followups", followups_1.default);
    app.use("/api/dashboard", dashboard_1.default);
    app.use("/api/export", export_1.default);
    app.use("/api/email/mailgun", mailgun_1.default);
    app.use("/api/email", email_1.default);
    app.use(error_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map