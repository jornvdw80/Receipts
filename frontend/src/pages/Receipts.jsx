import React, { useMemo, useState } from "react";
import { useData } from "@/state/DataContext";
import { fmtEUR, fmtDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, Receipt as ReceiptIcon, Tag } from "lucide-react";

export default function Receipts() {
    const { items } = useData();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState({});

    const grouped = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const key = `${r.AfschriftID}|${r.DatumISO}|${r.Keten}`;
            const cur = map.get(key) || {
                key,
                afschrift: r.AfschriftID,
                datum: r.DatumISO,
                keten: r.Keten,
                adres: r.Adres,
                ticket: Number(r.Ticket || 0),
                total: 0,
                saved: 0,
                rows: [],
            };
            cur.total += Number(r["Totaal+"] || r.Totaal || 0);
            cur.saved += Number(r.Voordeel || 0);
            cur.rows.push(r);
            map.set(key, cur);
        }
        let arr = Array.from(map.values()).sort((a, b) =>
            (b.datum || "").localeCompare(a.datum || "")
        );
        const qLow = q.trim().toLowerCase();
        if (qLow) {
            arr = arr.filter((g) => {
                return (
                    String(g.afschrift || "").includes(qLow) ||
                    (g.keten || "").toLowerCase().includes(qLow) ||
                    (g.datum || "").includes(qLow) ||
                    g.rows.some((r) =>
                        `${r.Product || ""} ${r.Omschrijving || ""}`.toLowerCase().includes(qLow)
                    )
                );
            });
        }
        return arr;
    }, [items, q]);

    return (
        <div className="space-y-5 animate-fade-in-up">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Receipts</h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {grouped.length} receipts · grouped by AfschriftID · Datum · Keten
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                    <Input
                        data-testid="receipts-search"
                        placeholder="Search receipt, store, product…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-8 bg-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                {grouped.map((g) => {
                    const isOpen = !!open[g.key];
                    return (
                        <div
                            key={g.key}
                            data-testid={`receipt-group-${g.afschrift}`}
                            className="bg-paperCard border border-stoneBorder rounded-xl shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() => setOpen((o) => ({ ...o, [g.key]: !isOpen }))}
                                className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-stone-50 transition-colors"
                                data-testid={`receipt-toggle-${g.afschrift}`}
                            >
                                <div className="w-9 h-9 rounded-lg bg-stone-100 grid place-items-center flex-shrink-0">
                                    <ReceiptIcon className="h-4 w-4 text-stone-600" />
                                </div>
                                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                                    <div>
                                        <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                                            {g.keten || "—"}
                                        </div>
                                        <div className="text-sm text-stone-800 truncate">
                                            {g.adres || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono uppercase tracking-widest text-stone-500">Datum</div>
                                        <div className="text-sm text-stone-800">{fmtDate(g.datum)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono uppercase tracking-widest text-stone-500">Afschrift</div>
                                        <div className="text-sm font-mono text-stone-700">#{g.afschrift}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-semibold text-stone-900">{fmtEUR(g.total)}</div>
                                        {g.saved > 0 && (
                                            <div className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                                                <Tag className="h-3 w-3" /> {fmtEUR(g.saved)} saved
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isOpen ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                            </button>
                            {isOpen && (
                                <div className="border-t border-stone-100 bg-stone-50/40 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-stone-500">
                                                <th className="px-4 py-2">Product</th>
                                                <th className="px-4 py-2">Merk</th>
                                                <th className="px-4 py-2">Soort</th>
                                                <th className="px-4 py-2 text-right">Prijs</th>
                                                <th className="px-4 py-2 text-right">Qty</th>
                                                <th className="px-4 py-2 text-right">Voordeel</th>
                                                <th className="px-4 py-2 text-right">Totaal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {g.rows.map((r) => (
                                                <tr key={r.id} className="border-t border-stone-100">
                                                    <td className="px-4 py-2">
                                                        <div className="text-stone-900 font-medium">{r.Product || "—"}</div>
                                                        {r.Omschrijving && <div className="text-xs text-stone-500">{r.Omschrijving}</div>}
                                                    </td>
                                                    <td className="px-4 py-2 text-stone-700 text-xs">{r.Merk || "—"}</td>
                                                    <td className="px-4 py-2 text-stone-700 text-xs">{r.Soort || "—"}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{fmtEUR(r.Prijs)}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{r["#"] || 1}</td>
                                                    <td className={`px-4 py-2 text-right font-mono ${Number(r.Voordeel || 0) > 0 ? "text-emerald-700 font-semibold" : "text-stone-400"}`}>
                                                        {Number(r.Voordeel || 0) > 0 ? fmtEUR(r.Voordeel) : "—"}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-mono font-semibold text-stone-900">{fmtEUR(r["Totaal+"] || r.Totaal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
                {grouped.length === 0 && (
                    <div className="text-center py-16 text-stone-500 text-sm">
                        No receipts imported yet.
                    </div>
                )}
            </div>
        </div>
    );
}