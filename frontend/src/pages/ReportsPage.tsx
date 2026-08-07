import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Boxes, ShoppingCart, Download } from 'lucide-react';
import { api, type Row } from '../api';
import { useApp } from '../AppContext';
import { toast } from '../components/ui';
import AccountsReportView from './AccountsReportView';

type Tab = 'accounts' | 'inventory' | 'sales';

const TABS: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
  { key: 'accounts', label: 'Accounts & Finance', icon: BarChart3 },
  { key: 'inventory', label: 'Inventory', icon: Boxes },
  { key: 'sales', label: 'Sales', icon: ShoppingCart },
];

function countBy<T>(rows: T[], field: (r: T) => string): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rows) {
    const k = field(r) || '—';
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

function sumBy<T>(rows: T[], field: (r: T) => number): number {
  return rows.reduce((a, r) => a + (Number.isFinite(Number(field(r))) ? Number(field(r)) : 0), 0);
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const lines = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('accounts');
  const [diamonds, setDiamonds] = useState<Row[]>([]);
  const [products, setProducts] = useState<Row[]>([]);
  const [stock, setStock] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [quotations, setQuotations] = useState<Row[]>([]);
  const [payments, setPayments] = useState<Row[]>([]);
  const [leads, setLeads] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { maskMoney: mask, canViewCosts } = useApp();

  const load = useCallback(async () => {
    setLoaded(false);
    try {
      const [d, p, s, i, qt, pay, l] = await Promise.all([
        api.list('diamonds', { limit: '500' }),
        api.list('products', { limit: '500' }),
        api.list('stock', { limit: '500' }),
        api.list('invoices', { limit: '500' }),
        api.list('quotations', { limit: '500' }),
        api.list('payments', { limit: '500' }),
        api.list('leads', { limit: '500' }),
      ]);
      setDiamonds(d.rows);
      setProducts(p.rows);
      setStock(s.rows);
      setInvoices(i.rows);
      setQuotations(qt.rows);
      setPayments(pay.rows);
      setLeads(l.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load reports data');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const diamondStatus = countBy(diamonds, (r) => String(r.status));
  const diamondShapes = countBy(diamonds, (r) => String(r.shape));
  const diamondValue = sumBy(diamonds, (r) => Number(r.price));
  const productCats = countBy(products, (r) => String(r.category));
  const stockTypes = countBy(stock, (r) => String(r.type));
  const invoiceStatus = countBy(invoices, (r) => String(r.status));
  const invoiceValue = sumBy(invoices, (r) => Number(r.total));
  const quoteStatus = countBy(quotations, (r) => String(r.status));
  const quoteValue = sumBy(quotations, (r) => Number(r.total));
  const paymentMethod = countBy(payments, (r) => String(r.method));
  const paymentTotal = sumBy(payments, (r) => Number(r.amount));
  const leadStage = countBy(leads, (r) => String(r.stage));

  const renderBars = (data: Record<string, number>, total: number, color: string) => {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return <div className="empty-state" style={{ padding: 20 }}>No data.</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(([k, v]) => (
          <div key={k}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{k}</span>
              <span style={{ color: 'var(--text-soft)' }}>{v.toLocaleString()}</span>
            </div>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: `${total ? (v / total) * 100 : 0}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const barColor = (i: number) => ['var(--primary)', 'var(--blue)', 'var(--green)', 'var(--purple)', 'var(--teal)', 'var(--amber)', 'var(--red)'][i % 7];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports Centre</h1>
          <p>Consolidated reporting across finance, inventory and sales with CSV export.</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            <t.icon size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {t.label}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="empty-state">Loading report data…</div>
      ) : tab === 'accounts' ? (
        <AccountsReportView report={null} />
      ) : tab === 'inventory' ? (
        <div>
          <div className="stats-row">
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--primary)' }}>{diamonds.length}</div>
                <div className="lbl">Diamonds on file</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{mask(diamondValue)} total price</div>
              </div>
            </div>
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--blue)' }}>{products.length}</div>
                <div className="lbl">Catalogue products</div>
              </div>
            </div>
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--green)' }}>{stock.length}</div>
                <div className="lbl">Stock movements</div>
              </div>
            </div>
          </div>

          <div className="widget-grid" style={{ marginBottom: 16 }}>
            <section className="card w-6">
              <div className="card-head"><h3>Diamonds by status</h3></div>
              <div style={{ padding: 16 }}>{renderBars(diamondStatus, diamonds.length, barColor(0))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head"><h3>Diamonds by shape</h3></div>
              <div style={{ padding: 16 }}>{renderBars(diamondShapes, diamonds.length, barColor(1))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head"><h3>Products by category</h3></div>
              <div style={{ padding: 16 }}>{renderBars(productCats, products.length, barColor(2))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head">
                <h3>Stock movements by type</h3>
                <button
                  className="btn small ghost"
                  style={{ marginLeft: 'auto' }}
                  onClick={() =>
                    downloadCsv('inventory-report.csv', [
                      ['Stock No', 'Item', 'Type', 'Qty', 'Value', 'Party', 'Date'],
                      ...stock.map((s) => [String(s.id), String(s.item), String(s.type), Number(s.quantity), Number(s.totalValue), String(s.party || ''), String(s.date || '')]),
                    ])
                  }
                >
                  <Download size={13} /> CSV
                </button>
              </div>
              <div style={{ padding: 16 }}>{renderBars(stockTypes, stock.length, barColor(3))}</div>
            </section>
          </div>
        </div>
      ) : (
        <div>
          <div className="stats-row">
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--primary)' }}>{invoices.length}</div>
                <div className="lbl">Invoices issued</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{mask(invoiceValue)} total</div>
              </div>
            </div>
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--teal)' }}>{payments.length}</div>
                <div className="lbl">Payments recorded</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{mask(paymentTotal)} gross</div>
              </div>
            </div>
            <div className="card">
              <div className="stats-tile">
                <div className="num" style={{ color: 'var(--purple)' }}>{quotations.length}</div>
                <div className="lbl">Quotations</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{mask(quoteValue)} total</div>
              </div>
            </div>
          </div>

          <div className="widget-grid" style={{ marginBottom: 16 }}>
            <section className="card w-6">
              <div className="card-head">
                <h3>Invoices by status</h3>
                <button
                  className="btn small ghost"
                  style={{ marginLeft: 'auto' }}
                  onClick={() =>
                    downloadCsv('sales-report.csv', [
                      ['Invoice', 'Customer', 'Status', 'Total', 'Date'],
                      ...invoices.map((i) => [String(i.invoiceNo), String(i.customer), String(i.status), Number(i.total), String(i.date || '')]),
                      [],
                      ['Quote', 'Customer', 'Status', 'Total', 'Date'],
                      ...quotations.map((qt) => [String(qt.quoteNo), String(qt.customer), String(qt.status), Number(qt.total), String(qt.date || '')]),
                    ])
                  }
                >
                  <Download size={13} /> CSV
                </button>
              </div>
              <div style={{ padding: 16 }}>{renderBars(invoiceStatus, invoices.length, barColor(0))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head"><h3>Quotations by status</h3></div>
              <div style={{ padding: 16 }}>{renderBars(quoteStatus, quotations.length, barColor(4))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head"><h3>Payments by method</h3></div>
              <div style={{ padding: 16 }}>{renderBars(paymentMethod, payments.length, barColor(2))}</div>
            </section>
            <section className="card w-6">
              <div className="card-head"><h3>Leads by stage</h3></div>
              <div style={{ padding: 16 }}>{renderBars(leadStage, leads.length, barColor(5))}</div>
            </section>
          </div>
        </div>
      )}

      {!canViewCosts && (
        <div className="footer-note">
          <span>Costs and prices are masked for the current role — switch to a role with cost access in the top-right.</span>
        </div>
      )}
    </>
  );
}
