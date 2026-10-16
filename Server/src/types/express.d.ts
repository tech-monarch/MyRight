import type { UserRole, UserStatus } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  courthouseId: string | null;
  mustChangePassword: boolean;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
