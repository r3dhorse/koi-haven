import Link from "next/link";
import { KoiCard } from "@/components/KoiCard";
import { getSettings, listKoi } from "@/lib/store";
import type { KoiStatus } from "@/lib/types";

export const metadata = {
  title: "Browse koi",
  description: "All available, reserved, and sold koi at our farm.",
};

const STATUS_OPTIONS: Array<{
  value: KoiStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All koi" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold archive" },
];

export default async function KoiListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = (typeof params.status === "string" ? params.status : "all") as
    | KoiStatus
    | "all";
  const variety =
    typeof params.variety === "string" ? params.variety.toLowerCase() : "";

  const settings = await getSettings();
  const all = await listKoi();

  const filtered = all.filter((k) => {
    if (status !== "all" && k.status !== status) return false;
    if (variety && !k.variety.toLowerCase().includes(variety)) return false;
    return true;
  });

  const varieties = Array.from(new Set(all.map((k) => k.variety))).sort();

  return (
    <>
      <section className="bg-water-gradient">
        <div className="container-page py-16 sm:py-20">
          <span className="pill bg-white/70 text-koi-700 ring-1 ring-koi-200">
            Live inventory
          </span>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            Browse our koi
          </h1>
          <p className="mt-3 max-w-xl text-koi-800/80">
            Every fish on this page is in our ponds right now. Tap any koi for
            full details, video, and pricing.
          </p>
        </div>
      </section>

      <section className="border-y border-koi-100 bg-white">
        <div className="container-page flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const href = buildHref({ status: opt.value, variety });
              const active = status === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={href}
                  className={`pill ${
                    active
                      ? "bg-koi-600 text-white"
                      : "bg-koi-50 text-koi-700 ring-1 ring-koi-100 hover:bg-koi-100"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          <form
            method="GET"
            className="flex flex-wrap items-center gap-2"
            action="/koi"
          >
            <input
              type="hidden"
              name="status"
              value={status === "all" ? "" : status}
            />
            <label
              htmlFor="variety"
              className="text-xs uppercase tracking-widest text-koi-600"
            >
              Variety
            </label>
            <select
              id="variety"
              name="variety"
              defaultValue={variety}
              className="rounded-full border border-koi-200 bg-white px-4 py-1.5 text-sm focus:border-koi-500 focus:outline-none"
            >
              <option value="">All varieties</option>
              {varieties.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-outline px-4 py-1.5 text-xs">
              Filter
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <h3 className="font-display text-2xl text-ink">
                No koi match those filters
              </h3>
              <p className="mt-2 text-koi-800/80">
                Try clearing the filters or get in touch — we may have a perfect
                match in quarantine.
              </p>
              <Link href="/koi" className="btn-primary mt-6">
                Show all koi
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-koi-700/80">
                Showing {filtered.length} {filtered.length === 1 ? "koi" : "koi"}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((k) => (
                  <KoiCard key={k.id} koi={k} settings={settings} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function buildHref({
  status,
  variety,
}: {
  status: KoiStatus | "all";
  variety: string;
}): string {
  const sp = new URLSearchParams();
  if (status !== "all") sp.set("status", status);
  if (variety) sp.set("variety", variety);
  const qs = sp.toString();
  return qs ? `/koi?${qs}` : "/koi";
}
