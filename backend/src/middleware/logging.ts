import morgan from "morgan";

morgan.token("timestamp", () => new Date().toISOString());

export const httpLogger = morgan(
  "[:timestamp] :method :url :status :res[content-length]b - :response-time ms",
  {
    skip: (req) => req.url === "/health",
  }
);