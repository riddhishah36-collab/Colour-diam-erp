import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setSession, getStoredUser } from "../api";
import { Button, Input, Field } from "../components/ui";
import type { User } from "../types";

const DEMO_ACCOUNTS: Array<{ email: string; label: string }> = [
  { email: "valentina@colourdiam.com", label: "Admin" },
  { email: "daniel@colourdiam.com", label: "Manager" },
  { email: "amara@colourdiam.com", label: "Sales" },
  { email: "priya@colourdiam.com", label: "Inventory" },
  { email: "james@colourdiam.com", label: "Viewer" }
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("valentina@colourdiam.com");
  const [password, setPassword] = useState("demo-pass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getStoredUser()) navigate("/", { replace: true });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>("/api/auth/login", { email, password });
      setSession(res.token, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full">
      <div className="relative hidden flex-1 overflow-hidden bg-obsidian lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(193,154,91,0.28), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(60,45,20,0.5), transparent 60%)"
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-ink-950">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l3 5-9 13L3 8l3-5zM3 8h18M9 3l3 5 3-5" />
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold tracking-wide text-gold-100">Colour Diam</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Enterprise Suite</p>
            </div>
          </div>
          <div>
            <h2 className="max-w-md font-display text-4xl font-medium leading-tight text-gold-50">
              Natural fancy colour diamonds, gemstones and fine jewellery.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
              The complete ERP for Colour Diam — inventory, clients, sales, procurement and finance in one refined workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Inventory", "CRM", "Quotes", "Orders", "Invoicing", "Reports"].map((t) => (
                <span key={t} className="rounded-full border border-gold-500/30 px-3 py-1 text-xs text-gold-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} Colour Diam · www.colourdiam.com</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-ivory px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-3xl font-semibold text-ink-950">Colour Diam</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold-600">Enterprise Suite</p>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-950">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to your workspace.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Email address" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@colourdiam.com" required />
            </Field>
            <Field label="Password" required>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-ink-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">Demo access — password: demo-pass</p>
            <div className="mt-3 space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => setEmail(a.email)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink-700 hover:bg-gold-50"
                >
                  <span className="font-medium">{a.label}</span>
                  <span className="truncate pl-3 text-xs text-ink-400">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
