import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import { isProduction } from "@/config/env";

/**
 * Every error, whatever its source, is normalized into the same
 * { success, error: { code, message } } shape and never leaks a stack
 * trace, raw Prisma error, or internal file path to the client.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Some of the information provided is invalid.",
        details: err.flatten().fieldErrors,
      },
    });
  }

  req.log?.error({ err }, "Unhandled error");
  if (!isProduction) console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our end. Please try again.",
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  });
}
