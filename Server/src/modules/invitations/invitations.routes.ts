import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireParam } from "@/utils/requireParam";
import { validateBody } from "@/middleware/validate";
import * as invitationsService from "@/modules/invitations/invitations.service";

export const publicInvitationsRouter = Router();

// Unauthenticated by design (the other party has no account), so the token is
// the only protection: rate limited like the signing links, no session/CSRF.
publicInvitationsRouter.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

publicInvitationsRouter.get(
  "/:token",
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await invitationsService.getInvitationSummary(requireParam(req, "token")) });
  })
);

publicInvitationsRouter.post(
  "/:token/respond",
  validateBody(z.object({ accept: z.boolean() })),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await invitationsService.respondToInvitation(requireParam(req, "token"), req.body.accept) });
  })
);
