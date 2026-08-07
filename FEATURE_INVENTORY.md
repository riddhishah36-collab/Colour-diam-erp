# ColourDiam ERP — Feature Inventory

ColourDiam ERP is a full-stack diamond & jewellery business management suite.
Backend: Node.js + Express (modular, seeded JSON persistence). Frontend:
React 18 + TypeScript + Vite, luxe light theme (off-white + gold accent).

Preview (production build served by the backend on port 4000):
https://4000-81387ebcb85f0af1.monkeycode-ai.live

## Stack

| Layer    | Tech                                             | Location          |
| -------- | ------------------------------------------------ | ----------------- |
| Frontend | React 18, TypeScript, Vite, React Router, lucide | `frontend/`       |
| Backend  | Node.js, Express                                 | `backend/`        |
| Data     | JSON file persistence (auto-seeded, resettable)  | `backend/data/`   |
| Build    | `tsc --noEmit && vite build` → served by backend | `frontend/dist/`  |

## Backend modules (19, all registered + seeded)

| Module          | Key           | Seed | Highlights                                                       |
| --------------- | ------------- | ---- | ---------------------------------------------------------------- |
| Diamonds        | `diamonds`    | 18   | certificate, lab, intensity, modifier, measurements, depth, table |
| Products        | `products`    | 12   | jewellery pieces, SKU, costing, min stock                         |
| Customers       | `customers`   | 8    | CRM: contacts, credit limit, tags, status                         |
| Leads           | `leads`       | 11   | pipeline: stage, owner, priority, expected close, value           |
| Stock Movements | `stock`       | 15   | in/out/transfer/adjustment ledger, location, valuation            |
| Memos           | `memos`       | 10   | consignment tracking, values, statuses                            |
| Returns         | `returns`     | 8    | reason, condition, restock/refund/exchange pipeline               |
| Invoices        | `invoices`    | 11   | billing, statuses, totals                                         |
| Payments        | `payments`    | 8    | receipts by method, allocation                                    |
| Quotations      | `quotations`  | 8    | quotes, statuses, validity                                        |
| Expenses        | `expenses`    | 14   | categories, vendors, payment methods                              |
| Accounts        | `accounts`    | 15   | receivables/payables/payments/receipts ledger                     |
| Tasks           | `tasks`       | 12   | priorities, assignees, statuses                                   |
| Messages        | `messages`    | 12   | email/SMS/internal/WhatsApp inbox                                 |
| Documents       | `documents`   | 10   | certificates, contracts, invoices                                 |
| Media           | `media`       | 10   | photography, videos, 3D scans                                     |
| Integrations    | `integrations`| 8    | marketplace, payment, shipping, lab API connections               |
| Workflows       | `workflows`   | 8    | automated processes, triggers, step definitions                   |
| Roles           | `roles`       | 5    | role-based permission matrix (incl. `costs.view`/`costs.edit`)    |

Every module gets automatic CRUD, free-text search, sorting and CSV export.

## API surface

- `GET  /api/meta` — module registry (schema) for the UI
- `GET  /api/<module>` — list (search `?q=`, sort `?sort=&order=`, `?limit=`)
- `GET  /api/<module>/:id` · `POST` · `PUT` · `DELETE`
- `GET  /api/<module>/export/csv` — per-module CSV export
- `GET  /api/dashboard/summary` — KPIs, recent diamonds/tasks/activity, aging, customers/leads/invoices/payments/quotations aggregates + recentLeads
- `GET  /api/notifications` — derived notifications (overdue memos, task priority, unread messages, open leads, returns)
- `GET  /api/activity?kind=` — full activity feed (stock, memos, invoices, quotes, payments, leads, expenses, …)
- `GET  /api/reports/accounts` — financial report (totals, aging, by party, cash flow, expenses)
- `POST /api/system/reset` — wipe + reseed all modules
- `GET  /api/health` — liveness

## Frontend pages

| Route            | Page                                   | Notes                                          |
| ---------------- | -------------------------------------- | ---------------------------------------------- |
| `/`              | Dashboard                              | customizable widget grid                       |
| `/diamonds`      | Diamonds                               | filters, saved filters, stone grid + detail drawer |
| `/accounts`      | Accounts                               | Ledger + Financial Report tabs                 |
| `/customers`     | Customers CRM                          | table + detail drawer with activity timeline   |
| `/leads`         | Leads Pipeline                         | 6-stage drag-and-drop kanban + CSV             |
| `/sales`         | Sales Workspace                        | invoices / payments / quotations tabs          |
| `/messages`      | Messages                               | WhatsApp-style inbox + thread compose          |
| `/reports`       | Reports Centre                         | accounts / inventory / sales report tabs + CSV |
| `/activity`      | Activity                               | full feed with kind filters                    |
| `/api-explorer`  | API Explorer                           | endpoint list + live tester                    |
| `/m/<module>`    | Generic module pages (14 modules)      | search, sort, CSV, CRUD                        |

