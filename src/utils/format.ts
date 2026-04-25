// Locale-stable formatters. Use these everywhere instead of bare
// `.toLocaleString()` / `.toLocaleDateString()` calls so that server
// (en-US/UTC on Vercel) and client (user's browser) produce identical
// strings — otherwise React hydration mismatches (error #418) crash the
// Server Component render in production.

const LOCALE = "fr-FR";
const TIMEZONE = "UTC";

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString(LOCALE);
}

export function formatDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString(LOCALE, { ...options, timeZone: TIMEZONE });
}

export function formatTime(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(LOCALE, { ...options, timeZone: TIMEZONE });
}

export function formatDateTime(
  value: string | number | Date | null | undefined
): string {
  if (!value) return "";
  return new Date(value).toLocaleString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}
