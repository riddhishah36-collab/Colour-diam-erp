import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, buildQuery, type ListResult } from "../api";
import type { User } from "../types";
import { DataTable } from "../components/DataTable";
import { Avatar, Badge, Button, Field, Input, Modal, Select, Spinner } from "../components/ui";
import type { AppContext } from "../components/Layout";
import { humanize } from "../components/ui";

const ROLES = ["admin", "manager", "sales", "inventory", "viewer"];
const ROLE_HELP: Record<string, string> = {
  admin: "Full access, including users, roles and settings",
  manager: "Everything except user and settings administration",
  sales: "Customers, leads, quotes, orders, invoicing and payments",
  inventory: "Inventory, suppliers and purchase orders",
  viewer: "Read-only access to most modules"
};

export default function UsersPage() {
  const { show } = useOutletContext<AppContext>();
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const me: User | null = JSON.parse(localStorage.getItem("cd_erp_user") || "null");
  const isAdmin = me?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize, q: search };
      if (role) params.role = role;
      const res = await api.get<ListResult<User>>(`/api/users${buildQuery(params)}`);
      setRows(res.data);
      setTotal(res.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, role]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (u: User) => {
    try {
      await api.put(`/api/users/${u.id}`, { ...u, active: !u.active });
      show(`${u.name} ${u.active ? "deactivated" : "activated"}`);
      load();
    } catch (e) {
      show(e instanceof Error ? e.message : "Update failed", "err");
    }
  };

  const columns = [
    {
      key: "name",
      header: "User",
      render: (u: User) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">{u.name}</p>
            <p className="truncate text-xs text-ink-500">{u.title}</p>
          </div>
        </div>
      )
    },
    { key: "email", header: "Email", hideOnMobile: true, render: (u: User) => u.email },
    { key: "role", header: "Role", render: (u: User) => <Badge label={u.role} tone={u.role === "admin" ? "purple" : u.role === "manager" ? "gold" : "blue"} /> },
    { key: "active", header: "Status", render: (u: User) => (u.active ? <Badge label="Active" tone="green" /> : <Badge label="Inactive" tone="gray" />) },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (u: User) =>
        isAdmin && (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setEditing(u); setModalOpen(true); }}>
              Edit
            </Button>
            <Button variant={u.active ? "danger" : "secondary"} size="sm" onClick={() => toggleActive(u)}>
              {u.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        )
    }
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">Team members</p>
          <p className="text-xs text-ink-500">{total} users · roles control what each person can see and do</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Invite user
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(role === r ? "" : r)}
            className={`rounded-2xl bg-white p-4 text-left ring-1 transition-all ${role === r ? "ring-2 ring-gold-500" : "ring-ink-100 hover:ring-ink-200"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-900">{humanize(r)}</span>
              <span className="text-xs text-ink-400">{rows.filter((u) => u.role === r).length}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{ROLE_HELP[r]}</p>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(s) => { setPageSize(s); setPage(1); }}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search users…"
        loading={loading}
        emptyTitle="No users found"
        emptyDetail="Invite a new team member to get started."
      />

      {modalOpen && (
        <UserModal
          user={editing}
          onClose={() => setModalOpen(false)}
          onDone={() => {
            setModalOpen(false);
            show(editing ? "User updated" : "User created");
            load();
          }}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onDone }: { user: User | null; onClose: () => void; onDone: () => void }) {
  const { show } = useOutletContext<AppContext>();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<User["role"]>(user?.role || "sales");
  const [title, setTitle] = useState(user?.title || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (user) {
        await api.put(`/api/users/${user.id}`, { name, email, role, title, phone });
      } else {
        await api.post("/api/users", { name, email, role, title, phone, active: true });
      }
      onDone();
    } catch (e) {
      show(e instanceof Error ? e.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={user ? "Edit user" : "Invite user"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" />
          </Field>
          <Field label="Job title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sales Director" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@colourdiam.com" />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 79 000 00 00" />
          </Field>
        </div>
        <Field label="Role" required>
          <Select value={role} onChange={(e) => setRole(e.target.value as User["role"])}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {humanize(r)} — {ROLE_HELP[r]}
              </option>
            ))}
          </Select>
        </Field>
        <p className="rounded-xl bg-ivory px-3 py-2.5 text-xs leading-relaxed text-ink-600">
          Demo sign-in password is <code className="rounded bg-ink-100 px-1 font-mono">demo-pass</code>. Users sign in with their Colour Diam email address.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}{user ? "Save changes" : "Create user"}</Button>
        </div>
      </div>
    </Modal>
  );
}
