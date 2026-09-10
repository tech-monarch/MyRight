import rateLimit from "express-rate-limit";

/**
 * Login and registration are rate limited per IP to slow down credential
 * stuffing / brute force attempts. This is deliberately stricter than the
 * general API limiter below.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." } },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } },
});
