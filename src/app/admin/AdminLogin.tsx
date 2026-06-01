"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setPending(false);
      setError("Invalid password.");
      return;
    }
    // Force a full reload so the server re-evaluates the admin session with the
    // freshly set cookie and renders the dashboard. A soft router.refresh() can
    // race the new cookie and leave the user stuck on the login screen.
    window.location.assign("/admin");
  }

  return (
    <section className="section">
      <div className="container-page">
        <div className="mx-auto max-w-md card p-8">
          <h1 className="font-display text-3xl text-ink">Admin sign in</h1>
          <p className="mt-2 text-sm text-koi-700/80">
            Enter your admin password to manage koi listings.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-widest text-koi-600"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-koi-200 px-4 py-2 focus:border-koi-500 focus:outline-none"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full disabled:opacity-50"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
