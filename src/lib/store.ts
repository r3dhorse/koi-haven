import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  KoiData,
  KoiListing,
  KoiStatus,
  SiteSettings,
  SiteStory,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "koi.json");

// Stable pathname inside the linked Vercel Blob store.
const BLOB_PATH = "koi-haven/data.json";

export const defaultStory: SiteStory = {
  eyebrow: "Our story",
  title: "Twelve years of hand-picking koi worth keeping.",
  body: "We began in a backyard pond. Today we travel to Japan twice a year, work directly with breeders, and only bring back koi we'd be proud to keep ourselves.",
  bullets: [
    "Direct relationships with Niigata and Hiroshima breeders",
    "21-day quarantine, salt + heat protocol on every koi",
    "Detailed top + side photography before sale",
    "Honest, no-pressure guidance for keepers at any level",
  ],
  imageUrl:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1400&q=80",
};

const defaultSettings: SiteSettings = {
  businessName: "Koi Haven",
  tagline: "Premium Japanese koi from trusted breeders.",
  phone: "+1 (555) 010-0123",
  whatsapp: "15550100123",
  email: "hello@koihaven.example",
  location: "Pacific Northwest, USA",
  instagram: "koihaven",
  facebook: "koihaven",
  story: defaultStory,
};

const seedKoi: KoiListing[] = [
  {
    id: "kh-001",
    code: "KH-001",
    name: "Sakura no Yume",
    variety: "Kohaku",
    size: "52 cm",
    age: "Nisai (2yr)",
    sex: "female",
    breeder: "Sakai Fish Farm",
    price: 1850,
    currency: "USD",
    status: "available",
    description:
      "A standout Kohaku with crisp red plates and clean white skin. Excellent body conformation and confident swim. Photographed in our quarantine pond after a 21-day acclimation.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
        caption: "Top-down view in show tub",
      },
      {
        url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
        caption: "Side profile",
      },
    ],
    proofOfSale: [],
    featured: true,
    createdAt: new Date("2026-04-01").toISOString(),
    updatedAt: new Date("2026-05-01").toISOString(),
  },
  {
    id: "kh-002",
    code: "KH-002",
    name: "Yoru no Kage",
    variety: "Showa Sanshoku",
    size: "47 cm",
    age: "Nisai (2yr)",
    sex: "male",
    breeder: "Dainichi",
    price: 2400,
    currency: "USD",
    status: "available",
    description:
      "Bold sumi distribution with deep, glossy black plates wrapping over the shoulder. Hi pattern balanced and pushing forward as the koi matures.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
        caption: "Showa top view",
      },
    ],
    proofOfSale: [],
    featured: true,
    createdAt: new Date("2026-04-05").toISOString(),
    updatedAt: new Date("2026-05-04").toISOString(),
  },
  {
    id: "kh-003",
    code: "KH-003",
    name: "Tsuki no Hikari",
    variety: "Ogon",
    size: "38 cm",
    age: "Tosai (1yr)",
    sex: "unknown",
    breeder: "Marusei",
    price: 620,
    currency: "USD",
    status: "reserved",
    description:
      "Brilliant platinum Ogon with high-luster scales and clean head. A great entry point into metallic koi.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
      },
    ],
    proofOfSale: [],
    featured: false,
    createdAt: new Date("2026-04-10").toISOString(),
    updatedAt: new Date("2026-05-10").toISOString(),
  },
  {
    id: "kh-004",
    code: "KH-004",
    name: "Akai Kawa",
    variety: "Taisho Sanke",
    size: "55 cm",
    age: "Sansai (3yr)",
    sex: "female",
    breeder: "Momotaro",
    price: 3200,
    currency: "USD",
    status: "sold",
    description:
      "A grown-on Sanke with mature red and tight sumi. Sold to a private collector in May 2026.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1545816250-e12bedba42ba?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
      },
    ],
    proofOfSale: [
      {
        url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
        caption: "Handover at customer pond",
      },
    ],
    featured: false,
    createdAt: new Date("2026-03-20").toISOString(),
    updatedAt: new Date("2026-05-12").toISOString(),
  },
  {
    id: "kh-005",
    code: "KH-005",
    name: "Hoshi no Suzu",
    variety: "Ginrin Kohaku",
    size: "42 cm",
    age: "Nisai (2yr)",
    sex: "female",
    breeder: "Isa",
    price: 1400,
    currency: "USD",
    status: "available",
    description:
      "Sparkling Ginrin scales over a tidy Kohaku pattern. Looks especially striking under afternoon pond light.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
      },
    ],
    proofOfSale: [],
    featured: true,
    createdAt: new Date("2026-04-18").toISOString(),
    updatedAt: new Date("2026-05-18").toISOString(),
  },
  {
    id: "kh-006",
    code: "KH-006",
    name: "Mizu no Tama",
    variety: "Shiro Utsuri",
    size: "49 cm",
    age: "Nisai (2yr)",
    sex: "male",
    breeder: "Omosako",
    price: 1950,
    currency: "USD",
    status: "available",
    description:
      "Inky sumi over snow-white skin. Classic Omosako body shape with a strong, balanced swim.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80",
        kind: "image",
      },
    ],
    proofOfSale: [],
    featured: false,
    createdAt: new Date("2026-04-22").toISOString(),
    updatedAt: new Date("2026-05-22").toISOString(),
  },
];