### Layout (`Layout.tsx`)
- Luxe light theme: off-white background, gold gradient accent, elevated surfaces.
- Collapsible sidebar with grouped nav, live counts, new CRM group, mobile bottom nav.
- Topbar with global search trigger (Ctrl+K), page title, **notification bell dropdown** (severity tiers, deep-links), **Quick + menu** (9 quick actions), **role simulator** dropdown (permission hints, cost privacy on/off).
- **Cmd/Ctrl+K command palette** — grouped pages + record search (8 modules, debounced) with arrow-key + Enter navigation.
- Sidebar collapse + simulated role persisted in localStorage.

### Permission-aware routes & cost privacy
- Every route and CRUD action is gated by the active role's permissions (`canViewModule`/`canEditModule`).
- Money columns render `•••` unless the role has `costs.view` (DataTable + per-page `maskMoney`).
- Roles: Administrator, Sales Manager (default), Inventory Manager, Accounts, Viewer.

### Customizable Dashboard
- **Widget registry** (13 widgets): 8 KPI tiles, recent diamonds, receivables aging, open tasks, recent activity, cash flow chart.
- **Visibility** toggles and **drag-to-reorder** (HTML5 DnD) from the "Customize" panel.
- Layout persisted in `localStorage` (`cds.dashboard.widgets`), with a reset option.
- Live data from `/api/dashboard/summary` + `/api/reports/accounts`.

### Diamonds page
- **Advanced filter bar**: shape/lab/colour/clarity/intensity/status chips + carat & price ranges, with **saved filter** presets.
- Visual **stone-card grid** with shape-aware `StoneArt` SVG stones tinted by colour grade / fancy colour intensity+modifier, sized by carat.
- **Detail drawer** with spec grid, related memos and StoneArt; `?new=`/`?focus=` deep links.
- New fields: certificate, lab, intensity, modifier, measurements, depth, table — plus full 4C grading, price, status.

### Customers CRM
- Searchable table with status/type badges; `?new=`/`?id=` deep links.
- **Customer drawer**: avatar, contact info, credit limit, and a **timeline** of memos/accounts/invoices/quotations/payments/returns/messages sorted by date.

### Leads Pipeline
- 6-stage kanban (New → Contacted → Qualified → Proposal → Won → Lost) with **HTML5 drag & drop** stage moves (optimistic + rollback).
- Stage accent colors, value masking, CSV export, `?new=`/`?id=` deep links.

### Messages inbox
- Conversation list + thread layout; sender grouping via `partnerOf()`; WhatsApp-style bubbles in/out.
- Unread badges auto-marked Read on open; **compose reply** (Enter to send), perm-gated send button.

### Sales Workspace
- Tabs for invoices / payments / quotations with per-tab CRUD, tables, CSV export and `?tab=&new=&id=` deep links.

### Reports Centre
- Tabs: accounts / inventory / sales with bar breakdowns (diamonds by status/shape, products by category, stock types, invoice/quote status, payment method, lead stage).
- Downloadable CSV reporters; cost-masking footer note.

### Activity & API Explorer
- **Activity page**: full feed from `/api/activity` with kind filter chips.
- **API Explorer**: endpoint list (meta/dashboard/notifications/activity/health/reset + per-module CRUD/CSV) with live GET tester and formatted JSON output.

## Verified

- [x] Backend modules registered + seeded (19 modules, all counts non-zero)
- [x] Dashboard endpoint + accounts report endpoint return correct aggregates
- [x] CSV export works per module (Content-Type text/csv, correct headers)
- [x] Restart persistence + `POST /api/system/reset` reseeds (18 diamonds, 5 roles)
- [x] Notifications endpoint derives overdue/task/message/lead/return items with severity tiers
- [x] Activity endpoint streams the full feed (limit 200) and kind filter
- [x] Workflows module searchable (e.g. `?q=Memo`)
- [x] Roles module: permission matrix with cost permissions, 5 roles
- [x] Production build (`npm run build`) succeeds cleanly
- [x] Preview URL serves production build + SPA fallback → HTTP 200 on all routes
- [x] TypeScript strict typecheck passes (`tsc --noEmit`)

## Running locally

```bash
# Install everything (npm workspaces)
npm install

# Reset/seed the database
npm run reset

# Dev servers (backend :4000 + vite :5173 with /api proxy)
npm run dev

# Production build, served by the backend on :4000
npm run build
npm run start:backend
```
