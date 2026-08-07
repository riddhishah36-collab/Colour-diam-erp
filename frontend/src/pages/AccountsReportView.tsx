import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { AccountsReport } from '../api';
import { api } from '../api';
import { money, toast } from '../components/ui';

function downloadReportCsv(report: AccountsReport) {
  const lines: string[] = [];
  const s = report.summary;
  lines.push('ColourDiam ERP - Accounts Report');
  lines.push('Generated,' + new Date(report.generatedAt).toLocaleString());
  lines.push('');
  lines.push('Summary');
  lines.push('Metric,Amount');
  lines.push(`Open receivables,${s.openReceivables}`);
  lines.push(`Total receivables,${s.totalReceivables}`);
  lines.push(`Open payables,${s.openPayables}`);
  lines.push(`Total payables,${s.totalPayables}`);
  lines.push(`Receipts to date,${s.receiptsTotal}`);
  lines.push(`Payments to date,${s.paymentsTotal}`);
  lines.push(`Net position,${s.netPosition}`);
  lines.push(`Total expenses,${s.expensesTotal}`);
  lines.push('');
  lines.push('Receivables aging');
  lines.push('Bucket,Amount');
  lines.push(`Current,${report.aging.current}`);
  lines.push(`1-30 days,${report.aging.d30}`);
  lines.push(`31-60 days,${report.aging.d60}`);
  lines.push(`60+ days,${report.aging.d90}`);
  lines.push('');
  lines.push('Open balances by party');
  lines.push('Party,Receivables,Payables,Open,Open Entries');
  for (const p of report.byParty) {
    lines.push(`${p.party},${p.receivables},${p.payables},${p.open},${p.openCount}`);
  }
  lines.push('');
  lines.push('Cash flow (receipts vs payments)');
  lines.push('Month,Receipts,Payments,Net');
  for (const c of report.cashflowSeries) {
    lines.push(`${c.month},${c.in},${c.out},${c.net}`);
  }
  lines.push('');
  lines.push('Expenses by category');
  for (const [cat, amt] of Object.entries(report.expenseByCategory)) {
    lines.push(`${cat},${amt}`);
  }
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accounts-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AccountsReportView({ report }: { report: AccountsReport | null }) {
  const [rep, setRep] = useState<AccountsReport | null>(report);

  useEffect(() => {
    setRep(report);
  }, [report]);

  useEffect(() => {
    if (!rep) {
      api.accountsReport().then(setRep).catch(() => toast.err('Failed to load report'));
    }
  }, [rep]);

  const summaryCards = useMemo(() => {
    if (!rep) return [];
    const s = rep.summary;
    return [
      { label: 'Open receivables', value: money(s.openReceivables), color: 'var(--green)', sub: `${s.totalReceivables ? money(s.totalReceivables) : '—'} total` },
      { label: 'Open payables', value: money(s.openPayables), color: 'var(--red)', sub: `${s.totalPayables ? money(s.totalPayables) : '—'} total` },
      { label: 'Net position', value: money(s.netPosition), color: s.netPosition >= 0 ? 'var(--blue)' : 'var(--red)', sub: 'Receipts minus payments' },
      { label: 'Total expenses', value: money(s.expensesTotal), color: 'var(--amber)', sub: 'Operating costs YTD' },
    ];
  }, [rep]);

  if (!rep) return <div className="empty-state">Loading report…</div>;

  const agingRows = [
    { label: 'Current', val: rep.aging.current, color: 'var(--green)' },
    { label: '1–30 days', val: rep.aging.d30, color: 'var(--amber)' },
    { label: '31–60 days', val: rep.aging.d60, color: 'var(--blue)' },
    { label: '60+ days', val: rep.aging.d90, color: 'var(--red)' },
  ];
  const agingTotal = agingRows.reduce((a, r) => a + r.val, 0);

  return (
    <>
      <div className="stats-row">
        {summaryCards.map((c) => (
          <div className="card" key={c.label} style={{ borderTopColor: c.color }}>
            <div className="stats-tile">
              <div className="num" style={{ color: c.color }}>{c.value}</div>
              <div className="lbl">{c.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-grid" style={{ marginBottom: 16 }}>
        <section className="card w-6" style={{ gridColumn: 'span 6' }}>
          <div className="card-head">
            <h3>Receivables aging</h3>
            <span className="sub">Outstanding by days past due</span>
            <button className="btn small ghost" style={{ marginLeft: 'auto' }} onClick={() => downloadReportCsv(rep)}>
              <Download size={13} /> CSV
            </button>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {agingRows.map((r) => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{r.label}</span>
                  <span style={{ color: 'var(--text-soft)' }}>{money(r.val)}</span>
                </div>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${agingTotal ? Math.max(2, (r.val / agingTotal) * 100) : 0}%`, background: r.color }} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, paddingTop: 6, borderTop: '1px solid var(--border)', fontWeight: 700 }}>
              <span>Total outstanding</span>
              <span>{money(agingTotal)}</span>
            </div>
          </div>
        </section>

        <section className="card w-6" style={{ gridColumn: 'span 6' }}>
          <div className="card-head">
            <h3>Cash flow</h3>
            <span className="sub">Receipts vs payments, 6 months</span>
          </div>
          <div style={{ padding: 16 }}>
            <div className="bar-row">
              {rep.cashflowSeries.map((s) => {
                const max = Math.max(1, ...rep.cashflowSeries.map((x) => Math.max(x.in, x.out, 1)));
                return (
                  <div className="bar-col" key={s.month}>
                    <div className="bar-track">
                      <div className="bar in" style={{ height: `${(s.in / max) * 100}%` }} title={`In ${money(s.in)}`} />
                      <div className="bar out" style={{ height: `${(s.out / max) * 100}%` }} title={`Out ${money(s.out)}`} />
                    </div>
                    <div className="bar-label">{s.month.slice(5)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12.5, color: 'var(--text-soft)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} /> Receipts
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', display: 'inline-block' }} /> Payments
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="widget-grid" style={{ marginBottom: 16 }}>
        <section className="card w-8" style={{ gridColumn: 'span 8' }}>
          <div className="card-head">
            <h3>Open balances by party</h3>
            <span className="sub">{rep.byParty.length} parties</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Party</th><th className="num">Receivables</th><th className="num">Payables</th><th className="num">Net open</th><th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {rep.byParty.map((p) => (
                  <tr key={p.party}>
                    <td style={{ fontWeight: 600 }}>{p.party}</td>
                    <td className="num">{money(p.receivables)}</td>
                    <td className="num">{money(p.payables)}</td>
                    <td className="num" style={{ color: p.open >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {money(p.open)}
                    </td>
                    <td>{p.openCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card w-4" style={{ gridColumn: 'span 4' }}>
          <div className="card-head">
            <h3>Expenses by category</h3>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(rep.expenseByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => {
                const total = Object.values(rep.expenseByCategory).reduce((a, b) => a + b, 0);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{cat}</span>
                      <span style={{ color: 'var(--text-soft)' }}>{money(amt)}</span>
                    </div>
                    <div className="hbar-track">
                      <div className="hbar-fill" style={{ width: `${total ? (amt / total) * 100 : 0}%`, background: 'var(--blue)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <div className="footer-note">
        <span>Report generated {new Date(rep.generatedAt).toLocaleString()} · CSV export includes all sections.</span>
        <span>ColourDiam ERP Accounts</span>
      </div>
    </>
  );
}
