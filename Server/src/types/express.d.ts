import type { UserRole, UserStatus } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  courthouseId: string | null;
  mustChangePassword: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
