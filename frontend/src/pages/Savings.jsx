import React, { useMemo } from "react";
import { useData } from "./state/DataContext";
import { fmtEUR, fmtPct, monthLabel, fmtDate } from "./lib/format";
import StatCard from "./components/StatCard";
import { PiggyBank, Tag, TrendingUp, Trophy } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function Savings() {
    const { items } = useData();

    const stats = useMemo(() => {
        const totalSaved = items.reduce((s, r) => s + Number(r.Voordeel || 0), 0);
        const grossSpend = items.reduce((s, r) => s + Number(r.Totaal || 0), 0);
        const discountedCount = items.filter((r) => Number(r.Voordeel || 0) > 0).length;
        const pct = grossSpend > 0 ? (totalSaved / grossSpend) * 100 : 0;
        return { totalSaved, discountedCount, pct, grossSpend };
    }, [items]);

    const byMonth = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const m = r.Month;
            if (!m) continue;
            map.set(m, (map.get(m) || 0) + Number(r.Voordeel || 0));
        }
        return Array.from(map.entries())
            .map(([month, saved]) => ({ month, label: monthLabel(month), saved }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [items]);

    const byKeten = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const k = r.Keten || "—";
            const cur = map.get(k) || { keten: k, saved: 0, spend: 0 };
            cur.saved += Number(r.Voordeel || 0);
            cur.spend += Number(r.Totaal || 0);
            map.set(k, cur);
        }
        return Array.from(map.values())
            .map((x) => ({ ...x, pct: x.spend > 0 ? (x.saved / x.spend) * 100 : 0 }))
            .sort((a, b) => b.saved - a.saved);
    }, [items]);

    const leaderboard = useMemo(() => {
        return items
            .filter((r) => Number(r.Voordeel || 0) > 0)
            .slice()
            .sort((a, b) => Number(b.Voordeel || 0) - Number(a.Voordeel || 0))
            .slice(0, 10);
    }, [items]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Savings</h1>
                <p className="text-sm text-stone-500 mt-1">Every euro of Voordeel you clipped, grouped and ranked.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total saved" value={fmtEUR(stats.totalSaved)} accent icon={PiggyBank} testid="savings-total" />
                <StatCard label="Discount rate" value={fmtPct(stats.pct)} hint="vs bruto spend" icon={TrendingUp} testid="savings-rate" />
                <StatCard label="Discounted items" value={stats.discountedCount.toLocaleString("nl-NL")} icon={Tag} testid="savings-items" />
                <StatCard label="Bruto spend" value={fmtEUR(stats.grossSpend)} hint="Before Voordeel" testid="savings-gross" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm">
                    <h3 className="font-display font-bold text-stone-900 mb-4">Savings by month</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byMonth}>
                                <CartesianGrid stroke="#E7E2D8" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} width={50} />
                                <Tooltip formatter={(v) => fmtEUR(v)} contentStyle={{ background: "#FFFDF9", border: "1px solid #E7E2D8", borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="saved" fill="#059669" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-5 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm">
                    <h3 className="font-display font-bold text-stone-900 mb-4">Savings by store</h3>
                    <ol className="space-y-2">
                        {byKeten.slice(0, 8).map((k, i) => (
                            <li key={k.keten} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-mono text-xs text-stone-400 w-5">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="text-sm text-stone-800 truncate">{k.keten}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-semibold text-emerald-700 text-sm">{fmtEUR(k.saved)}</div>
                                    <div className="text-[11px] text-stone-500 font-mono">{fmtPct(k.pct)}</div>
                                </div>
                            </li>
                        ))}
                        {byKeten.length === 0 && <li className="text-sm text-stone-500">No data.</li>}
                    </ol>
                </div>

                <div data-testid="savings-leaderboard" className="lg:col-span-12 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-display font-bold text-stone-900">Top 10 highest discounts</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-stone-500 border-b border-stoneBorder">
                                    <th className="py-2 pr-2">#</th>
                                    <th className="py-2 pr-2">Datum</th>
                                    <th className="py-2 pr-2">Store</th>
                                    <th className="py-2 pr-2">Product</th>
                                    <th className="py-2 pr-2 text-right">Prijs</th>
                                    <th className="py-2 pr-2 text-right">Korting %</th>
                                    <th className="py-2 pr-2 text-right">Voordeel €</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((r, i) => (
                                    <tr key={r.id} className="border-b border-stone-100 last:border-0">
                                        <td className="py-2 pr-2 font-mono text-stone-400 text-xs">{String(i + 1).padStart(2, "0")}</td>
                                        <td className="py-2 pr-2 font-mono text-xs text-stone-600 whitespace-nowrap">{fmtDate(r.DatumISO)}</td>
                                        <td className="py-2 pr-2 text-stone-700 text-xs">{r.Keten || "—"}</td>
                                        <td className="py-2 pr-2">
                                            <div className="text-stone-900 font-medium">{r.Product}</div>
                                            {r.Omschrijving && <div className="text-xs text-stone-500">{r.Omschrijving}</div>}
                                        </td>
                                        <td className="py-2 pr-2 text-right font-mono">{fmtEUR(r.Prijs)}</td>
                                        <td className="py-2 pr-2 text-right font-mono">{fmtPct(r.Korting)}</td>
                                        <td className="py-2 pr-2 text-right font-mono font-semibold text-emerald-700">{fmtEUR(r.Voordeel)}</td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr><td colSpan={7} className="py-8 text-center text-stone-500">No discounts yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
