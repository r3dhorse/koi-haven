"use client";

import Image from "next/image";
import { useState } from "react";
import type { KoiMedia } from "@/lib/types";

export function MediaGallery({ items }: { items: KoiMedia[] }) {
  const [active, setActive] = useState(0);
  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-koi-50 text-koi-400">
        No media yet
      </div>
    );
  }
  const current = items[active];
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-koi-50">
        {current.kind === "image" ? (
          <Image
            src={current.url}
            alt={current.caption ?? "Koi photo"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <iframe
            src={current.url}
            title={current.caption ?? "Koi video"}
            allow="autoplay"
            className="h-full w-full"
          />
        )}
        {current.caption && (
          <div className="absolute inset-x-3 bottom-3 rounded-full bg-white/85 px-3 py-1 text-xs text-ink backdrop-blur">
            {current.caption}
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto">
          {items.map((m, i) => (
            <button
              key={`${m.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                i === active
                  ? "ring-koi-500"
                  : "ring-transparent hover:ring-koi-200"
              }`}
              aria-label={`Show media ${i + 1}`}
            >
              {m.kind === "image" ? (
                <Image
                  src={m.url}
                  alt={m.caption ?? `Thumbnail ${i + 1}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-ink text-xs text-white">
                  ▶ Video
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
