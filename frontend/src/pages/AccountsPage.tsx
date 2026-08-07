import React, { useEffect, useState } from "react";
import { api, currency, fmtDate } from "../api";
import { Badge, Card, Spinner, statusTone, humanize } from "../components/ui";
import { Icons } from "../nav";

interface AccountsData {
  summary: {
    receivables: number;
    payables: number;
    cashIn: number;
    expensesTotal: number;
    netPosition: number;
    outstandingCustomerBalance: number;
  };
  byCategory: Array<{ category: string; amount: number }>;
  cashflow: Array<{ month: string; inflow: number; outflow: number }>;
}

export default function AccountsPage() {
  const [data, setData] = useState<AccountsData | null>(null);

  useEffect(() => {
    api.get<AccountsData>("/api/reports/accounts").then(setData).catch(() => undefined);
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const maxFlow = Math.max(...data.cashflow.map((c) => Math.max(c.inflow, c.outflow)), 1);
  const maxCat = Math.max(...data.byCategory.map((c) => c.amount), 1);

  const cards = [
    { label: "Cash received", value: currency(data.summary.cashIn), icon: Icons.card, tone: "green" },
    { label: "Outgoing spend", value: currency(data.summary.expensesTotal), icon: Icons.expense, tone: "red" },
    { label: "Net position", value: currency(data.summary.netPosition), icon: Icons.accounts, tone: "gold" },
    { label: "Receivables", value: currency(data.summary.receivables), icon: Icons.invoice, tone: "blue" },
    { label: "Payables", value: currency(data.summary.payables), icon: Icons.supplier, tone: "amber" },
    { label: "Client balances", value: currency(data.summary.outstandingCustomerBalance), icon: Icons.users, tone: "ink" }
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{c.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-ink-950">{c.value}</p>
            <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">{c.icon}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-ink-800">Cash flow — last 6 months</p>
          <div className="space-y-3">
            {data.cashflow.map((c) => {
              const monthLabel = new Date(`${c.month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
              return (
                <div key={c.month}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-600">{monthLabel}</span>
                    <span className="text-ink-400">in {currency(c.inflow)} · out {currency(c.outflow)}</span>
                  </div>
                  <div className="flex gap-px">
                    <div className="h-2.5 rounded-l bg-emerald-500" style={{ width: `${(c.inflow / maxFlow) * 100}%` }} />
                    <div className="h-2.5 rounded-r bg-red-400" style={{ width: `${(c.outflow / maxFlow) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-ink-800">Spend by category</p>
          <div className="space-y-3">
            {data.byCategory.length === 0 && <p className="text-sm text-ink-400">No expenses recorded.</p>}
            {data.byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-600">{c.category}</span>
                  <span className="text-ink-500">{currency(c.amount)}</span>
                </div>
                <div className="h-2.5 rounded bg-ink-100">
                  <div className="h-full rounded bg-gold-500" style={{ width: `${(c.amount / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <p className="text-sm font-semibold text-ink-800">Payables & receivables summary</p>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-ink-50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Supplier payables</p>
            <p className="font-display text-2xl font-semibold text-ink-950">{currency(data.summary.payables)}</p>
            <p className="mt-1 text-xs text-ink-500">Open purchase commitments owed to vendors.</p>
          </div>
          <div className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Client receivables</p>
            <p className="font-display text-2xl font-semibold text-ink-950">{currency(data.summary.receivables)}</p>
            <p className="mt-1 text-xs text-ink-500">Outstanding invoice balances from clients.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
