import React, { useEffect, useState } from "react";
import { api, buildQuery, currency } from "../api";
import { Badge, Card, Spinner } from "../components/ui";
import { Icons } from "../nav";

interface Doc {
  id: string;
  name: string;
  type: string;
  partyName?: string;
  url?: string | null;
  date?: string;
}

interface MediaItem {
  id: string;
  kind: "photo" | "document";
  source: string;
  name: string;
  sub: string;
  url: string;
  badge: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const groups = ["diamonds", "gemstones", "jewellery", "products"] as const;
        const results = await Promise.all(
          groups.map((g) => api.get<{ data: Array<Record<string, unknown>> }>(`/api/${g}${buildQuery({ pageSize: 1000 })}`))
        );
        const photos: MediaItem[] = [];
        results.forEach((res, gi) => {
          res.data.forEach((row) => {
            const list = Array.isArray(row.photos) ? (row.photos as string[]) : [];
            list.forEach((src, i) =>
              photos.push({
                id: `${groups[gi]}-${String(row.id)}-${i}`,
                kind: "photo",
                source: groups[gi],
                name: String(row.name || row.sku || ""),
                sub: `${String(row.sku || "")} · ${currency(Number(row.price))}`,
                url: src,
                badge: groups[gi]
              })
            );
          });
        });
        const docs = await api.get<{ data: Doc[] }>(`/api/documents${buildQuery({ q: "media" })}`);
        const docItems: MediaItem[] = docs.data
          .filter((d) => d.type === "media")
          .map((d) => ({
            id: `doc-${d.id}`,
            kind: "document",
            source: "documents",
            name: d.name,
            sub: String(d.partyName || ""),
            url: d.url || "",
            badge: "Media"
          }));
        if (alive) setItems([...docItems, ...photos]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">Media library</p>
          <p className="text-xs text-ink-500">{items.length} assets · stone photography, certificates and renders</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">{Icons.media}</div>
          <h3 className="text-sm font-semibold text-ink-800">No media assets yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Open any diamond, gemstone, jewellery piece or product and attach photos — they will appear here automatically. Media documents live in Documents.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <Card key={m.id} className="group overflow-hidden">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-ink-50">
                {m.url ? (
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className="text-ink-300">{Icons.media}</span>
                )}
                <Badge label={m.badge} tone="gold" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink-900">{m.name}</p>
                <p className="truncate text-xs text-ink-500">{m.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
