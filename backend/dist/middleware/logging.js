"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
morgan_1.default.token("timestamp", () => new Date().toISOString());
exports.httpLogger = (0, morgan_1.default)("[:timestamp] :method :url :status :res[content-length]b - :response-time ms", {
    skip: (req) => req.url === "/health",
});
//# sourceMappingURL=logging.js.map