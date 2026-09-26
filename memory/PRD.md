\# Kassabon — Receipt \& Spending Tracker



\## Original Problem Statement

Fully client-side React app to drop receipt CSV/XLSX exports (Dutch/Belgian supermarket format — Colruyt, Albert Heijn, Jumbo, Lidl, etc.) and explore spending, discounts, and trends. No backend. Deployed to GitHub Pages. Data persists per-browser via IndexedDB (Dexie). Deduplication on AfschriftID + ArtikelID + Datum.



\## Users

\- Solo user, no login. Public site, but data never leaves the browser.



\## Architecture

\- \*\*Client-only React (CRA + craco)\*\* — no FastAPI/Mongo used

\- IndexedDB via Dexie for persistence (`db.items` store)

\- SheetJS (xlsx) for CSV/XLSX parsing (semicolon-separated, EU numbers, Dutch dates like `16/sep/26`)

\- Recharts for trend/pie/bar charts

\- Tailwind + shadcn/ui components

\- HashRouter (safe for GitHub Pages)

\- Deploy workflow: `.github/workflows/deploy.yml` (Actions → Pages)



\## Core Requirements (static)

\- Drop-zone import (drag/drop + browse) with instant merge

\- Auto-normalize on import: EU numbers (`1.234,56 €`), Dutch booleans (`WAAR`/`ONWAAR`), Dutch dates

\- Dedup by `AfschriftID + ArtikelID + Datum + line#`

\- Product search + filter grid (store, category, brand, price range, date range, discount toggle, non-grocery exclude)

\- Analytics dashboard: total spend / saved / receipts / avg order, monthly trend area chart, spend by store, category donut, top-10 products

\- Discount / savings tracker: totals, by-month bar chart, by-store leaderboard, top-10 highest discounts

\- Receipts grouped view (accordion by AfschriftID/Datum/Keten with expandable line items)

\- Data controls: JSON backup / restore, CSV export (filtered + all), demo data loader, reset with confirm



\## Implemented (2026-02)

\- All core features above are live and verified against the user's real 3,623-row `Aankopen.csv` (767 receipts, €73k spend, €1.3k saved across 2019-2028)

\- Design: warm paper base (#FBF9F5), emerald savings accent (#059669), Outfit/DM Sans/JetBrains Mono typography

\- All interactive elements have `data-testid` attributes

\- GitHub Pages Actions workflow ready to push



\## Backlog / Next

\- \*\*P1\*\* Column mapping preview step before commit (currently auto-commits on drop)

\- \*\*P1\*\* CSV import for tab-separated / comma-separated variants (auto-detect delimiter)

\- \*\*P2\*\* Chart drill-down: click a bar → filter Products page

\- \*\*P2\*\* Store name normalization dictionary (COLRUYT vs COLRUYT MOL)

\- \*\*P2\*\* Budget target per month + progress bar

\- \*\*P2\*\* Compare periods (month-over-month deltas)

\- \*\*P2\*\* PWA installability + offline manifest

