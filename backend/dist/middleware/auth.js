"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.generateTokens = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    }
    catch {
        // ignore invalid token for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
const generateTokens = (userId, email, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, email, role }, env_1.env.jwtSecret, { expiresIn: env_1.env.jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map