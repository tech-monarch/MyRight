"use client";

import { useApi } from "@/lib/useApi";
import { getCurrentUser } from "@/lib/auth-client";

export function useCurrentUser() {
  return useApi(() => getCurrentUser(), []);
}
