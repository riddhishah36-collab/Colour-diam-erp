import React, { useEffect, useState } from "react";
import { initials } from "../api";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ label, tone = "gray" }: { label: string; tone?: string }) {
  const tones: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
    purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
    gray: "bg-stone-100 text-stone-600 ring-stone-500/20",
    gold: "bg-gold-100 text-gold-800 ring-gold-600/30"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", tones[tone] || tones.gray)}>
      {label}
    </span>
  );
}

export function statusTone(status: string): string {
  const map: Record<string, string> = {
    "in-stock": "green",
    active: "green",
    paid: "green",
    delivered: "green",
    converted: "green",
    received: "green",
    won: "green",
    approved: "gold",
    sent: "blue",
    shipped: "blue",
    "on-consignment": "blue",
    ordered: "blue",
    partial: "amber",
    reserved: "amber",
    negotiation: "amber",
    pending: "purple",
    "in-production": "purple",
    qualified: "purple",
    proposed: "purple",
    draft: "gray",
    expired: "gray",
    inactive: "gray",
    new: "gray",
    sold: "gray",
    cancelled: "red",
    overdue: "red",
    unpaid: "red",
    lost: "red",
    contacted: "blue",
    proposal: "purple",
    "out-standing": "amber",
    "partial-return": "amber",
    returned: "green",
    inspected: "blue",
    resolved: "green",
    rejected: "red",
    recorded: "gray",
    todo: "gray",
    done: "green",
    read: "gray",
    unread: "amber"
  };
  return map[status] || "gray";
}

export function humanize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  className,
  title
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-gold-600 text-white hover:bg-gold-700 shadow-sm",
    secondary: "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50",
    ghost: "text-ink-600 hover:bg-ink-100/70",
    danger: "bg-red-600 text-white hover:bg-red-700",
    dark: "bg-ink-950 text-gold-100 hover:bg-ink-800"
  };
  const sizes: Record<string, string> = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm"
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  title,
  tone = "default"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 transition-colors",
        tone === "danger" && "hover:text-red-600"
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white ring-1 ring-ink-100 shadow-sm", className)}>{children}</div>;
}

export function Field({
  label,
  children,
  hint,
  required
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-600">
        {label}
        {required && <span className="text-gold-600"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-2 focus:ring-gold-400 outline-none transition-shadow";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236a5d4c%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "min-h-20 resize-y", props.className)} />;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "pl-9")}
      />
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-14 w-14 text-base" };
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-ink-950 font-semibold text-gold-200 ring-2 ring-white", sizes[size])}>
      {initials(name)}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl"
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          width
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-ink-950">{title}</h2>
          <IconButton title="Close" onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        <div className="scrollbar-thin overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, detail, icon }: { title: string; detail?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        {icon || (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M12 3.75v16.5" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      {detail && <p className="mt-1 max-w-sm text-sm text-ink-500">{detail}</p>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-gold-600", className)} />
  );
}

export function Loader({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-full bg-ink-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "gold"
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "gold" | "ink" | "green" | "blue" | "red";
}) {
  const tones: Record<string, string> = {
    gold: "bg-gold-100 text-gold-700",
    ink: "bg-ink-100 text-ink-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    red: "bg-red-100 text-red-700"
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-2 font-display text-[1.7rem] font-semibold leading-tight text-ink-950">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-500">{sub}</p>}
        </div>
        {icon && <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>{icon}</div>}
      </div>
    </Card>
  );
}

export function Toast({ toast }: { toast: { id: number; message: string; tone?: "ok" | "err" } | null }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl",
          toast.tone === "err" ? "bg-red-600" : "bg-ink-950"
        )}
      >
        <span className="text-gold-300">{toast.tone === "err" ? "!" : "✓"}</span>
        {toast.message}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ id: number; message: string; tone?: "ok" | "err" } | null>(null);
  const show = (message: string, tone: "ok" | "err" = "ok") => {
    setToast({ id: Date.now(), message, tone });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return { toast, show };
}

export function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
      <p className="text-xs text-ink-500">
        Showing <span className="font-medium text-ink-800">{total === 0 ? 0 : from}</span>–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-lg border-0 bg-white px-2 py-1 text-xs text-ink-600 ring-1 ring-ink-200 outline-none"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="rounded-lg p-1.5 text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-2 text-xs font-medium text-ink-700">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="rounded-lg p-1.5 text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
