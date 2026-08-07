import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useOutletContext } from "react-router-dom";
import { api, buildQuery, currency, currencyFull, fmtDate } from "../api";
import type { ListResult } from "../api";
import { DataTable } from "../components/DataTable";
import { Badge, Button, Card, Field, IconButton, Input, Modal, Select, Spinner, Textarea, statusTone, humanize, cn } from "../components/ui";
import type { AppContext } from "../components/Layout";
import type { LineItem, Order, Quote, PurchaseOrder } from "../types";

interface Props {
  detail?: boolean;
}

type DocType = "quotes" | "orders" | "purchaseOrders";

type Doc = Order & Partial<Quote> & Partial<PurchaseOrder> & { paidAmount?: number };

interface ItemOption {
  id: string;
  label: string;
  price: number;
}

export default function OrdersPage({ detail }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const resource: DocType = location.pathname.includes("/purchasing/")
    ? "purchaseOrders"
    : location.pathname.includes("/quotes")
      ? "quotes"
      : "orders";

  if (detail) {
    return <DocDetail key={`${resource}-${id}`} resource={resource} onBack={() => navigate(pathFor(resource))} />;
  }

  return <DocList resource={resource} />;
}

function pathFor(resource: DocType) {
  if (resource === "quotes") return "/sales/quotes";
  if (resource === "purchaseOrders") return "/purchasing/orders";
  return "/sales/orders";
}

function labelFor(resource: DocType) {
  if (resource === "quotes") return { title: "Quotes", subtitle: "Proposals and offers to clients", singular: "quote" };
  if (resource === "purchaseOrders") return { title: "Purchase Orders", subtitle: "Procurement and receiving", singular: "purchase order" };
  return { title: "Sales Orders", subtitle: "Confirmed client orders", singular: "sales order" };
}

function statusOptions(resource: DocType) {
  if (resource === "quotes") return ["draft", "sent", "approved", "negotiation", "converted", "expired"];
  if (resource === "purchaseOrders") return ["draft", "approved", "ordered", "received", "cancelled"];
  return ["draft", "approved", "in-production", "shipped", "delivered", "cancelled"];
}

