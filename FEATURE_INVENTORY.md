# Colour Diam ERP — Feature Inventory & API Mapping

Modern rebuild of the Colour Diam ERP. Business logic and data live in the ERP API
(`backend/server.js`, REST under `/api`). The frontend (`frontend/`) is a premium
SaaS-style interface that consumes that API and adds no business logic of its own.

Every ERP capability listed below is implemented in both the API and the UI.
Nothing has been silently dropped; anything that exists as a stub or limitation is
recorded in [API gaps](#api-gaps--next-steps).

---

## 1. Modules, screens and fields

### Overview

| ERP capability | API endpoint | UI route / screen | Status |
|---|---|---|---|
| Customizable dashboard (reorder/toggle widgets, saved per device) | `GET /api/dashboard` | `/` | Done |
| KPI set: revenue, sales today/month/year, inventory value/cost, receivables, pending payments, memo stock, supplier payable, tasks due, enquiries | `GET /api/dashboard` | `/` | Done |
| Widgets: revenue chart, category value, stock position, alerts, transactions, consignments out, tasks due, top items/customers, lead pipeline, activity | `GET /api/dashboard` | `/` | Done |
| Global command palette across every module (⌘K / Ctrl+K) | `GET /api/global-search?q=` | Topbar (⌘K) | Done |
| Notifications / recent activity feed | `GET /api/activities` | Topbar bell | Done |

### Inventory — Diamonds

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter / sort / paginate | `GET /api/diamonds` | q, status, shape, colour, intensity, clarity, lab, origin, carat range | Done |
| **Table ⇄ Visual product view toggle** | `GET /api/diamonds` | Table mode + stone-card grid (photo or gem visual, grade chips) | Done |
| Create / update / delete | `POST` `PUT /:id` `DELETE /:id` | Full CRUD | Done |
| Grading fields | — | shape, carat, colour, **colour intensity, colour modifier**, clarity, cut, polish, symmetry, fluorescence | Done |
| Proportions | — | measurements, depth %, table % | Done |
| Certification | — | lab (GIA/IGI/HRD/AGL/Gubelin/SSEF), cert number | Done |
| Sourcing | — | origin | Done |
| Pricing | — | price/ct, cost/ct, computed price = carat × price/ct | Done |
| Stock control | — | quantity, location (vault/office), status: in-stock, reserved, pending, sold, on-consignment, lost | Done |
| Attachments | `PUT /:id` (photos array) | Upload GIA certificates / stone images, remove | Done |
| Notes | — | free text | Done |
| CSV export of filtered results | `GET /api/diamonds?exportAll=1` | Export button | Done |

### Inventory — Gemstones

Same matrix as Diamonds with stone-specific fields (stoneType, treatment,
origin, colour description). `GET /api/gemstones` … full CRUD, filters
(status, stoneType), CSV export. Statuses: in-stock, reserved, pending, sold,
on-consignment. Attachments supported. | Done

### Inventory — Jewellery

Same matrix with jewellery fields (jewelleryType, material, total carat weight,
primary stone, colour). `GET /api/jewellery` … full CRUD, filters (status,
jewelleryType, colour), CSV export, attachments. Statuses: in-stock, reserved,
pending, sold. | Done

### Inventory — Products

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/products` | q, status, category | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | SKU, name, category, material, description, price, cost, qty, location | Done |
| Curated offerings | — | tags (signature, atelier…), status: in-stock/reserved/pending/sold/on-consignment | Done |
| CSV export | `GET /api/products?exportAll=1` | Done | Done |

### Inventory — Stock (aggregate view)

| Capability | API | UI |
|---|---|---|
| Combined stock ledger across diamonds, gemstones, jewellery, products | `GET /api/{diamonds,gemstones,jewellery,products}` | `/inventory/stock` |
| Value / cost / gross margin / piece count summary | — | `/inventory/stock` |
| Type + status filters, client-side search, CSV export | — | `/inventory/stock` |
| Click-through to the owning record | — | row → module detail |

### Sales — Consignments (Memos)

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/memos` | q, status | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | MEM- number, customer, memo/due dates, line items | Done |
| Memo lifecycle | — | out-standing, partial-return, sold, returned | Done |
| Value tracking | — | totalValue; surfaced on dashboard as “Memos out” + alerts for overdue | Done |
| CSV export | `GET /api/memos?exportAll=1` | Done | Done |

### Sales — Returns

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/returns` | q, status | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | RET- number, linked order, reason, condition, refund amount | Done |
| Return lifecycle | — | pending, inspected, approved, resolved, rejected | Done |
| CSV export | `GET /api/returns?exportAll=1` | Done | Done |

### Sales / Finance — Expenses

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/expenses` | q, status, category | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | EXP- number, category, vendor, description, amount, payment method | Done |
| Approval lifecycle | — | recorded, approved, paid, rejected | Done |
| Cash-out tracking | `GET /api/dashboard` (transactions) + `GET /api/reports/accounts` | Feed + cash flow | Done |
| CSV export | `GET /api/expenses?exportAll=1` | Done | Done |

### Finance — Accounts

| Capability | API | UI |
|---|---|---|
| Cash received, outgoing spend, net position | `GET /api/reports/accounts` | `/finance/accounts` |
| Receivables, payables, client balances | `GET /api/reports/accounts` | `/finance/accounts` |
| Cash-flow chart (6 months) + spend by category | `GET /api/reports/accounts` | `/finance/accounts` |

### Engagement — Messages

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/messages` | q, status, direction | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | subject, party (customer/lead/supplier), channel (email/phone/whatsapp/meeting), direction, owner, body | Done |
| Read / unread tracking | — | status: unread/read | Done |
| CSV export | `GET /api/messages?exportAll=1` | Done | Done |

### Engagement — Tasks

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/tasks` | q, status, priority | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | title, description, assignee, due date, priority, linked module record | Done |
| Statuses | — | todo, in-progress, done | Done |
| Dashboard surfacing | `GET /api/dashboard` | Tasks-due widget + alerts | Done |
| CSV export | `GET /api/tasks?exportAll=1` | Done | Done |

### Files — Documents

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/documents` | q, type | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | name, type (certificate/invoice/memo/contract/media/regulatory), party, date, tags, file URL | Done |
| CSV export | `GET /api/documents?exportAll=1` | Done | Done |

### Files — Media

| Capability | API | UI |
|---|---|---|
| Aggregated asset library (photos attached to inventory + media documents) | `GET /api/{inventory}`, `GET /api/documents?q=media` | `/media` |

### Customers (CRM)

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter / sort | `GET /api/customers` | q, status, segment, tier | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | Done | Done |
| Contact data | — | name, company, contact person, email, phone, address, city, country | Done |
| Segmentation | — | segment: retail/wholesale/trade; tier: VIP/Gold/Silver/Standard | Done |
| Tags & source | — | tags (multi), source | Done |
| Account | — | credit limit, running balance, status (active/lead/inactive) | Done |
| Customer records show balance | — | column in list + detail | Done |

### Leads (CRM pipeline)

| Capability | API | Field/action set | Status |
|---|---|---|---|
| Pipeline board data | `GET /api/leads` | stage, source filters | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | Done | Done |
| Pipeline stages | — | new → contacted → qualified → proposal → negotiation → won/lost | Done |
| Deal value & owner | — | potential value, assigned owner (from Users) | Done |
| Next action tracking | — | next action text + date, surfaced on dashboard as follow-up alerts | Done |

### Suppliers

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/suppliers` | q, type | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | Done | Done |
| Vendor profile | — | contact, type (rough-supplier, cutter, gem-supplier, setting-house, logistics), city/country | Done |
| Commercial terms | — | payment terms, lead time, rating | Done |

### Sales — Quotes

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/quotes` | q, status | Done |
| Full CRUD with line items | `POST` `PUT /:id` `DELETE /:id` | Item picker from inventory + custom lines, qty, unit price | Done |
| Pricing | — | discount %, tax %, auto-computed subtotal/tax/total | Done |
| Statuses | — | draft, sent, approved, negotiation, converted, expired | Done |
| Validity | — | valid-until date | Done |
| **Convert quote → sales order + invoice** | `POST /api/quotes/:id/convert` | One-click conversion | Done |
| CSV export | `GET /api/quotes?exportAll=1` | Done | Done |

### Sales — Sales Orders

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/orders` | q, status | Done |
| Full CRUD with line items | `POST` `PUT /:id` `DELETE /:id` | Same item editor as quotes | Done |
| Order lifecycle | — | draft, approved, in-production, shipped, delivered, cancelled | Done |
| Delivery | — | expected delivery date | Done |
| Payment tracking | — | payment status: unpaid/partial/paid; payment method | Done |
| **Issue invoice from order** | `POST /api/orders/:id/issue-invoice` | Creates invoice + assigns number | Done |
| CSV export | `GET /api/orders?exportAll=1` | Done | Done |

### Billing — Invoices

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/invoices` | q, status | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | Manual create supported | Done |
| Statuses | — | issued, partial, paid, overdue, void | Done |
| Amounts | — | subtotal, tax, total, paidAmount, balance (auto) | Done |
| **Record payment on invoice** | `POST /api/invoices/:id/pay` | Creates payment, updates paid/balance/status, decrements customer balance | Done |
| Aging/overdue surfacing | — | dashboard alerts + receivables report | Done |
| CSV export | `GET /api/invoices?exportAll=1` | Done | Done |

### Payments

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/payments` | q, method | Done |
| Full CRUD | `POST` `PUT /:id` `DELETE /:id` | Done | Done |
| Payment data | — | invoice reference, customer, date, method, amount, bank reference | Done |
| CSV export | `GET /api/payments?exportAll=1` | Done | Done |

### Procurement — Purchase Orders

| Capability | API | Field/action set | Status |
|---|---|---|---|
| List / search / filter | `GET /api/purchaseOrders` | q, status | Done |
| Full CRUD with line items | `POST` `PUT /:id` `DELETE /:id` | Supplier + inventory item picker | Done |
| Lifecycle | — | draft, approved, ordered, received, cancelled | Done |
| Sourcing analytics | `GET /api/reports/suppliers` | spend by supplier | Done |
| CSV export | `GET /api/purchaseOrders?exportAll=1` | Done | Done |

### Reports & Analytics

| Report | API | UI |
|---|---|---|
| Sales: revenue, order count, average order, margin, by month / customer / item | `GET /api/reports/sales?from=&to=` | Reports → Sales |
| Inventory: value & cost by category, status distribution, value by origin | `GET /api/reports/inventory` | Reports → Inventory |
| Receivables: aging buckets (current, 1–30, 31–60, 60+), outstanding by customer | `GET /api/reports/receivables` | Reports → Receivables |
| Supplier spend by supplier + PO count | `GET /api/reports/suppliers?from=&to=` | Reports → Supplier spend |
| Accounts: cash in/out, net position, payables/receivables, cash flow, spend by category | `GET /api/reports/accounts` | Finance → Accounts |
| CSV export (client side) | — | Per-report Export buttons |

### Administration

| Capability | API | UI |
|---|---|---|
| Users & roles (admin, manager, sales, inventory, viewer) | `GET/POST/PUT/DELETE /api/users` | Users & Roles |
| Role-based permissions | enforced server-side per resource (see section 3) | Hidden write UI when lacking role |
| Activity / audit log (all create/update/delete) | `GET /api/activities?q=&type=&page=` | Activity Log |
| Company profile + document numbering | `GET/POST /api/meta` | Settings |
| API key + integrations directory | `GET/POST /api/meta` | Integrations |
| Demo data reset (admin) | `POST /api/admin/reset` | Settings → Danger zone |

---

## 2. Status dictionaries

| Domain | Statuses |
|---|---|---|
| Inventory (all) | in-stock, reserved, pending, sold, on-consignment, lost |
| Customer | active, lead, inactive |
| Lead | new, contacted, qualified, proposal, negotiation, won, lost |
| Quote | draft, sent, approved, negotiation, converted, expired |
| Sales order | draft, approved, in-production, shipped, delivered, cancelled |
| Order payment | unpaid, partial, paid |
| Invoice | issued, partial, paid, overdue, void |
| Purchase order | draft, approved, ordered, received, cancelled |
| Memo / consignment | out-standing, partial-return, sold, returned |
| Return | pending, inspected, approved, resolved, rejected |
| Expense | recorded, approved, paid, rejected |
| Task | todo, in-progress, done |
| Message | unread, read |

---

## 3. Permissions matrix (server-enforced)

| Role | Inventory | Customers/Leads | Suppliers | Quotes/Orders/Invoices/Payments | Memos/Returns/Expenses | Tasks/Messages | Purchase Orders | Users | Settings | Reports/Activity |
|---|---|---|---|---|---|---|---|---|---|---|---|
| admin | RW | RW | RW | RW | RW | RW | RW | RW | RW | R |
| manager | RW | RW | RW | RW | RW | RW | RW | R | R | R |
| sales | R | RW | R | RW | RW (tasks RW) | RW (messages RW) | R | — | — | R |
| inventory | RW | R | RW | — | R | RW (tasks) | RW | — | — | — |
| viewer | R | R | R | R | R | R | R | — | — | R |

Note: expense writes require admin/manager; task writes are open to admin/manager/sales/inventory; message and document writes to admin/manager/sales/inventory.
Unauthenticated → `401`; authenticated without role → `403`.

---

## 4. API gaps & next steps

Documented so nothing is silently lost. These are deliberate scope decisions for
this rebuild and can be added against the same data model:

1. **Stock movement ledger** — quantity is a single value per record. A `movements`
   collection (in → out, order/PO reference) is the natural extension.
2. **Auto-status transitions** — converting a quote to an order does not yet flip
   the source inventory record to `reserved`/`sold`; a memo marked `sold` does not
   yet move its line items to `sold` either. Wiring the item editor to update
   inventory stock status is a follow-up.
3. **Email/print documents** — quotes/invoices can be viewed and exported but not
   emailed or printed from within the app; Messages are log entries, not a live
   mail client.
4. **Attachments are image-only and stored inline** — file uploads beyond images and
   binary storage in the database (rather than `data:URL`) is a follow-up.
5. **Multi-currency & taxes per line** — pricing is single-currency (USD); tax is a
   single rate per document, not per line.
6. **Reports are aggregate snapshots** — no drill-down from a chart to its rows yet.
7. **Notifications are in-app only** — no email/push dispatch.
8. **Purchase order receiving** does not yet increment inventory quantities.
9. **Return/refund processing** records the return but does not yet auto-generate a
   credit note or reverse invoice balances.
10. **Expense approval** is a status field only — no separate approval workflow step
    or approver assignment.
11. **Documents/Media are metadata + optional URL** — no in-app file storage/upload
    yet; photos attached to inventory records are the inline-upload exception.
12. **Integrations are a directory + API key** — real connections (email, WhatsApp,
    ledger sync) are placeholders. Live ERP integration should point the frontend
    proxy at the production Colour Diam API.

---

## 5. Running locally

```
npm run install:all   # install backend + frontend
npm run dev           # API on :3001, app on :5173 (proxies /api)
```

Demo accounts — password `demo-pass`:
`valentina@colourdiam.com` (admin) · `daniel@colourdiam.com` (manager) ·
`amara@colourdiam.com` (sales) · `priya@colourdiam.com` (inventory) ·
`james@colourdiam.com` (viewer)

---

## 6. Cloudflare deployment

The app is Cloudflare-ready as a **full-stack Pages project**: the React build is served
as static assets and the entire ERP API runs as a **Pages Function** on the same origin
(so `/api` keeps working with no CORS setup). Data is stored in a **Workers KV**
namespace, so every change persists server-side and survives restarts / redeploys.

### How it maps

| Piece | Local dev | Cloudflare |
|---|---|---|
| Frontend | Vite dev server on `:5173` | Static build from `frontend/dist` (Pages) |
| API | Express on `:3001` (`backend/server.js`) | `functions/api/[[path]].js` Pages Function (port of the same routes) |
| Data | `backend/data/db.json` (file) | Workers KV namespace `ERP_KV` (key `db`) |
| Sessions | In-memory 12 h | KV keys `session:<token>` (12 h) |
| Auto-deploy | — | GitHub Actions on every push to `main` |

The Pages Function reuses the exact seed data (`backend/seed.js`), the same
`RESOURCES` registry (roles, search fields), query/CSV logic, dashboard and report
calculations as the Express server. Feature parity is covered by the sections above.

### Files

- `wrangler.toml` — Pages project config (`pages_build_output_dir = "frontend/dist"`, KV binding `ERP_KV`)
- `functions/api/[[path]].js` — the API as a Pages Function
- `.github/workflows/deploy.yml` — auto-deploy on push to `main`

### One-time setup (needs a Cloudflare account + API token)

1. Create a **Workers KV namespace** and note its ID:
   ```
   wrangler kv namespace create ERP_KV
   ```
   (Or create it in the Cloudflare dashboard under Workers & Pages → KV.)
   Put the namespace ID into `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "ERP_KV"
   id = "<namespace-id>"
   preview_id = "<same-namespace-id>"
   ```

2. Create a **Pages project** named `colour-diam-erp` (or update the
   `--project-name` in the workflow). Production branch: `main`.

3. In GitHub repo **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — a token with **Cloudflare Pages: Edit** and **Workers KV: Edit** permissions
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

4. Push to `main`. The workflow installs dependencies, builds the frontend, and runs
   `wrangler pages deploy`. Every subsequent push redeploys automatically.

### Testing the Worker locally

```
wrangler pages dev --kv ERP_KV
```

Serves the built `frontend/dist` + the Function on `http://localhost:8788` with a
local KV, so the whole app (UI + API + persistence) can be exercised before pushing.
The seed is written to KV on first access; use `POST /api/admin/reset` to reseed.

### Notes

- KV is eventually consistent (typically < 60 s to propagate worldwide). For a demo
  this is fine; if Colour Diam later needs strong consistency, migrate the KV JSON
  document to a D1 (SQLite) table model.
- On the free plan, KV reads/writes are subject to Cloudflare's daily request limits;
  the `db` blob is a single key so each read is one request.
- The Express server (`backend/`) remains the canonical local development backend;
  the Pages Function is kept in sync manually. If they drift, run the same workflow
  tests against both (`curl` the endpoint matrix against `:3001` and the Pages build).

