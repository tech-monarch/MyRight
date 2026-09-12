import { Router } from "express";
import * as authController from "@/modules/auth/auth.controller";
import { registerSchema, loginSchema, changePasswordSchema } from "@/modules/auth/auth.schemas";
import { validateBody } from "@/middleware/validate";
import { requireAuth } from "@/middleware/auth";
import { requireCsrf } from "@/middleware/csrf";
import { authRateLimiter } from "@/middleware/rateLimit";

export const authRouter = Router();

authRouter.get("/csrf", authController.getCsrfToken);
authRouter.post("/register", authRateLimiter, validateBody(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/logout", requireAuth, requireCsrf, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.post(
  "/change-password",
  requireAuth,
  requireCsrf,
  validateBody(changePasswordSchema),
  authController.changePassword
);