function DocList({ resource }: { resource: DocType }) {
  const navigate = useNavigate();
  const { show } = useOutletContext<AppContext>();
  const meta = labelFor(resource);
  const [rows, setRows] = useState<Array<Record<string, unknown> & { id: string }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize, q: search, sort: "date", dir: "desc" };
      if (status) params.status = status;
      const res = await api.get<ListResult<Record<string, unknown> & { id: string }>>(`/api/${resource}${buildQuery(params)}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to load", "err");
    } finally {
      setLoading(false);
    }
  }, [resource, page, pageSize, search, status, show]);

  useEffect(() => {
    load();
  }, [load]);

  const me = JSON.parse(localStorage.getItem("cd_erp_user") || "null");
  const canWrite = ["admin", "manager", "sales"].includes(me?.role) || (resource === "purchaseOrders" && me?.role === "inventory");

  const exportCsv = () => {
    const params: Record<string, string | number> = { exportAll: "1", q: search };
    if (status) params.status = status;
    window.open(`/api/${resource}${buildQuery(params)}`, "_blank");
  };

  const columns = [
    { key: "number", header: "Number", render: (r: Record<string, unknown>) => <span className="font-medium text-ink-900">{String(r.number)}</span> },
    { key: "party", header: resource === "purchaseOrders" ? "Supplier" : "Customer", render: (r: Record<string, unknown>) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{String(r.supplierName || r.customerName || "—")}</p>
        </div>
      ) },
    { key: "date", header: "Date", hideOnMobile: true, render: (r: Record<string, unknown>) => <span className="text-xs">{fmtDate(String(r.date || ""))}</span> },
    { key: "expectedDate", header: resource === "purchaseOrders" ? "Expected" : "Expected / Due", hideOnMobile: true, render: (r: Record<string, unknown>) => <span className="text-xs">{r.expectedDate || r.validUntil ? fmtDate(String(r.expectedDate || r.validUntil)) : "—"}</span> },
    { key: "total", header: "Total", align: "right", render: (r: Record<string, unknown>) => <span className="font-semibold text-ink-950">{currency(Number(r.total))}</span> },
    ...(resource === "orders"
      ? [{ key: "paymentStatus", header: "Payment", render: (r: Record<string, unknown>) => <Badge label={humanize(String(r.paymentStatus))} tone={statusTone(String(r.paymentStatus))} /> }]
      : []),
    { key: "status", header: "Status", render: (r: Record<string, unknown>) => <Badge label={humanize(String(r.status))} tone={statusTone(String(r.status))} /> }
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">{meta.title}</p>
          <p className="text-xs text-ink-500">{total} records · {meta.subtitle}</p>
        </div>
        {canWrite && (
          <Button onClick={() => setModalOpen(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New {meta.singular}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns as never}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={`Search ${meta.title.toLowerCase()} by number, customer…`}
        onRowClick={(row) => navigate(`${pathFor(resource)}/${row.id}`)}
        loading={loading}
        emptyTitle={`No ${meta.title.toLowerCase()} found`}
        emptyDetail="Try adjusting your search or filters."
        filters={
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={cn("rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none", "appearance-none pr-8")}
          >
            <option value="">All statuses</option>
            {statusOptions(resource).map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        }
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
        }
      />

      {modalOpen && (
        <DocEditor
          resource={resource}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setPage(1);
            load();
          }}
        />
      )}
    </div>
  );
}

function DocDetail({ resource, onBack }: { resource: DocType; onBack: () => void }) {
  const { id } = useParams();
  const { show } = useOutletContext<AppContext>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [issueInv, setIssueInv] = useState(false);

  const meta = labelFor(resource);
  const me = JSON.parse(localStorage.getItem("cd_erp_user") || "null");
  const canWrite = ["admin", "manager", "sales"].includes(me?.role) || (resource === "purchaseOrders" && me?.role === "inventory");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Doc>(`/api/${resource}/${id}`);
      setDoc(res);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to load", "err");
    } finally {
      setLoading(false);
    }
  }, [resource, id, show]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status: string) => {
    try {
      const updated = await api.put<Doc>(`/api/${resource}/${id}`, { ...doc, status });
      setDoc(updated);
      show(`Status updated to ${humanize(status)}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Update failed", "err");
    }
  };

  const changePaymentStatus = async (paymentStatus: string) => {
    try {
      const updated = await api.put<Doc>(`/api/${resource}/${id}`, { ...doc, paymentStatus });
      setDoc(updated);
      show(`Payment status updated`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Update failed", "err");
    }
  };

  const doDelete = async () => {
    try {
      await api.del(`/api/${resource}/${id}`);
      show(`${meta.singular} deleted`);
      onBack();
    } catch (e) {
      show(e instanceof Error ? e.message : "Delete failed", "err");
    }
  };

  const convert = async () => {
    try {
      await api.post(`/api/quotes/${id}/convert`);
      show("Quote converted to sales order and invoice");
      load();
    } catch (e) {
      show(e instanceof Error ? e.message : "Conversion failed", "err");
    }
  };

  if (loading || !doc) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const isQuote = resource === "quotes";
  const isOrder = resource === "orders";
  const isPo = resource === "purchaseOrders";
  const partyName = isPo ? doc.supplierName : doc.customerName;
  const totals = { subtotal: doc.subtotal, discount: doc.discount || 0, tax: doc.tax || 0, total: doc.total };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconButton title="Back" onClick={onBack}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </IconButton>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">{doc.number}</h2>
            <p className="text-xs text-ink-500">
              {partyName} · {fmtDate(doc.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={humanize(doc.status)} tone={statusTone(doc.status)} />
          {isOrder && <Badge label={humanize(doc.paymentStatus)} tone={statusTone(doc.paymentStatus)} />}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-ink-100 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Party</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink-950">{partyName}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-right">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Date</p>
                <p className="mt-1 text-sm font-medium text-ink-800">{fmtDate(doc.date)}</p>
              </div>
              {isQuote && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Valid until</p>
                  <p className="mt-1 text-sm font-medium text-ink-800">{doc.validUntil ? fmtDate(String(doc.validUntil)) : "—"}</p>
                </div>
              )}
              {(isOrder || isPo) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{isPo ? "Expected" : "Expected delivery"}</p>
                  <p className="mt-1 text-sm font-medium text-ink-800">{doc.expectedDate ? fmtDate(String(doc.expectedDate)) : "—"}</p>
                </div>
              )}
              {isOrder && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Payment method</p>
                  <p className="mt-1 text-sm font-medium text-ink-800">{doc.paymentMethod || "—"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-ivory/80">
            <tr>
              <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Item</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Qty</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Unit price</th>
              <th className="px-6 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {doc.items.map((it, i) => (
              <tr key={i}>
                <td className="px-6 py-3 text-ink-800">{it.name}</td>
                <td className="px-4 py-3 text-right text-ink-500">{it.qty}</td>
                <td className="px-4 py-3 text-right text-ink-600">{currencyFull(it.unitPrice)}</td>
                <td className="px-6 py-3 text-right font-medium text-ink-900">{currency(it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-ink-100 bg-ivory/50 px-6 py-4">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{currency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Discount</span>
                <span className="text-emerald-700">−{currency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-600">
              <span>Tax</span>
              <span>{currency(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-semibold text-ink-950">
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
            {isOrder && (
              <div className="flex justify-between pt-1 text-xs">
                <span className="text-ink-500">Paid</span>
                <span className="font-medium text-emerald-700">{currency(doc.paidAmount || 0)}</span>
              </div>
            )}
          </div>
        </div>

        {doc.notes && (
          <div className="border-t border-ink-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Notes</p>
            <p className="mt-1 text-sm text-ink-700">{doc.notes}</p>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {canWrite && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit document
            </Button>
            {isQuote && doc.status !== "converted" && (
              <Button variant="dark" size="sm" onClick={convert}>
                Convert to order & invoice
              </Button>
            )}
            {isOrder && doc.status !== "cancelled" && (
              <Button variant="dark" size="sm" onClick={() => setIssueInv(true)}>
                Issue invoice
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </>
        )}
        <select
          value={doc.status}
          onChange={(e) => changeStatus(e.target.value)}
          className="ml-auto rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none"
        >
          {statusOptions(resource).map((s) => (
            <option key={s} value={s}>
              Status: {humanize(s)}
            </option>
          ))}
        </select>
        {isOrder && (
          <select
            value={doc.paymentStatus}
            onChange={(e) => changePaymentStatus(e.target.value)}
            className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none"
          >
            {["unpaid", "partial", "paid"].map((s) => (
              <option key={s} value={s}>
                Payment: {humanize(s)}
              </option>
            ))}
          </select>
        )}
      </div>

      {editing && (
        <DocEditor resource={resource} initial={doc} onClose={() => setEditing(false)} onSaved={(d) => { setDoc(d); setEditing(false); show(`${meta.singular} updated`); }} />
      )}

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(false)} title="Delete document">
          <p className="text-sm text-ink-700">
            Are you sure you want to delete <span className="font-semibold text-ink-950">{doc.number}</span>?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={doDelete}>Delete</Button>
          </div>
        </Modal>
      )}

      {issueInv && (
        <IssueInvoiceModal order={doc as Order} onClose={() => setIssueInv(false)} onDone={() => { setIssueInv(false); show("Invoice issued"); load(); }} />
      )}
    </div>
  );
}

function IssueInvoiceModal({ order, onClose, onDone }: { order: Order; onClose: () => void; onDone: () => void }) {
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const { show } = useOutletContext<AppContext>();
  const submit = async () => {
    setSaving(true);
    try {
      await api.post(`/api/orders/${order.id}/issue-invoice`, { dueDate });
      onDone();
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed", "err");
      setSaving(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Issue invoice">
      <p className="text-sm text-ink-700">
        Create an invoice for <span className="font-semibold">{order.number}</span> totalling <span className="font-semibold">{currency(order.total)}</span>.
      </p>
      <div className="mt-4">
        <Field label="Due date">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={saving}>{saving ? "Creating…" : "Issue invoice"}</Button>
      </div>
    </Modal>
  );
}

function DocEditor({ resource, initial, onClose, onSaved }: { resource: DocType; initial?: Doc | null; onClose: () => void; onSaved: (d: Doc) => void }) {
  const { show } = useOutletContext<AppContext>();
  const [partyOptions, setPartyOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [items, setItems] = useState<LineItem[]>(initial?.items || []);
  const [partyId, setPartyId] = useState(initial?.customerId || initial?.supplierId || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split("T")[0]);
  const [expectedDate, setExpectedDate] = useState(initial?.expectedDate || "");
  const [validUntil, setValidUntil] = useState(initial?.validUntil || "");
  const [discountPct, setDiscountPct] = useState(initial?.discountPct || 0);
  const [taxRate, setTaxRate] = useState(initial?.taxRate || 0);
  const [status, setStatus] = useState(initial?.status || (resource === "purchaseOrders" ? "draft" : "draft"));
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || "");
  const [paymentStatus, setPaymentStatus] = useState(initial?.paymentStatus || "unpaid");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [manual, setManual] = useState({ name: "", qty: 1, unitPrice: 0 });
  const [saving, setSaving] = useState(false);

  const isPo = resource === "purchaseOrders";

  useEffect(() => {
    const partyRes = isPo ? api.get<ListResult<{ id: string; name: string }>>("/api/suppliers?pageSize=200") : api.get<ListResult<{ id: string; name: string }>>("/api/customers?pageSize=200");
    partyRes.then((r) => setPartyOptions(r.data)).catch(() => undefined);
    Promise.all([
      api.get<ListResult<Record<string, unknown>>>("/api/diamonds?pageSize=200"),
      api.get<ListResult<Record<string, unknown>>>("/api/gemstones?pageSize=200"),
      api.get<ListResult<Record<string, unknown>>>("/api/jewellery?pageSize=200")
    ]).then(([d, g, j]) => {
      const map = (rows: Array<Record<string, unknown>>) =>
        rows.map((r) => ({ id: String(r.id), label: `${r.name} · ${String(r.sku || "")}`.trim(), price: Number(r.price || 0) }));
      setItemOptions([...map(d.data), ...map(g.data), ...map(j.data)]);
    }).catch(() => undefined);
  }, [isPo]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const discount = Math.round(subtotal * (Number(discountPct) / 100));
    const tax = Math.round((subtotal - discount) * (Number(taxRate) / 100));
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }, [items, discountPct, taxRate]);

  const addInventory = (id: string) => {
    const opt = itemOptions.find((o) => o.id === id);
    if (!opt) return;
    setItems((prev) => {
      const existing = prev.find((it) => it.inventoryId === opt.id);
      if (existing) return prev.map((it) => (it.inventoryId === opt.id ? { ...it, qty: it.qty + 1 } : it));
      return [...prev, { inventoryType: opt.label.includes("·") ? "item" : "item", inventoryId: opt.id, name: opt.label, qty: 1, unitPrice: opt.price }];
    });
  };

  const addManual = () => {
    if (!manual.name.trim()) return;
    setItems((prev) => [...prev, { inventoryType: "custom", inventoryId: null, name: manual.name.trim(), qty: Number(manual.qty) || 1, unitPrice: Number(manual.unitPrice) || 0 }]);
    setManual({ name: "", qty: 1, unitPrice: 0 });
  };

  const submit = async () => {
    if (!partyId) {
      show("Select a party", "err");
      return;
    }
    if (items.length === 0) {
      show("Add at least one line item", "err");
      return;
    }
    setSaving(true);
    try {
      const party = partyOptions.find((p) => p.id === partyId);
      const payload: Record<string, unknown> = {
        items,
        date,
        discountPct: Number(discountPct) || 0,
        taxRate: Number(taxRate) || 0,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        status,
        notes
      };
      if (isPo) {
        payload.supplierId = partyId;
        payload.supplierName = party?.name;
        payload.expectedDate = expectedDate || null;
      } else {
        payload.customerId = partyId;
        payload.customerName = party?.name;
        payload.expectedDate = expectedDate || null;
        payload.paymentMethod = paymentMethod;
        payload.paymentStatus = paymentStatus;
        if (resource === "quotes") payload.validUntil = validUntil || null;
      }
      if (initial) {
        const res = await api.put<Doc>(`/api/${resource}/${initial.id}`, payload);
        onSaved(res);
      } else {
        const res = await api.post<Doc>(`/api/${resource}`, payload);
        onSaved(res);
      }
    } catch (e) {
      show(e instanceof Error ? e.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={initial ? `Edit ${labelFor(resource).singular}` : `New ${labelFor(resource).singular}`} width="max-w-4xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={isPo ? "Supplier" : "Customer"} required>
            <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
              <option value="">Select…</option>
              {partyOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" required>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          {resource === "quotes" ? (
            <Field label="Valid until">
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </Field>
          ) : (
            <Field label={isPo ? "Expected date" : "Expected delivery"}>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </Field>
          )}
        </div>

        <div>
          <Field label="Add item from inventory">
            <div className="flex gap-2">
              <Select value="" onChange={(e) => e.target.value && addInventory(e.target.value)} className="flex-1">
                <option value="">Select a diamond, gemstone or jewellery piece…</option>
                {itemOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {currency(o.price)}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <Field label="Or add a custom line">
                <Input placeholder="e.g. Setting service, engraving…" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
              </Field>
            </div>
            <div className="w-20">
              <Field label="Qty">
                <Input type="number" value={manual.qty} onChange={(e) => setManual({ ...manual, qty: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="w-32">
              <Field label="Unit price">
                <Input type="number" value={manual.unitPrice} onChange={(e) => setManual({ ...manual, unitPrice: Number(e.target.value) })} />
              </Field>
            </div>
            <Button variant="secondary" size="md" onClick={addManual}>Add</Button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="overflow-hidden rounded-xl ring-1 ring-ink-200">
            <table className="w-full text-sm">
              <thead className="bg-ivory/80">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Item</th>
                  <th className="w-24 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Qty</th>
                  <th className="w-36 px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Unit price</th>
                  <th className="w-32 px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Amount</th>
                  <th className="w-12 px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-ink-800">{it.name}</td>
                    <td className="px-2 py-2 text-right">
                      <Input type="number" value={it.qty} className="w-16 py-1 text-right" onChange={(e) => setItems(items.map((x, xi) => (xi === i ? { ...x, qty: Number(e.target.value) || 0 } : x)))} />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Input type="number" value={it.unitPrice} className="w-28 py-1 text-right" onChange={(e) => setItems(items.map((x, xi) => (xi === i ? { ...x, unitPrice: Number(e.target.value) || 0 } : x)))} />
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-ink-900">{currency(it.qty * it.unitPrice)}</td>
                    <td className="px-2 py-2">
                      <IconButton tone="danger" title="Remove" onClick={() => setItems(items.filter((_, xi) => xi !== i))}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Discount %">
            <Input type="number" value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} />
          </Field>
          <Field label="Tax rate %">
            <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions(resource).map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </Select>
          </Field>
          {isPo ? (
            <Field label="Supplier note">
              <div className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500 ring-1 ring-ink-200">{notes ? "Saved in document notes" : "Use the notes field below"}</div>
            </Field>
          ) : resource === "quotes" ? (
            <Field label="Payment method">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">—</option>
                {["Wire Transfer", "Bank Transfer", "Card", "Cheque", "Crypto", "Trade-In"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Payment method">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">—</option>
                {["Wire Transfer", "Bank Transfer", "Card", "Cheque", "Crypto", "Trade-In"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>

        {resource === "orders" && (
          <Field label="Payment status">
            <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {["unpaid", "partial", "paid"].map((s) => (
                <option key={s} value={s}>{humanize(s)}</option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Terms, delivery instructions…" />
        </Field>

        <div className="flex justify-end border-t border-ink-100 pt-4">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{currency(totals.subtotal)}</span></div>
            <div className="flex justify-between text-ink-600"><span>Discount</span><span className="text-emerald-700">−{currency(totals.discount)}</span></div>
            <div className="flex justify-between text-ink-600"><span>Tax</span><span>{currency(totals.tax)}</span></div>
            <div className="flex justify-between border-t border-ink-200 pt-1.5 text-base font-semibold text-ink-950"><span>Total</span><span>{currency(totals.total)}</span></div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}{initial ? "Save changes" : "Create document"}</Button>
        </div>
      </div>
    </Modal>
  );
}
