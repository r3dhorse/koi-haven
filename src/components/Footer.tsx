import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { formatWhatsapp } from "@/lib/format";

export function Footer({ settings }: { settings: SiteSettings }) {
  const wa = formatWhatsapp(settings);
  return (
    <footer className="border-t border-koi-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-xl font-semibold text-koi-800">
            🪷 {settings.businessName}
          </div>
          <p className="mt-3 max-w-xs text-sm text-koi-700/80">
            {settings.tagline}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Visit</h4>
          <ul className="mt-3 space-y-2 text-sm text-koi-800/80">
            <li>{settings.location}</li>
            <li>By appointment only</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-koi-800/80">
            <li>
              <a href={`tel:${settings.phone}`} className="hover:text-koi-600">
                📞 {settings.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-koi-600"
              >
                ✉️ {settings.email}
              </a>
            </li>
            {wa && (
              <li className="text-koi-800/80">
                💬 WhatsApp:{" "}
                <span className="font-medium text-koi-900">{wa}</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-koi-800/80">
            <li>
              <Link href="/koi" className="hover:text-koi-600">
                Browse koi
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-koi-600">
                About us
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-koi-600">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-koi-100">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-koi-700/70 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {settings.businessName}. All rights
            reserved.
          </span>
          <span>Crafted with care for koi keepers.</span>
        </div>
      </div>
    </footer>
  );
}
