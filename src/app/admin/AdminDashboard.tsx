"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { KoiListing, KoiMedia, KoiStatus, SiteSettings } from "@/lib/types";
import { formatPrice, statusBadge } from "@/lib/format";

type SafeSettings = Omit<SiteSettings, "adminPassword">;

export function AdminDashboard({
  initialKoi,
  initialSettings,
}: {
  initialKoi: KoiListing[];
  initialSettings: SafeSettings;
}) {
  const router = useRouter();
  const [koi, setKoi] = useState<KoiListing[]>(initialKoi);
  const [settings, setSettings] = useState<SafeSettings>(initialSettings);
  const [editing, setEditing] = useState<KoiListing | null>(null);
  const [tab, setTab] = useState<"koi" | "settings">("koi");

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
      currency: "USD",
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
      </div>
    </section>
  );
}

function KoiTable({
  items,
  onEdit,
  onDelete,
}: {
  items: KoiListing[];
  onEdit: (k: KoiListing) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-6 card p-8 text-center text-koi-700">
        No listings yet — add your first koi.
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-x-auto card">
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
          {items.map((k) => {
            const badge = statusBadge(k.status);
            return (
              <tr key={k.id} className="hover:bg-koi-50/40">
                <td className="px-4 py-3 font-mono text-xs text-koi-700">
                  {k.code}
                </td>
                <td className="px-4 py-3 font-medium text-ink">{k.name}</td>
                <td className="px-4 py-3 text-koi-800">{k.variety}</td>
                <td className="px-4 py-3 text-koi-800">{k.size}</td>
                <td className="px-4 py-3 text-koi-800">
                  {formatPrice(k.price, k.currency)}
                </td>
                <td className="px-4 py-3">
                  <span className={`pill ${badge.classes}`}>{badge.label}</span>
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
  );
}

function SettingsForm({
  settings,
  onSaved,
}: {
  settings: SafeSettings;
  onSaved: (s: SafeSettings) => void;
}) {
  const [form, setForm] = useState<SafeSettings & { adminPassword?: string }>({
    ...settings,
  });
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const body: Record<string, unknown> = { ...form };
    if (!body.adminPassword) delete body.adminPassword;
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
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
      <Field label="New admin password (leave blank to keep)">
        <input
          type="password"
          className="input"
          value={form.adminPassword ?? ""}
          onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
        />
      </Field>
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setUploadError(j.error ?? "Upload failed.");
      return;
    }
    const j = await res.json();
    onChange([...items, j.media as KoiMedia]);
  }

  function addExternal() {
    const url = prompt("Paste an image or video URL:");
    if (!url) return;
    const kind = /\.(mp4|mov|webm)$/i.test(url) ? "video" : "image";
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
        <div className="flex gap-2">
          <label className="btn-outline cursor-pointer px-3 py-1 text-xs">
            {uploading ? "Uploading…" : "Upload to Drive"}
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={onPick}
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={addExternal}
            className="btn-outline px-3 py-1 text-xs"
          >
            Add by URL
          </button>
        </div>
      </div>
      {uploadError && (
        <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {uploadError}
        </div>
      )}
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
