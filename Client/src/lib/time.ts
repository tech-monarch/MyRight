/** "5 minutes ago", "2 days ago": small and dependency-free. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 3600) return plural(Math.round(seconds / 60), "minute");
  if (seconds < 86400) return plural(Math.round(seconds / 3600), "hour");
  if (seconds < 604800) return plural(Math.round(seconds / 86400), "day");
  if (seconds < 2592000) return plural(Math.round(seconds / 604800), "week");
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}
