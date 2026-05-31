import Link from "next/link";
import { KoiCard } from "@/components/KoiCard";
import { getSettings, listKoi } from "@/lib/store";
import { whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const featured = (await listKoi({ featured: true })).slice(0, 6);
  const fallback = featured.length
    ? featured
    : (await listKoi({ status: "available" })).slice(0, 6);

  return (
    <>
      <Hero settings={settings} />
      <Stats />
      <FeaturedSection koi={fallback} settings={settings} />
      <AboutSection settings={settings} />
      <ProcessSection />
      <ContactCta settings={settings} />
    </>
  );
}

function Hero({ settings }: { settings: { businessName: string; tagline: string; phone: string; whatsapp: string; email: string; location: string } }) {
  return (
    <section className="relative overflow-hidden water-surface">
      <div className="absolute inset-0 -z-0">
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-koi-200/60 blur-3xl" />
      </div>
      <div className="container-page relative z-10 grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div>
          <span className="pill bg-white/70 text-koi-700 ring-1 ring-koi-200">
            Hand-picked Japanese koi
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
            Bring your pond to life with{" "}
            <span className="text-koi-600">living art.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-koi-800/80 sm:text-lg">
            {settings.tagline} Every koi at {settings.businessName} is selected
            for body, pattern, and bloodline — then conditioned and ready for
            your pond.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/koi" className="btn-primary">
              Browse available koi
            </Link>
            <a
              href={whatsappLink(
                settings,
                `Hi ${settings.businessName}, I'd like to talk koi.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              Chat on WhatsApp
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-koi-700/70">Hand-selected</dt>
              <dd className="mt-1 font-display text-2xl text-ink">120+</dd>
            </div>
            <div>
              <dt className="text-koi-700/70">Breeders</dt>
              <dd className="mt-1 font-display text-2xl text-ink">14</dd>
            </div>
            <div>
              <dt className="text-koi-700/70">Years</dt>
              <dd className="mt-1 font-display text-2xl text-ink">12</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-white/50 blur-2xl" />
          <div className="relative grid grid-cols-6 grid-rows-6 gap-3">
            {/* Big card */}
            <div className="col-span-4 row-span-4 overflow-hidden rounded-[2rem] shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1400&q=80"
                alt="Koi top view"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-[1.5rem] shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=900&q=80"
                alt="Showa koi"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-[1.5rem] shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1545816250-e12bedba42ba?auto=format&fit=crop&w=900&q=80"
                alt="Sanke koi"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-4 row-span-2 overflow-hidden rounded-[1.5rem] shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1400&q=80"
                alt="Koi school"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-2 hidden animate-float rounded-2xl bg-white/90 p-3 shadow-card lg:block">
            <div className="text-[10px] uppercase tracking-widest text-koi-600">
              Live status
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              New koi every week
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { label: "Bloodlines", value: "Sakai · Dainichi · Momotaro · Marusei" },
    { label: "Varieties", value: "Gosanke · Utsuri · Ogon · Ginrin" },
    { label: "Sizes", value: "Tosai · Nisai · Sansai+" },
    { label: "Shipping", value: "Insured nationwide" },
  ];
  return (
    <section className="bg-white">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-koi-50/60 p-5 ring-1 ring-koi-100"
          >
            <div className="text-[10px] uppercase tracking-widest text-koi-600">
              {s.label}
            </div>
            <div className="mt-1 font-medium text-ink">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedSection({
  koi,
  settings,
}: {
  koi: Awaited<ReturnType<typeof listKoi>>;
  settings: Awaited<ReturnType<typeof getSettings>>;
}) {
  return (
    <section className="section bg-koi-50/40">
      <div className="container-page">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="pill bg-koi-100 text-koi-700">Featured</span>
            <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              This week&apos;s standouts
            </h2>
            <p className="mt-2 max-w-xl text-koi-800/80">
              A rotating selection of our favorite koi — bold patterns, strong
              bodies, and bloodlines worth keeping an eye on.
            </p>
          </div>
          <Link
            href="/koi"
            className="hidden text-sm font-semibold text-koi-700 hover:text-koi-900 sm:inline-flex"
          >
            View all koi →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {koi.map((k) => (
            <KoiCard key={k.id} koi={k} settings={settings} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/koi" className="btn-outline">
            View all koi
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutSection({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getSettings>>;
}) {
  const story = settings.story;
  if (!story) return null;
  return (
    <section id="about" className="section bg-white">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        {story.imageUrl && (
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-water-gradient" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.imageUrl}
              alt={story.title}
              className="rounded-[2rem] object-cover shadow-soft"
            />
          </div>
        )}
        <div className={story.imageUrl ? "" : "lg:col-span-2"}>
          {story.eyebrow && (
            <span className="pill bg-koi-100 text-koi-700">
              {story.eyebrow}
            </span>
          )}
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            {story.title}
          </h2>
          {story.body && (
            <p className="mt-4 whitespace-pre-line text-koi-800/80">
              {story.body}
            </p>
          )}
          {story.bullets.length > 0 && (
            <ul className="mt-6 space-y-3 text-sm">
              {story.bullets.map((item) => (
                <li key={item} className="flex gap-3 text-koi-900">
                  <span className="mt-1 h-2 w-2 rounded-full bg-koi-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      title: "1 · Discover",
      body: "Browse the gallery or tell us what variety, size, and budget you have in mind.",
    },
    {
      title: "2 · Reserve",
      body: "Reserve any koi with a deposit. We hold it in quarantine until you're ready.",
    },
    {
      title: "3 · Deliver",
      body: "Insured local delivery, or carefully boxed overnight shipping nationwide.",
    },
  ];
  return (
    <section className="section bg-koi-50/40">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill bg-koi-100 text-koi-700">How it works</span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            From our pond to yours
          </h2>
          <p className="mt-2 text-koi-800/80">
            A simple, honest process — no auctions, no pressure.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="card p-6">
              <div className="font-display text-xl text-koi-700">{s.title}</div>
              <p className="mt-2 text-sm text-koi-800/80">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getSettings>>;
}) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-deep-water text-white"
    >
      <div className="container-page section grid gap-10 lg:grid-cols-2">
        <div>
          <span className="pill bg-white/10 text-koi-100 ring-1 ring-white/20">
            Get in touch
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Looking for a specific variety or size?
          </h2>
          <p className="mt-3 max-w-lg text-koi-100/90">
            Tell us what you&apos;re after and we&apos;ll send hand-picked
            options — usually the same day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappLink(
                settings,
                `Hi ${settings.businessName}, I'd like help picking a koi.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              WhatsApp us
            </a>
            <a
              href={`tel:${settings.phone}`}
              className="btn bg-white text-koi-800 hover:bg-koi-100"
            >
              Call {settings.phone}
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              {settings.email}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-koi-100/80">
              Location
            </div>
            <div className="mt-2 font-display text-xl">
              {settings.location}
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-koi-100/80">
              Hours
            </div>
            <div className="mt-2 font-display text-xl">By appointment</div>
          </div>
          <div className="col-span-2 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-koi-100/80">
              Response time
            </div>
            <div className="mt-2 font-display text-xl">Usually within 1 hour</div>
            <p className="mt-1 text-sm text-koi-100/80">
              Messages are answered in order — thanks for your patience during
              feeding hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
