import type { Request } from "express";
import { AppError } from "@/utils/AppError";

/**
 * Express types route params as possibly undefined under
 * noUncheckedIndexedAccess even for segments the route definitely has
 * (e.g. `:id`). This turns a missing param into a clean 400 instead of a
 * non-null assertion that would just crash if a route were ever renamed.
 */
export function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!value) throw AppError.badRequest(`Missing required URL parameter: ${name}`);
  return value;
}
