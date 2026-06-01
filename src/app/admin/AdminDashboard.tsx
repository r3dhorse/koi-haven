"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  KoiListing,
  KoiMedia,
  KoiStatus,
  ProcessStep,
  SiteProcess,
  SiteSettings,
  SiteStat,
  SiteStory,
} from "@/lib/types";
import { formatPrice, normalizeImageUrl, statusBadge } from "@/lib/format";

const MAX_PROCESS_STEPS = 4;

export function AdminDashboard({
  initialKoi,
  initialSettings,
}: {
  initialKoi: KoiListing[];
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [koi, setKoi] = useState<KoiListing[]>(initialKoi);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [editing, setEditing] = useState<KoiListing | null>(null);
  const [tab, setTab] = useState<"koi" | "settings">("koi");
  const [passwordOpen, setPasswordOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  async function reloadKoi() {
    const r = await fetch("/api/koi", { cache: "no-store" });
    const j = await r.json();
    setKoi(j.items as KoiListing[]);
  }

  async function deleteKoi(id: string) {
    if (!confirm("Delete this koi listing?")) return;
    await fetch(`/api/koi/${id}`, { method: "DELETE" });
    await reloadKoi();
  }

  function emptyKoi(): KoiListing {
    const now = new Date().toISOString();
    return {
      id: "",
      code: "",
      name: "",
      variety: "Kohaku",
      size: "",
      age: "",
      sex: "unknown",
      breeder: "",
      price: 0,
      currency: "PHP",
      status: "available",
      description: "",
      media: [],
      proofOfSale: [],
      featured: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  return (
    <section className="section">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="pill bg-koi-100 text-koi-700">Admin</span>
            <h1 className="mt-2 font-display text-3xl text-ink">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab(tab === "koi" ? "settings" : "koi")}
              className="btn-outline"
            >
              {tab === "koi" ? "Site settings" : "Back to koi"}
            </button>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="btn-outline"
            >
              Change password
            </button>
            <button type="button" onClick={logout} className="btn-outline">
              Sign out
            </button>
          </div>
        </div>

        {tab === "koi" ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">
                Koi listings ({koi.length})
              </h2>
              <button
                type="button"
                onClick={() => setEditing(emptyKoi())}
                className="btn-primary"
              >
                + New koi
              </button>
            </div>
            <KoiTable
              items={koi}
              onEdit={setEditing}
              onDelete={deleteKoi}
            />
          </>
        ) : (
          <SettingsForm
            settings={settings}
            onSaved={(s) => setSettings(s)}
          />
        )}

        {editing && (
          <KoiEditor
            koi={editing}
            onClose={() => setEditing(null)}
            onSaved={async () => {
              setEditing(null);
              await reloadKoi();
            }}
          />
        )}
        {passwordOpen && (
          <ChangePasswordModal onClose={() => setPasswordOpen(false)} />
        )}
      </div>
    </section>
  );
}

const PAGE_SIZE = 10;

function KoiTable({
  items,
  onEdit,
  onDelete,
}: {
  items: KoiListing[];
  onEdit: (k: KoiListing) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [variety, setVariety] = useState("");
  const [page, setPage] = useState(0);

  const varieties = useMemo(
    () => Array.from(new Set(items.map((k) => k.variety))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((k) => {
      if (variety && k.variety !== variety) return false;
      if (q && !k.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, variety]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    setPage(0);
  }, [query, variety]);
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  if (items.length === 0) {
    return (
      <div className="mt-6 card p-8 text-center text-koi-700">
        No listings yet — add your first koi.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="koi-code-search"
            className="text-[10px] uppercase tracking-widest text-koi-600"
          >
            Search code
          </label>
          <input
            id="koi-code-search"
            className="input mt-1"
            value={query}
            placeholder="e.g. KH-001"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="min-w-[200px]">
          <label
            htmlFor="koi-variety-filter"
            className="text-[10px] uppercase tracking-widest text-koi-600"
          >
            Variety
          </label>
          <select
            id="koi-variety-filter"
            className="input mt-1"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
          >
            <option value="">All varieties</option>
            {varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        {(query || variety) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setVariety("");
            }}
            className="btn-outline px-3 py-2 text-xs"
          >
            Clear filters
          </button>
        )}
        <div className="ml-auto text-xs text-koi-700/80">
          Showing {visible.length} of {filtered.length}
          {filtered.length !== items.length && ` (${items.length} total)`}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-koi-700">
          No koi match those filters.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto card">
            <table className="w-full text-left text-sm">
              <thead className="bg-koi-50 text-xs uppercase tracking-widest text-koi-700">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Variety</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-koi-100">
                {visible.map((k) => {
                  const badge = statusBadge(k.status);
                  return (
                    <tr key={k.id} className="hover:bg-koi-50/40">
                      <td className="px-4 py-3 font-mono text-xs text-koi-700">
                        {k.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {k.name}
                      </td>
                      <td className="px-4 py-3 text-koi-800">{k.variety}</td>
                      <td className="px-4 py-3 text-koi-800">{k.size}</td>
                      <td className="px-4 py-3 text-koi-800">
                        {formatPrice(k.price, k.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`pill ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-koi-800">
                        {k.featured ? "★" : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onEdit(k)}
                          className="btn-outline px-3 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(k.id)}
                          className="ml-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-koi-700/80">
                Page {safePage + 1} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SettingsForm({
  settings,
  onSaved,
}: {
  settings: SiteSettings;
  onSaved: (s: SiteSettings) => void;
}) {
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    const j = await res.json();
    onSaved(j.settings);
    setStatus("saved");
  }

  return (
    <form onSubmit={save} className="mt-8 card grid gap-4 p-6 md:grid-cols-2">
      <Field label="Business name">
        <input
          className="input"
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
        />
      </Field>
      <Field label="Tagline">
        <input
          className="input"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
      </Field>
      <Field label="Phone (display)">
        <input
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>
      <Field label="WhatsApp number (digits, country code)">
        <input
          className="input"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        />
      </Field>
      <Field label="Email">
        <input
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>
      <Field label="Location">
        <input
          className="input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </Field>
      <Field label="Instagram handle">
        <input
          className="input"
          value={form.instagram ?? ""}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
        />
      </Field>
      <Field label="Facebook handle">
        <input
          className="input"
          value={form.facebook ?? ""}
          onChange={(e) => setForm({ ...form, facebook: e.target.value })}
        />
      </Field>
      <div className="md:col-span-2 rounded-2xl bg-koi-50/70 px-4 py-3 text-xs text-koi-800/80 ring-1 ring-koi-100">
        Change the admin password using the <strong>Change password</strong>{" "}
        button at the top of this page. The{" "}
        <code className="font-mono">ADMIN_PASSWORD</code> env var is only used
        for first-time bootstrap before a password is set.
      </div>

      <div className="md:col-span-2">
        <HeroImagesEditor
          images={form.heroImages ?? ["", "", "", ""]}
          onChange={(heroImages) => setForm({ ...form, heroImages })}
        />
      </div>

      <div className="md:col-span-2">
        <StatsEditor
          stats={form.stats ?? []}
          onChange={(stats) => setForm({ ...form, stats })}
        />
      </div>

      <div className="md:col-span-2">
        <StoryEditor
          story={
            form.story ?? {
              eyebrow: "Our story",
              title: "",
              body: "",
              bullets: [],
              imageUrl: "",
            }
          }
          onChange={(story) => setForm({ ...form, story })}
        />
      </div>

      <div className="md:col-span-2">
        <ProcessEditor
          proc={
            form.process ?? {
              eyebrow: "How it works",
              title: "",
              intro: "",
              steps: [],
            }
          }
          onChange={(process) => setForm({ ...form, process })}
        />
      </div>
      <div className="flex items-end justify-end gap-3 md:col-span-2">
        {status === "saved" && (
          <span className="text-sm text-emerald-700">Saved.</span>
        )}
        {status === "error" && (
          <span className="text-sm text-rose-700">Save failed.</span>
        )}
        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-koi-600">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function KoiEditor({
  koi,
  onClose,
  onSaved,
}: {
  koi: KoiListing;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<KoiListing>(koi);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isNew = useMemo(() => !koi.id, [koi.id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/koi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:p-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-koi-100 px-6 py-4">
          <h3 className="font-display text-2xl text-ink">
            {isNew ? "New koi" : `Edit ${form.code || form.name}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-koi-700 hover:bg-koi-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={save} className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Code">
            <input
              className="input"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="KH-007"
            />
          </Field>
          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Variety">
            <input
              className="input"
              value={form.variety}
              onChange={(e) => setForm({ ...form, variety: e.target.value })}
            />
          </Field>
          <Field label="Size">
            <input
              className="input"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="45 cm"
            />
          </Field>
          <Field label="Age">
            <input
              className="input"
              value={form.age ?? ""}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="Nisai (2yr)"
            />
          </Field>
          <Field label="Sex">
            <select
              className="input"
              value={form.sex ?? "unknown"}
              onChange={(e) =>
                setForm({ ...form, sex: e.target.value as KoiListing["sex"] })
              }
            >
              <option value="unknown">Unknown</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Breeder">
            <input
              className="input"
              value={form.breeder ?? ""}
              onChange={(e) => setForm({ ...form, breeder: e.target.value })}
            />
          </Field>
          <Field label="Price">
            <input
              type="number"
              min={0}
              step={1}
              className="input"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Currency">
            <input
              className="input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as KoiStatus })
              }
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.featured ?? false}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />
            <span className="text-sm text-koi-800">
              Featured on the home page
            </span>
          </label>

          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                className="input"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <MediaManager
              label="Photos & videos"
              items={form.media}
              onChange={(media) => setForm({ ...form, media })}
            />
          </div>
          <div className="md:col-span-2">
            <MediaManager
              label="Proof of sale"
              items={form.proofOfSale}
              onChange={(proofOfSale) => setForm({ ...form, proofOfSale })}
            />
          </div>

          {error && (
            <div className="md:col-span-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create koi" : "Save changes"}
            </button>
          </div>

          <style jsx>{`
            :global(.input) {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid #bfe0f5;
              background: #fff;
              padding: 0.5rem 0.875rem;
            }
            :global(.input:focus) {
              outline: none;
              border-color: #1e8dc6;
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

function MediaManager({
  label,
  items,
  onChange,
}: {
  label: string;
  items: KoiMedia[];
  onChange: (items: KoiMedia[]) => void;
}) {
  function addExternal() {
    const raw = prompt("Paste a Google Drive image or video URL:");
    if (!raw) return;
    const kind = /\.(mp4|mov|webm)$/i.test(raw) ? "video" : "image";
    const url = kind === "image" ? normalizeImageUrl(raw) : raw;
    onChange([...items, { url, kind }]);
  }

  function updateItem(i: number, patch: Partial<KoiMedia>) {
    const copy = [...items];
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }

  return (
    <div className="rounded-2xl border border-koi-100 bg-koi-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-koi-700">
          {label}
        </span>
        <button
          type="button"
          onClick={addExternal}
          className="btn-outline px-3 py-1 text-xs"
        >
          Add by URL
        </button>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-koi-700/80">No media yet.</p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((m, i) => (
            <li
              key={`${m.url}-${i}`}
              className="flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-koi-100"
            >
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-koi-50">
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-koi-700">
                    Video
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  className="w-full rounded-lg border border-koi-100 px-2 py-1 text-xs"
                  value={m.caption ?? ""}
                  placeholder="Caption (optional)"
                  onChange={(e) =>
                    updateItem(i, { caption: e.target.value })
                  }
                />
                <div className="mt-1 truncate text-[10px] text-koi-600">
                  {m.url}
                </div>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="rounded-full bg-koi-50 px-2 py-0.5 text-[10px] text-koi-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="rounded-full bg-koi-50 px-2 py-0.5 text-[10px] text-koi-700"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeroImagesEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const slots = [0, 1, 2, 3];
  const labels = [
    "1. Big card (top-left, ~4:3)",
    "2. Tall card (top-right, ~2:3)",
    "3. Tall card (middle-right, ~2:3)",
    "4. Wide card (bottom, ~2:1)",
  ];
  const filled: string[] = [
    images[0] ?? "",
    images[1] ?? "",
    images[2] ?? "",
    images[3] ?? "",
  ];

  function setAt(idx: number, value: string) {
    const next = [...filled];
    next[idx] = normalizeImageUrl(value);
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-koi-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-koi-700">
          Hero collage (4 images)
        </span>
        <span className="text-[10px] text-koi-600">
          Paste a Google Drive share URL
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {slots.map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-koi-50/40 p-4 ring-1 ring-koi-100"
          >
            <div className="text-[11px] font-semibold text-koi-700">
              {labels[i]}
            </div>
            <div className="mt-2 flex gap-3">
              <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-koi-100">
                {filled[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filled[i]}
                    alt={labels[i]}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-koi-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  className="input"
                  value={filled[i]}
                  placeholder="https://drive.google.com/file/d/…"
                  onChange={(e) => setAt(i, e.target.value)}
                />
                {filled[i] && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setAt(i, "")}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsEditor({
  stats,
  onChange,
}: {
  stats: SiteStat[];
  onChange: (next: SiteStat[]) => void;
}) {
  const slots = [0, 1, 2, 3];
  const filled: SiteStat[] = slots.map((i) => stats[i] ?? { label: "", value: "" });

  function setAt(idx: number, patch: Partial<SiteStat>) {
    const next = filled.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-koi-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-koi-700">
          Hero stat cards (4)
        </span>
        <span className="text-[10px] text-koi-600">
          Shown under the hero — e.g. Bloodlines, Varieties, Sizes, Shipping
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {slots.map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-koi-50/40 p-4 ring-1 ring-koi-100"
          >
            <div className="text-[11px] font-semibold text-koi-700">
              Card {i + 1}
            </div>
            <div className="mt-2 grid gap-2">
              <Field label="Label">
                <input
                  className="input"
                  value={filled[i].label}
                  placeholder="Bloodlines"
                  onChange={(e) => setAt(i, { label: e.target.value })}
                />
              </Field>
              <Field label="Value">
                <input
                  className="input"
                  value={filled[i].value}
                  placeholder="Sakai · Dainichi · Momotaro · Marusei"
                  onChange={(e) => setAt(i, { value: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryEditor({
  story,
  onChange,
}: {
  story: SiteStory;
  onChange: (s: SiteStory) => void;
}) {
  // Keep the raw textarea text in local state so newlines (and the empty line
  // you type before a new bullet) survive editing. Splitting/filtering happens
  // only when propagating to the parent, never on the displayed value.
  const [bulletsText, setBulletsText] = useState(story.bullets.join("\n"));

  function setBullets(raw: string) {
    setBulletsText(raw);
    const bullets = raw
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onChange({ ...story, bullets });
  }

  return (
    <div className="rounded-2xl border border-koi-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-koi-700">
          Our Story section
        </span>
        <span className="text-[10px] text-koi-600">
          Shown on the home page
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow label (small text above title)">
          <input
            className="input"
            value={story.eyebrow}
            onChange={(e) => onChange({ ...story, eyebrow: e.target.value })}
            placeholder="Our story"
          />
        </Field>
        <Field label="Image URL (optional)">
          <input
            className="input"
            value={story.imageUrl ?? ""}
            onChange={(e) =>
              onChange({ ...story, imageUrl: normalizeImageUrl(e.target.value) })
            }
            placeholder="https://…"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Title">
            <input
              className="input"
              value={story.title}
              onChange={(e) => onChange({ ...story, title: e.target.value })}
              placeholder="Twelve years of hand-picking koi worth keeping."
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Body">
            <textarea
              className="input"
              rows={4}
              value={story.body}
              onChange={(e) => onChange({ ...story, body: e.target.value })}
              placeholder="A short paragraph about your business and approach."
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Bullet points (one per line)">
            <textarea
              className="input"
              rows={5}
              value={bulletsText}
              onChange={(e) => setBullets(e.target.value)}
              placeholder={
                "Direct relationships with Niigata breeders\n21-day quarantine on every koi\nHonest, no-pressure guidance"
              }
            />
          </Field>
        </div>
      </div>

      {story.imageUrl && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-koi-600">
            Image preview
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.imageUrl}
            alt="Story preview"
            className="mt-1 h-32 w-auto rounded-xl object-cover ring-1 ring-koi-100"
          />
        </div>
      )}
    </div>
  );
}

function ProcessEditor({
  proc,
  onChange,
}: {
  proc: SiteProcess;
  onChange: (p: SiteProcess) => void;
}) {
  function updateStep(i: number, patch: Partial<ProcessStep>) {
    const steps = [...proc.steps];
    steps[i] = { ...steps[i], ...patch };
    onChange({ ...proc, steps });
  }

  function removeStep(i: number) {
    onChange({ ...proc, steps: proc.steps.filter((_, idx) => idx !== i) });
  }

  function moveStep(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= proc.steps.length) return;
    const steps = [...proc.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    onChange({ ...proc, steps });
  }

  function addStep() {
    if (proc.steps.length >= MAX_PROCESS_STEPS) return;
    const n = proc.steps.length + 1;
    onChange({
      ...proc,
      steps: [...proc.steps, { title: `${n} · Step ${n}`, body: "" }],
    });
  }

  const atMax = proc.steps.length >= MAX_PROCESS_STEPS;

  return (
    <div className="rounded-2xl border border-koi-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-koi-700">
          How it works section
        </span>
        <span className="text-[10px] text-koi-600">
          {proc.steps.length} / {MAX_PROCESS_STEPS} steps
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow label">
          <input
            className="input"
            value={proc.eyebrow}
            onChange={(e) => onChange({ ...proc, eyebrow: e.target.value })}
            placeholder="How it works"
          />
        </Field>
        <Field label="Title">
          <input
            className="input"
            value={proc.title}
            onChange={(e) => onChange({ ...proc, title: e.target.value })}
            placeholder="From our pond to yours"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Intro (optional)">
            <textarea
              className="input"
              rows={2}
              value={proc.intro}
              onChange={(e) => onChange({ ...proc, intro: e.target.value })}
              placeholder="A simple, honest process — no auctions, no pressure."
            />
          </Field>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-koi-700">
            Steps
          </span>
          <button
            type="button"
            onClick={addStep}
            disabled={atMax}
            className="btn-outline px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add step {atMax ? "(max 4)" : ""}
          </button>
        </div>

        {proc.steps.length === 0 ? (
          <p className="mt-3 text-sm text-koi-700/80">
            No steps yet. Add up to four.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {proc.steps.map((s, i) => (
              <li
                key={i}
                className="rounded-xl bg-koi-50/40 p-4 ring-1 ring-koi-100"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
                  <Field label={`Step ${i + 1} title`}>
                    <input
                      className="input"
                      value={s.title}
                      onChange={(e) =>
                        updateStep(i, { title: e.target.value })
                      }
                      placeholder={`${i + 1} · Step name`}
                    />
                  </Field>
                  <Field label="Body">
                    <textarea
                      className="input"
                      rows={2}
                      value={s.body}
                      onChange={(e) =>
                        updateStep(i, { body: e.target.value })
                      }
                      placeholder="A sentence or two describing this step."
                    />
                  </Field>
                </div>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] text-koi-700 ring-1 ring-koi-100 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(i, 1)}
                    disabled={i === proc.steps.length - 1}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] text-koi-700 ring-1 ring-koi-100 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) {
      setError("New passwords do not match.");
      setStatus("error");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    const r = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Password change failed.");
      setStatus("error");
      return;
    }
    setStatus("saved");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-ink">Change password</h2>
            <p className="mt-1 text-xs text-koi-700/80">
              Other signed-in sessions will be signed out.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-koi-600 hover:bg-koi-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <Field label="Current password">
            <input
              type="password"
              className="input"
              value={current}
              autoComplete="current-password"
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </Field>
          <Field label="New password (min 8 chars)">
            <input
              type="password"
              className="input"
              value={next}
              autoComplete="new-password"
              onChange={(e) => setNext(e.target.value)}
              required
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              className="input"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>
          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
          {status === "saved" && (
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Password updated.
            </div>
          )}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Close
            </button>
            <button
              type="submit"
              disabled={status === "saving"}
              className="btn-primary disabled:opacity-50"
            >
              {status === "saving" ? "Saving…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
