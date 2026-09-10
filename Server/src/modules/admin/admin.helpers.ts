/**
 * Small local helper rather than importing auth's toPublicUser, since
 * lawyer records here carry an extra `assignments` relation that a plain
 * User does not. Keeping it here avoids the auth module needing to know
 * about admin-specific shapes.
 */
export function toPublicLawyer<T extends { passwordHash: string }>(
  user: T
): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