const defaultData: KoiData = {
  settings: defaultSettings,
  koi: seedKoi,
};

/* ------------------------------------------------------------------ */
/* Storage backends                                                    */
/* ------------------------------------------------------------------ */

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** In-process cache for the duration of a single request. */
let memoryCache: { data: KoiData; mtime: number } | null = null;
const MEMORY_TTL_MS = 5_000;

async function readFromFile(): Promise<KoiData> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as KoiData;
}

async function writeToFile(data: KoiData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function readFromBlob(): Promise<KoiData> {
  const { get, put } = await import("@vercel/blob");
  try {
    const result = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result) {
      await put(BLOB_PATH, JSON.stringify(defaultData, null, 2), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return defaultData;
    }
    const text = await streamToString(result.stream);
    return JSON.parse(text) as KoiData;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("BlobNotFound") ||
      message.includes("not found") ||
      message.includes("404")
    ) {
      await put(BLOB_PATH, JSON.stringify(defaultData, null, 2), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return defaultData;
    }
    throw err;
  }
}

async function writeToBlob(data: KoiData): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function streamToString(
  stream: ReadableStream<Uint8Array> | null,
): Promise<string> {
  if (!stream) return "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function readData(): Promise<KoiData> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.mtime < MEMORY_TTL_MS) {
    return memoryCache.data;
  }
  const data = useBlob() ? await readFromBlob() : await readFromFile();
  memoryCache = { data, mtime: now };
  return data;
}

export async function writeData(data: KoiData): Promise<void> {
  if (useBlob()) {
    await writeToBlob(data);
  } else {
    await writeToFile(data);
  }
  memoryCache = { data, mtime: Date.now() };
}

export async function getSettings(): Promise<SiteSettings> {
  const data = await readData();
  // Back-fill story for older blob payloads that don't have it yet.
  if (!data.settings.story) {
    data.settings = { ...data.settings, story: defaultStory };
  }
  return data.settings;
}

export async function updateSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const data = await readData();
  data.settings = { ...data.settings, ...patch };
  await writeData(data);
  return data.settings;
}

export async function listKoi(filter?: {
  status?: KoiStatus;
  featured?: boolean;
}): Promise<KoiListing[]> {
  const data = await readData();
  let items = data.koi;
  if (filter?.status) items = items.filter((k) => k.status === filter.status);
  if (filter?.featured !== undefined)
    items = items.filter((k) => Boolean(k.featured) === filter.featured);
  return items.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getKoi(id: string): Promise<KoiListing | null> {
  const data = await readData();
  return data.koi.find((k) => k.id === id) ?? null;
}

export async function upsertKoi(input: KoiListing): Promise<KoiListing> {
  const data = await readData();
  const idx = data.koi.findIndex((k) => k.id === input.id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    data.koi[idx] = { ...input, updatedAt: now };
  } else {
    data.koi.push({ ...input, createdAt: now, updatedAt: now });
  }
  await writeData(data);
  return data.koi[idx >= 0 ? idx : data.koi.length - 1];
}

export async function deleteKoi(id: string): Promise<void> {
  const data = await readData();
  data.koi = data.koi.filter((k) => k.id !== id);
  await writeData(data);
}

export function makeId(): string {
  const ts = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `kh-${ts}${r}`;
}
