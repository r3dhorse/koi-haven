import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaGallery } from "@/components/MediaGallery";
import { getKoi, getSettings, listKoi } from "@/lib/store";
import {
  formatPrice,
  inquiryMessage,
  statusBadge,
  whatsappLink,
} from "@/lib/format";

export async function generateStaticParams() {
  const all = await listKoi();
  return all.map((k) => ({ id: k.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const koi = await getKoi(id);
  if (!koi) return { title: "Koi not found" };
  return {
    title: `${koi.code} · ${koi.name}`,
    description: `${koi.variety}, ${koi.size}. ${koi.description.slice(0, 120)}`,
  };
}

export default async function KoiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const koi = await getKoi(id);
  if (!koi) notFound();

  const settings = await getSettings();
  const badge = statusBadge(koi.status);
  const isSold = koi.status === "sold";

  return (
    <>
      <section className="bg-water-gradient">
        <div className="container-page py-10">
          <Link
            href="/koi"
            className="text-sm font-medium text-koi-800 hover:text-koi-600"
          >
            ← All koi
          </Link>
        </div>
      </section>

      <section className="section pt-10">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <MediaGallery items={koi.media} />

          <div>
            <div className="flex items-center gap-3">
              <span className={`pill ${badge.classes}`}>{badge.label}</span>
              <span className="text-xs uppercase tracking-widest text-koi-600">
                {koi.code}
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {koi.name}
            </h1>
            <p className="mt-2 text-koi-700">{koi.variety}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl text-ink">
                {formatPrice(koi.price, koi.currency)}
              </span>
              {isSold && (
                <span className="text-sm text-koi-700/70">Sold</span>
              )}
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Size" value={koi.size} />
              <Stat label="Age" value={koi.age ?? "—"} />
              <Stat label="Sex" value={koi.sex ?? "Unknown"} />
              <Stat label="Variety" value={koi.variety} />
              <Stat label="Breeder" value={koi.breeder ?? "—"} />
              <Stat label="Status" value={badge.label} />
            </dl>

            <p className="mt-8 whitespace-pre-line leading-relaxed text-koi-900">
              {koi.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {!isSold && (
                <a
                  href={whatsappLink(
                    settings,
                    inquiryMessage(settings, koi.code, koi.name),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp"
                >
                  Inquire about {koi.code} on WhatsApp
                </a>
              )}
              <a href={`tel:${settings.phone}`} className="btn-outline">
                Call {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}?subject=${encodeURIComponent(
                  `Inquiry: ${koi.code} – ${koi.name}`,
                )}`}
                className="btn-outline"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {koi.proofOfSale.length > 0 && (
        <section className="section bg-koi-50/40">
          <div className="container-page">
            <span className="pill bg-koi-100 text-koi-700">Proof of sale</span>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              From our pond to a happy keeper
            </h2>
            <p className="mt-2 max-w-xl text-koi-800/80">
              We document every koi that leaves us — from boxing, to release, to
              their new home.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {koi.proofOfSale.map((m, i) => (
                <figure
                  key={`${m.url}-${i}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-card"
                >
                  {m.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.caption ?? "Proof of sale"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={m.url}
                      title={m.caption ?? "Proof of sale video"}
                      className="aspect-[4/3] w-full"
                    />
                  )}
                  {m.caption && (
                    <figcaption className="px-4 py-3 text-sm text-koi-800">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-koi-50/60 p-4 ring-1 ring-koi-100">
      <dt className="text-[10px] uppercase tracking-widest text-koi-600">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}
