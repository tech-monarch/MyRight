import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * TypeScript types describe the shape we hope a request has, they do not
 * check it at runtime. This is the one place every external request body
 * actually gets validated before touching business logic.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };
}
