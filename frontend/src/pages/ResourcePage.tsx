import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { api, buildQuery, currency, fmtDate } from "../api";
import type { ListResult } from "../api";
import { DataTable } from "../components/DataTable";
import { Badge, Button, Field, Input, Modal, Select, Textarea, statusTone, humanize, cn, Spinner, IconButton } from "../components/ui";
import { getResourceConfig, type FieldSpec } from "./resourceConfig";
import type { AppContext } from "../components/Layout";
import type { ResourceName } from "../types";

interface Props {
  resource: ResourceName;
  detail?: boolean;
}

export default function ResourcePage({ resource, detail }: Props) {
  const config = getResourceConfig(resource);
  const navigate = useNavigate();
  const { id } = useParams();
  const { show } = useOutletContext<AppContext>();

  if (detail) {
    return <DetailView key={`${resource}-${id}`} resource={resource} config={config} show={show} onBack={() => navigate(resourcePath(resource))} />;
  }

  return <ListView resource={resource} config={config} show={show} />;
}

function resourcePath(resource: ResourceName) {
  const map: Record<string, string> = {
    diamonds: "/inventory/diamonds",
    gemstones: "/inventory/gemstones",
    jewellery: "/inventory/jewellery",
    products: "/inventory/products",
    customers: "/crm/customers",
    leads: "/crm/leads",
    suppliers: "/crm/suppliers",
    invoices: "/sales/invoices",
    payments: "/sales/payments",
    memos: "/sales/memos",
    returns: "/sales/returns",
    expenses: "/sales/expenses",
    tasks: "/tasks",
    messages: "/messages",
    documents: "/documents"
  };
  return map[resource] || "/";
}

