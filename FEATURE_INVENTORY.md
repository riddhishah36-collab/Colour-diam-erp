# ColourDiam ERP — Feature Inventory

ColourDiam ERP is a full-stack diamond & jewellery business management suite.
Backend: Node.js + Express (modular, seeded JSON persistence). Frontend:
React 18 + TypeScript + Vite, light neutral theme.

Preview (production build served by the backend on port 4000):
https://4000-dd071744f567f5a3.monkeycode-ai.live

## Stack

| Layer    | Tech                                             | Location          |
| -------- | ------------------------------------------------ | ----------------- |
| Frontend | React 18, TypeScript, Vite, React Router, lucide | `frontend/`       |
| Backend  | Node.js, Express                                 | `backend/`        |
| Data     | JSON file persistence (auto-seeded, resettable)  | `backend/data/`   |
| Build    | `tsc --noEmit && vite build` → served by backend | `frontend/dist/`  |

## Backend modules (14, all registered + seeded)

| Module          | Key           | Seed | Highlights                                                       |
| --------------- | ------------- | ---- | ---------------------------------------------------------------- |
| Diamonds        | `diamonds`    | 18   | certificate, lab, intensity, modifier, measurements, depth, table |
| Products        | `products`    | 12   | jewellery pieces, SKU, costing, min stock                         |
| Stock Movements | `stock`       | 15   | in/out/transfer/adjustment ledger, location, valuation            |
| Memos           | `memos`       | 10   | consignment tracking, values, statuses                            |
| Returns         | `returns`     | 8    | reason, condition, restock/refund/exchange pipeline               |
| Expenses        | `expenses`    | 14   | categories, vendors, payment methods                              |
| Accounts        | `accounts`    | 15   | receivables/payables/payments/receipts ledger                     |
| Tasks           | `tasks`       | 12   | priorities, assignees, statuses                                   |
| Messages        | `messages`    | 12   | email/SMS/internal/WhatsApp inbox                                 |
| Documents       | `documents`   | 10   | certificates, contracts, invoices                                 |
| Media           | `media`       | 10   | photography, videos, 3D scans                                     |
| Integrations    | `integrations`| 8    | marketplace, payment, shipping, lab API connections               |
| Workflows       | `workflows`   | 8    | automated processes, triggers, step definitions                   |
| Roles           | `roles`       | 5    | role-based permission matrix (28 perms)                           |

Every module gets automatic CRUD, free-text search, sorting and CSV export.

## API surface

- `GET  /api/meta` — module registry (schema) for the UI
- `GET  /api/<module>` — list (search `?q=`, sort `?sort=&order=`, `?limit=`)
- `GET  /api/<module>/:id` · `POST` · `PUT` · `DELETE`
- `GET  /api/<module>/export/csv` — per-module CSV export
- `GET  /api/dashboard/summary` — KPIs, recent diamonds/tasks/activity, aging
- `GET  /api/reports/accounts` — financial report (totals, aging, by party, cash flow, expenses)
- `POST /api/system/reset` — wipe + reseed all modules
- `GET  /api/health` — liveness

## Frontend pages

| Route            | Page                                   | Notes                                          |
| ---------------- | -------------------------------------- | ---------------------------------------------- |
| `/`              | Dashboard                              | customizable widget grid                       |
| `/diamonds`      | Diamonds                               | Table ⇄ Visual toggle                          |
| `/accounts`      | Accounts                               | Ledger + Financial Report tabs                 |
| `/reports`       | Financial Report                       | standalone accounts report + CSV               |
| `/m/<module>`    | Generic module pages (12 modules)      | search, sort, CSV, CRUD                        |

### Layout (`Layout.tsx`)
- Light neutral collapsible sidebar (expanded 248px / collapsed 66px), grouped nav with live counts.
- Topbar with search trigger, page title, help/notifications, user chip.
- **Cmd/Ctrl+K command palette** — fuzzy page/module search with arrow-key + Enter navigation.
- Sidebar collapse state persisted in localStorage.

### Customizable Dashboard
- **Widget registry** (13 widgets): 8 KPI tiles, recent diamonds, receivables aging, open tasks, recent activity, cash flow chart.
- **Visibility** toggles and **drag-to-reorder** (HTML5 DnD) from the "Customize" panel.
- Layout persisted in `localStorage` (`cds.dashboard.widgets`), with a reset option.
- Live data from `/api/dashboard/summary` + `/api/reports/accounts`.

### Diamonds page
- **Table ⇄ Visual view toggle.**
- Visual view renders shape-aware SVG stones tinted by colour grade / fancy colour intensity+modifier, sized by carat.
- New fields: certificate, lab, intensity, modifier, measurements, depth, table — plus full 4C grading, price, status.
- Search, sort, CSV export and CRUD on both views.

## Verified

- [x] Backend modules registered + seeded (14 modules, all counts non-zero)
- [x] Dashboard endpoint + accounts report endpoint return correct aggregates
- [x] CSV export works per module (Content-Type text/csv, correct headers)
- [x] Restart persistence + `POST /api/system/reset` reseeds (18 diamonds, 5 roles)
- [x] Workflows module searchable (e.g. `?q=Memo`)
- [x] Roles module: permission matrix with 28 permissions, 5 roles
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
