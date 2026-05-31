# Koi Haven — Koi Fish Sales Website

A modern Next.js storefront for a koi fish business. Owners can showcase
available koi, upload photos and videos of each fish (and proof of sale)
straight to Google Drive, and let customers contact them in one tap via
WhatsApp, phone, or email.

Built with:

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** (water-inspired blue/white theme, Inter + Playfair Display)
- **JSON-based storage** for the MVP (single `data/koi.json` file)
- **Google Drive API** (service account) for hosting koi media

## Features

- Public storefront
  - Home page with hero, featured koi, about, process, and contact sections
  - Koi listings page with filters by status and variety
  - Koi detail page with media gallery, full info, and a proof-of-sale section
  - Sticky WhatsApp + phone CTA in the header on every page
  - "Inquire" button on every koi includes the koi's name/code in the WhatsApp message
  - Fully responsive (mobile, tablet, desktop)
- Admin (`/admin`)
  - Password-protected admin dashboard
  - Add / edit / delete koi listings
  - Upload photos & videos to Google Drive (or paste an external URL)
  - Mark koi as **Available**, **Reserved**, or **Sold**
  - Upload proof-of-sale media to any koi
  - Edit business name, tagline, phone, WhatsApp number, email, location, socials
  - Change the admin password from the dashboard
- Data
  - All data lives in `data/koi.json` (auto-created on first run with sample koi)
  - Google Drive file IDs and public viewer URLs are stored alongside each koi

## Quick start

```bash
# install deps
npm install

# run the dev server
npm run dev

# production build
npm run build
npm start
```

Then open <http://localhost:3000>.

The first time the app boots, `data/koi.json` is created with sample data,
default settings, and the default admin password `changeme`. Sign in at
<http://localhost:3000/admin> and change the password from the Settings tab.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `GOOGLE_DRIVE_CLIENT_EMAIL` | Service account email |
| `GOOGLE_DRIVE_PRIVATE_KEY`  | Service account private key (with `\n` escapes) |
| `GOOGLE_DRIVE_FOLDER_ID`    | Drive folder ID that the service account can write to |

If these are not set, the storefront still works (with external image URLs),
but the admin "Upload to Drive" button will return a friendly 503.

## Google Drive setup (one time)

1. Go to <https://console.cloud.google.com/> and create or pick a project.
2. **Enable APIs & Services → Library → Google Drive API → Enable**.
3. **IAM & Admin → Service accounts → Create service account.** Give it a name
   like `koi-uploader`. No project roles are required.
4. On the service account, **Keys → Add Key → JSON**. Save the file.
5. From the JSON, copy:
   - `client_email` → `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `private_key`  → `GOOGLE_DRIVE_PRIVATE_KEY`
     (keep the `\n` escapes if pasting into a single line)
6. In Google Drive, create a folder (e.g. `Koi Haven Uploads`).
   - Right-click → **Share** → paste the service account email →
     **Editor** access.
   - Open the folder; the URL ends in `…/folders/<FOLDER_ID>`.
     Copy that ID → `GOOGLE_DRIVE_FOLDER_ID`.

Uploads from the admin page will land in that folder and are made publicly
viewable via `https://lh3.googleusercontent.com/d/<fileId>=s2000` (images)
or `https://drive.google.com/file/d/<fileId>/preview` (videos).

## Vercel deployment

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. Framework preset: **Next.js**. Build command and output directory: defaults.
4. Set environment variables in **Project → Settings → Environment Variables**:
   - `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `GOOGLE_DRIVE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID`
   For the private key, paste with `\n` as literal `\n` (Vercel preserves it).
5. **Deploy**.

> ⚠️ **Persistence note.** On Vercel, the filesystem is ephemeral, so the
> `data/koi.json` file resets to the seed on each deploy. For production, swap
> `src/lib/store.ts` to use a hosted database
> (Neon, Upstash, Vercel Blob + JSON, etc.). The interfaces in
> `src/lib/store.ts` are intentionally tiny — only `readData` / `writeData`
> need to change. For most koi businesses with a single seller, deploying once
> and editing through `/admin` works fine because Vercel rebuilds preserve the
> committed `data/koi.json`. Commit changes you want to keep.

For a no-rebuild alternative, host `data/koi.json` in a private GitHub Gist
or in Vercel Blob and read/write it from the same store interface.

## Project structure

```
src/
  app/
    layout.tsx                 # Root layout, fonts, header/footer
    page.tsx                   # Home page
    globals.css                # Tailwind + theme
    koi/
      page.tsx                 # Listings + filters
      [id]/page.tsx            # Detail page + proof of sale
    admin/
      page.tsx                 # Server-rendered admin shell (auth check)
      AdminLogin.tsx           # Login form
      AdminDashboard.tsx       # CRUD UI, settings, media manager
    api/
      koi/route.ts             # GET list, POST upsert
      koi/[id]/route.ts        # GET one, DELETE
      settings/route.ts        # GET, PATCH
      upload/route.ts          # POST file to Google Drive
      admin/login/route.ts     # POST login, DELETE logout
  components/
    Header.tsx
    Footer.tsx
    KoiCard.tsx
    MediaGallery.tsx
  lib/
    types.ts                   # KoiListing, SiteSettings, KoiMedia, KoiStatus
    store.ts                   # JSON read/write + CRUD
    drive.ts                   # Google Drive upload/delete + URL helpers
    auth.ts                    # Cookie-based admin session
    format.ts                  # Price, status badge, WhatsApp link helpers
data/
  koi.json                     # Auto-created on first run
```

## Customising

- **Theme.** Edit `tailwind.config.ts` (`koi.*` color scale).
- **Sample data.** Edit `seedKoi` in `src/lib/store.ts` (only used when
  `data/koi.json` does not yet exist).
- **Contact text.** Use the admin Settings tab — no code changes required.
- **Featured koi on home page.** Toggle the **Featured** checkbox in the
  admin editor.

## Customer contact flow

Every koi page and card has an **Inquire** button that opens WhatsApp with a
pre-filled message including the koi code and name, e.g.:

> Hi Koi Haven, I'm interested in KH-002 – Yoru no Kage. Is it still available?

The header has a sticky WhatsApp button and (on large screens) the phone
number. The Footer surfaces phone, email, and WhatsApp.

## Sample data

`src/lib/store.ts` ships with six sample koi covering Kohaku, Showa, Ogon,
Sanke, Ginrin Kohaku, and Shiro Utsuri, in **Available**, **Reserved**, and
**Sold** states (one with a proof-of-sale image) so every UI state is visible
out of the box.
