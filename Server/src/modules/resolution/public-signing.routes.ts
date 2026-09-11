import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireParam } from "@/utils/requireParam";
import { validateBody } from "@/middleware/validate";
import { publicSignSchema } from "@/modules/resolution/resolution.schemas";
import * as resolutionService from "@/modules/resolution/resolution.service";
import { writeAuditLog } from "@/utils/audit-log";
import rateLimit from "express-rate-limit";

export const publicSigningRouter = Router();

// Rate limited more strictly than the general API: these routes are
// unauthenticated by design (the other party has no account), so the
// token itself is the only thing standing between a link and abuse, no
// session or CSRF protection applies here.
const signingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

publicSigningRouter.use(signingRateLimiter);

publicSigningRouter.get(
  "/:token",
  asyncHandler(async (req, res) => {
    const tokenRow = await resolutionService.getResolutionByToken(requireParam(req, "token"));
    const alreadySigned = tokenRow.resolution.signatures.some((s) => s.party === "OTHER_PARTY");
    res.json({
      success: true,
      data: {
        disputeTitle: tokenRow.resolution.dispute.title,
        terms: tokenRow.resolution.terms,
        alreadySigned,
      },
    });
  })
);

publicSigningRouter.post(
  "/:token",
  validateBody(publicSignSchema),
  asyncHandler(async (req, res) => {
    const rawToken = requireParam(req, "token");
    await resolutionService.signWithToken({
      rawToken,
      signerName: req.body.signerName,
      ipAddress: req.ip,
      userAgent: req.header("user-agent"),
    });
    await writeAuditLog({
      actorLabel: req.body.signerName,
      action: "RESOLUTION_SIGNED_BY_OTHER_PARTY",
      targetType: "ResolutionSigningToken",
      result: "SUCCESS",
    });
    res.json({ success: true, data: null });
  })
);
