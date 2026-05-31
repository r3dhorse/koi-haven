import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { formatWhatsapp } from "@/lib/format";

export function Header({ settings }: { settings: SiteSettings }) {
  const wa = formatWhatsapp(settings);
  return (
    <header className="sticky top-0 z-40 border-b border-koi-100/60 glass">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-koi-800"
        >
          <span aria-hidden className="text-2xl">
            🪷
          </span>
          {settings.businessName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
          >
            Home
          </Link>
          <Link
            href="/koi"
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
          >
            Browse Koi
          </Link>
          <Link
            href="/#about"
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
          >
            About
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={`tel:${settings.phone}`}
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
            aria-label={`Call ${settings.phone}`}
          >
            📞 {settings.phone}
          </a>
          {wa && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
              title="Message us on WhatsApp"
            >
              <WhatsAppIcon />
              {wa}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="h-3.5 w-3.5"
    >
      <path d="M19.05 4.91A10 10 0 0 0 2.18 16.7L1 23l6.46-1.7A10 10 0 1 0 19.05 4.9Zm-7 16.2a8.18 8.18 0 0 1-4.18-1.14l-.3-.18-3.83 1 1-3.73-.2-.31A8.2 8.2 0 1 1 12.05 21.1Zm4.5-6.13c-.25-.13-1.47-.72-1.7-.8-.22-.08-.39-.13-.55.13-.16.25-.62.79-.76.95-.14.16-.28.18-.53.06a6.7 6.7 0 0 1-2-1.24 7.5 7.5 0 0 1-1.38-1.72c-.14-.25 0-.39.11-.51l.38-.43c.13-.16.17-.27.25-.45.08-.18.04-.34-.02-.47-.07-.13-.55-1.34-.76-1.83-.2-.49-.4-.42-.55-.43h-.47a.9.9 0 0 0-.65.3c-.22.25-.86.85-.86 2.07s.88 2.4 1 2.56c.12.16 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.51.6.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
