export type KoiStatus = "available" | "reserved" | "sold";

export interface KoiMedia {
  /** Drive file id if uploaded, otherwise empty */
  driveId?: string;
  /** Publicly viewable url (Drive thumbnail, share link, or external) */
  url: string;
  /** "image" | "video" */
  kind: "image" | "video";
  /** Optional caption */
  caption?: string;
}

export interface KoiListing {
  id: string;
  code: string;
  name: string;
  variety: string;
  size: string; // e.g. "45 cm"
  age?: string; // e.g. "Tosai (1yr)"
  sex?: "male" | "female" | "unknown";
  breeder?: string;
  price: number;
  currency: string; // ISO code, default "USD"
  status: KoiStatus;
  description: string;
  media: KoiMedia[];
  proofOfSale: KoiMedia[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteStory {
  eyebrow: string; // small label above the title (e.g. "Our story")
  title: string;
  body: string;
  bullets: string[];
  imageUrl?: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string; // digits only, with country code
  email: string;
  location: string;
  instagram?: string;
  facebook?: string;
  story?: SiteStory;
}

export interface KoiData {
  settings: SiteSettings;
  koi: KoiListing[];
}
