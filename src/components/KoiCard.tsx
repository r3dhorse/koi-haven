import Link from "next/link";
import type { KoiListing, SiteSettings } from "@/lib/types";
import {
  formatPrice,
  inquiryMessage,
  statusBadge,
  whatsappLink,
} from "@/lib/format";

export function KoiCard({
  koi,
  settings,
}: {
  koi: KoiListing;
  settings: SiteSettings;
}) {
  const cover = koi.media[0]?.url ?? "";
  const badge = statusBadge(koi.status);
  const isSold = koi.status === "sold";

  return (
    <article className="group card overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/koi/${koi.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-koi-50">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={koi.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-koi-300">
              No image
            </div>
          )}
          <span className={`pill absolute left-3 top-3 ${badge.classes}`}>
            {badge.label}
          </span>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium uppercase tracking-wide text-koi-600">
                {koi.code}
              </div>
              <div className="truncate font-display text-lg text-ink">
                {koi.name}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] uppercase tracking-wider text-koi-600">
                Price
              </div>
              <div className="text-sm font-semibold text-ink">
                {formatPrice(koi.price, koi.currency)}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-koi-50/60 p-2">
            <dt className="uppercase tracking-wider text-koi-600">Variety</dt>
            <dd className="mt-0.5 font-medium text-ink">{koi.variety}</dd>
          </div>
          <div className="rounded-xl bg-koi-50/60 p-2">
            <dt className="uppercase tracking-wider text-koi-600">Size</dt>
            <dd className="mt-0.5 font-medium text-ink">{koi.size}</dd>
          </div>
          <div className="rounded-xl bg-koi-50/60 p-2">
            <dt className="uppercase tracking-wider text-koi-600">Age</dt>
            <dd className="mt-0.5 font-medium text-ink">{koi.age ?? "—"}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2">
          <Link href={`/koi/${koi.id}`} className="btn-outline flex-1">
            View details
          </Link>
          {!isSold && (
            <a
              href={whatsappLink(
                settings,
                inquiryMessage(settings, koi.code, koi.name),
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
              aria-label={`Inquire about ${koi.name} on WhatsApp`}
            >
              Inquire
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
