import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Badge, Card, Spinner } from "../components/ui";
import { Icons } from "../nav";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "available";
  type: string;
}

export default function IntegrationsPage() {
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>>("/api/meta").then(setMeta).catch(() => undefined);
  }, []);

  const save = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.post("/api/meta", body);
      const res = await api.get<Record<string, unknown>>("/api/meta");
      setMeta(res);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const integrations: Integration[] = [
    { id: "api", name: "Colour Diam REST API", description: "Full read/write access to all ERP modules via bearer token.", category: "Developer", status: "connected", type: "api" },
    { id: "csv", name: "CSV Export", description: "Filtered, permission-aware exports from every list view.", category: "Workflow", status: "connected", type: "csv" },
    { id: "email", name: "Email", description: "Templates and outbound message logging (draft placeholder).", category: "Engagement", status: "available", type: "email" },
    { id: "whatsapp", name: "WhatsApp Business", description: "Two-way client messaging (draft placeholder).", category: "Engagement", status: "available", type: "whatsapp" },
    { id: "ledger", name: "Accounting Ledger", description: "Sync receivables and payables to an external ledger (draft placeholder).", category: "Finance", status: "available", type: "ledger" },
    { id: "gallery", name: "GIA / Lab Portal", description: "Automated certificate lookups by number (draft placeholder).", category: "Inventory", status: "available", type: "gallery" }
  ];

  const apiKey = meta?.apiKey ? String(meta.apiKey) : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">API & Integrations</p>
          <p className="text-xs text-ink-500">Connected services, API access and developer keys</p>
        </div>
        {saving && <Spinner />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((it) => (
          <Card key={it.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600">{Icons.integration}</div>
              <Badge label={it.status === "connected" ? "Connected" : "Available"} tone={it.status === "connected" ? "green" : "gray"} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink-900">{it.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{it.description}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{it.category}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="text-sm font-semibold text-ink-800">API key</p>
        <p className="mt-1 text-xs text-ink-500">Authenticate with <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[11px] text-ink-700">Authorization: Bearer &lt;token&gt;</code>. The demo key is regenerated on reset and never stored in the browser.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-ink-950 px-3 py-2 font-mono text-xs text-gold-200">
            {apiKey ? apiKey : "demo-pass-token"}
          </code>
          <button
            type="button"
            onClick={() => save({ apiKey: `cd_demo_${Math.random().toString(36).slice(2, 10)}` })}
            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
          >
            Regenerate
          </button>
        </div>
      </Card>
    </div>
  );
}
