import type { KoiStatus, SiteSettings } from "./types";

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function statusBadge(status: KoiStatus): {
  label: string;
  classes: string;
} {
  switch (status) {
    case "available":
      return {
        label: "Available",
        classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      };
    case "reserved":
      return {
        label: "Reserved",
        classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      };
    case "sold":
      return {
        label: "Sold",
        classes: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      };
  }
}

/**
 * If `input` is a Google Drive share/view URL, rewrite it to a direct image
 * URL that works in `<img src>`. Non-Drive URLs (and already-normalized
 * googleusercontent URLs) are returned unchanged.
 */
export function normalizeImageUrl(input: string): string {
  const url = input.trim();
  if (!url) return url;
  // Already a direct googleusercontent URL — leave alone.
  if (/^https?:\/\/lh\d+\.googleusercontent\.com\//i.test(url)) return url;
  if (!/drive\.google\.com/i.test(url)) return url;
  // Match /file/d/<ID> or ?id=<ID> / &id=<ID>.
  const match =
    url.match(/\/file\/d\/([A-Za-z0-9_-]{20,})/) ??
    url.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (!match) return url;
  return `https://lh3.googleusercontent.com/d/${match[1]}=s2000`;
}

/**
 * Returns the WhatsApp number formatted for display, e.g. "+1 555 010 0123".
 * The settings field stores digits only.
 */
export function formatWhatsapp(settings: SiteSettings): string {
  const digits = settings.whatsapp.replace(/[^0-9]/g, "");
  if (!digits) return "";
  // Group digits into chunks of 3-4 for readability while keeping the leading +.
  const grouped = digits.replace(/(\d{1,3})(?=(\d{3})+$)/g, "$1 ");
  return `+${grouped}`;
}
