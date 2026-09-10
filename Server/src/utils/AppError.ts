/**
 * A thrown AppError is turned into the structured error response
 * (see middleware/errorHandler.ts) instead of leaking a stack trace or
 * raw database error to the client.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace?.(this, AppError);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to do this") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new AppError(409, "CONFLICT", message);
  }

  static badRequest(message: string) {
    return new AppError(400, "BAD_REQUEST", message);
  }

  static tooManyRequests(message = "Too many requests, please try again later") {
    return new AppError(429, "RATE_LIMITED", message);
  }
}