function DetailView({ resource, config, show, onBack }: { resource: ResourceName; config: ReturnType<typeof getResourceConfig>; show: (m: string, t?: "ok" | "err") => void; onBack: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const me = JSON.parse(localStorage.getItem("cd_erp_user") || "null");
  const canWrite = (["admin", "manager", "sales", "inventory"].includes(me?.role) && resource !== "users") || me?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, unknown>>(`/api/${resource}/${id}`);
      setRow(res);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to load", "err");
    } finally {
      setLoading(false);
    }
  }, [resource, id, show]);

  useEffect(() => {
    load();
    if (resource === "leads") {
      api.get<ListResult<{ id: string; name: string }>>("/api/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined);
    }
  }, [load, resource]);

  const uploadPhoto = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const photos = Array.isArray(row?.photos) ? [...(row!.photos as string[])] : [];
      photos.push(String(reader.result));
      try {
        const updated = await api.put<Record<string, unknown>>(`/api/${resource}/${id}`, { ...row, photos });
        setRow(updated);
        show("Photo attached");
      } catch (e) {
        show(e instanceof Error ? e.message : "Upload failed", "err");
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (idx: number) => {
    const photos = Array.isArray(row?.photos) ? [...(row!.photos as string[])] : [];
    photos.splice(idx, 1);
    const updated = await api.put<Record<string, unknown>>(`/api/${resource}/${id}`, { ...row, photos });
    setRow(updated);
    show("Photo removed");
  };

  const doDelete = async () => {
    try {
      await api.del(`/api/${resource}/${id}`);
      show(`${config.singular} deleted`);
      onBack();
    } catch (e) {
      show(e instanceof Error ? e.message : "Delete failed", "err");
    }
  };

  if (loading || !row) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const photoList = Array.isArray(row.photos) ? (row.photos as string[]) : [];
  const showPhotos = ["diamonds", "gemstones", "jewellery"].includes(resource);
  const mainTitle = String(row.number || row.name || row.sku || row.id);
  const subtitleParts: string[] = [];
  if (row.sku) subtitleParts.push(String(row.sku));
  if (row.customerName) subtitleParts.push(String(row.customerName));
  if (row.supplierName) subtitleParts.push(String(row.supplierName));
  if (row.status) subtitleParts.push(String(row.status));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconButton title="Back" onClick={onBack}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </IconButton>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">{mainTitle}</h2>
            <p className="text-xs text-ink-500">{subtitleParts.join(" · ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {row.status ? <Badge label={humanize(String(row.status))} tone={statusTone(String(row.status))} /> : null}
          {canWrite && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {showPhotos && (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-800">Attachments</p>
            {canWrite && (
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
              </label>
            )}
          </div>
          {photoList.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-400">No photos attached yet. Upload GIA certificates, stone images or design renders.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photoList.map((src, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl ring-1 ring-ink-100">
                  <img src={src} alt={`attachment ${idx + 1}`} className="h-32 w-full object-cover" />
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute right-1.5 top-1.5 rounded-lg bg-ink-950/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
        <p className="mb-4 text-sm font-semibold text-ink-800">Record details</p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(row)
            .filter(([k]) => !["id", "photos", "items", "notes", "createdAt"].includes(k))
            .map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{humanize(k)}</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{renderValue(v)}</p>
              </div>
            ))}
        </div>
        {row.notes ? (
          <div className="mt-4 rounded-xl bg-ivory p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Notes</p>
            <p className="mt-1 text-sm text-ink-800">{String(row.notes)}</p>
          </div>
        ) : null}
        {row.items && Array.isArray(row.items) ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Line items</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-50">
                {(row.items as Array<Record<string, unknown>>).map((it, i) => (
                  <tr key={i}>
                    <td className="py-2 text-ink-800">{String(it.name)}</td>
                    <td className="py-2 text-right text-ink-500">{String(it.qty)} ×</td>
                    <td className="py-2 text-right font-medium text-ink-900">{currency(Number(it.unitPrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {row.createdAt ? <p className="mt-4 text-xs text-ink-400">Created {fmtDate(String(row.createdAt))}</p> : null}
      </div>

      {editing && (
        <EditModal
          resource={resource}
          config={config}
          initial={row}
          users={users}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setRow(updated);
            setEditing(false);
            show(`${config.singular} updated`);
          }}
        />
      )}

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(false)} title="Delete record">
          <p className="text-sm text-ink-700">
            Are you sure you want to delete <span className="font-semibold text-ink-950">{mainTitle}</span>? This action cannot be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function renderValue(v: unknown) {
  if (v == null || v === "") return <span className="text-ink-400">—</span>;
  if (typeof v === "number") return currency(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function ListView({ resource, config, show }: { resource: ResourceName; config: ReturnType<typeof getResourceConfig>; show: (m: string, t?: "ok" | "err") => void }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Array<Record<string, unknown> & { id: string }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const me = JSON.parse(localStorage.getItem("cd_erp_user") || "null");
  const canWrite = (["admin", "manager", "sales", "inventory"].includes(me?.role) && resource !== "users") || me?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize, q: search };
      if (sortKey) {
        params.sort = sortKey;
        params.dir = sortDir;
      }
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const res = await api.get<ListResult<Record<string, unknown> & { id: string }>>(`/api/${resource}${buildQuery(params)}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to load", "err");
    } finally {
      setLoading(false);
    }
  }, [resource, page, pageSize, search, filters, sortKey, sortDir, show]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (resource === "leads") {
      api.get<ListResult<{ id: string; name: string }>>("/api/users?pageSize=100").then((r) => setUsers(r.data)).catch(() => undefined);
    }
  }, [resource]);

  const exportCsv = () => {
    const params: Record<string, string | number> = { exportAll: "1", q: search };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    const url = `/api/${resource}${buildQuery(params)}`;
    window.open(url, "_blank");
  };

  const base = resourcePath(resource);

  const onSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">{config.title}</p>
          <p className="text-xs text-ink-500">{total} {total === 1 ? "record" : "records"} · {config.subtitle}</p>
        </div>
        {canWrite && (
          <Button onClick={() => setModalOpen(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New {config.singular}
          </Button>
        )}
      </div>

      <DataTable
        columns={config.columns}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onSort={onSort}
        sortKey={sortKey}
        sortDir={sortDir}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={config.searchPlaceholder}
        onRowClick={(row) => navigate(`${base}/${row.id}`)}
        loading={loading}
        emptyTitle={`No ${config.title.toLowerCase()} found`}
        emptyDetail="Try adjusting your search or filters."
        filters={config.filters.map((f) => (
          <select
            key={f.name}
            value={filters[f.name] || ""}
            onChange={(e) => {
              setFilters({ ...filters, [f.name]: e.target.value });
              setPage(1);
            }}
            className={cn("rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none", "appearance-none pr-8")}
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {humanize(o)}
              </option>
            ))}
          </select>
        ))}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv} title="Export filtered results to CSV">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
        }
      />

      {modalOpen && (
        <EditModal
          resource={resource}
          config={config}
          initial={null}
          users={users}
          onClose={() => setModalOpen(false)}
          onSaved={(row) => {
            setModalOpen(false);
            show(`${config.singular} created`);
            setPage(1);
            load();
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  resource,
  config,
  initial,
  users,
  onClose,
  onSaved
}: {
  resource: ResourceName;
  config: ReturnType<typeof getResourceConfig>;
  initial: Record<string, unknown> | null;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSaved: (row: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (initial) return { ...initial };
    const base: Record<string, unknown> = {};
    if (resource === "diamonds" || resource === "gemstones") {
      base.quantity = 1;
      base.status = "in-stock";
    }
    if (resource === "jewellery") {
      base.quantity = 1;
      base.status = "in-stock";
    }
    if (resource === "customers") {
      base.status = "active";
      base.segment = "retail";
      base.tier = "Standard";
      base.tags = [];
    }
    if (resource === "leads") {
      base.status = "new";
    }
    if (resource === "invoices") {
      base.status = "issued";
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const { show } = useOutletContext<AppContext>();

  const set = (name: string, value: unknown) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (payload.tags && Array.isArray(payload.tags) === false && typeof payload.tags === "string") {
        payload.tags = String(payload.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      if (resource === "diamonds" || resource === "gemstones") {
        const carat = Number(payload.carat) || 0;
        const ppc = Number(payload.pricePerCarat) || 0;
        payload.price = Math.round(carat * ppc);
      }
      const row = initial ? await api.put<Record<string, unknown>>(`/api/${resource}/${initial.id}`, payload) : await api.post<Record<string, unknown>>(`/api/${resource}`, payload);
      onSaved(row);
    } catch (e) {
      show(e instanceof Error ? e.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  };

  const enriched = config.fields.map((f: FieldSpec) => {
    if (f.name === "owner") {
      return { ...f, options: users.map((u) => u.name) };
    }
    return f;
  });

  return (
    <Modal open onClose={onClose} title={initial ? `Edit ${config.singular}` : `New ${config.singular}`} width="max-w-3xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {enriched.map((f) => (
          <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
            <Field label={f.label} required={f.required} hint={f.hint}>
              {f.type === "textarea" ? (
                <Textarea value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <Select value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {humanize(o)}
                    </option>
                  ))}
                </Select>
              ) : f.type === "number" ? (
                <Input type="number" value={form[f.name] != null ? Number(form[f.name]) : ""} onChange={(e) => set(f.name, e.target.value === "" ? null : Number(e.target.value))} placeholder={f.placeholder} />
              ) : f.type === "date" ? (
                <Input type="date" value={form[f.name] ? String(form[f.name]).slice(0, 10) : ""} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "tags" ? (
                <Input value={Array.isArray(form[f.name]) ? (form[f.name] as string[]).join(", ") : String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder="e.g. private, high-value" />
              ) : f.type === "email" ? (
                <Input type="email" value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              ) : (
                <Input value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              )}
            </Field>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}
          {initial ? "Save changes" : "Create"}
        </Button>
      </div>
    </Modal>
  );
}
