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

export function whatsappLink(
  settings: SiteSettings,
  message: string,
): string {
  const text = encodeURIComponent(message);
  const number = settings.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${text}`;
}

export function inquiryMessage(
  settings: SiteSettings,
  koiCode: string,
  koiName: string,
): string {
  return `Hi ${settings.businessName}, I'm interested in ${koiCode} – ${koiName}. Is it still available?`;
}
