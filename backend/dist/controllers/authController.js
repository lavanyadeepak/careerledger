"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.login = exports.register = void 0;
const error_1 = require("../middleware/error");
const auth_1 = require("../middleware/auth");
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.register = (0, error_1.asyncHandler)(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        throw new error_1.AppError("Email and password are required", 400);
    }
    const existing = await db_1.db.user.findUnique({ where: { email } });
    if (existing) {
        throw new error_1.AppError("Email already registered", 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.db.user.create({
        data: { email, passwordHash, name },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user.id, user.email, user.role);
    res.status(201).json({
        user,
        accessToken,
        refreshToken,
    });
});
exports.login = (0, error_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new error_1.AppError("Email and password are required", 400);
    }
    const user = await db_1.db.user.findUnique({ where: { email } });
    if (!user) {
        throw new error_1.AppError("Invalid credentials", 401);
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw new error_1.AppError("Invalid credentials", 401);
    }
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user.id, user.email, user.role);
    res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken,
    });
});
exports.me = (0, error_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new error_1.AppError("Not authenticated", 401);
    }
    const user = await db_1.db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
        throw new error_1.AppError("User not found", 404);
    }
    res.json({ user });
});
exports.logout = (0, error_1.asyncHandler)(async (req, res) => {
    res.json({ message: "Logged out successfully" });
});
//# sourceMappingURL=authController.js.map