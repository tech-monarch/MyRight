import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express does not catch rejected promises from async route handlers on
 * its own. Wrapping every handler in this wastes far less code than
 * try/catch in each one, and guarantees errors always reach errorHandler.
 */
export function asyncHandler(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
