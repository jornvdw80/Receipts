import React, { useMemo } from "react";
import { useData } from "@/state/DataContext";
import StatCard from "@/components/StatCard";
import Dropzone from "@/components/Dropzone";
import { fmtEUR, fmtNum, monthLabel } from "@/lib/format";
import {
    Receipt as ReceiptIcon,
    Wallet,
    PiggyBank,
    Tag,
    Store,
    TrendingUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

const CHART_COLORS = [
    "#059669", "#D97706", "#2563EB", "#7C3AED", "#DC2626", "#0891B2", "#CA8A04",
];

export default function Dashboard() {
    const { items, loaded, bump } = useData();

    const stats = useMemo(() => {
        const totalSpend = items.reduce((s, r) => s + Number(r["Totaal+"] || r.Totaal || 0), 0);
        const totalSaved = items.reduce((s, r) => s + Number(r.Voordeel || 0), 0);
        const uniqueReceipts = new Set(items.map((r) => `${r.AfschriftID}|${r.DatumISO}`));
        const avg = uniqueReceipts.size ? totalSpend / uniqueReceipts.size : 0;
        return {
            totalSpend,
            totalSaved,
            receipts: uniqueReceipts.size,
            itemsCount: items.length,
            avgOrder: avg,
        };
    }, [items]);

    const monthly = useMemo(() => {
        const byMonth = new Map();
        for (const r of items) {
            const m = r.Month || (r.DatumISO ? r.DatumISO.slice(0, 7) : null);
            if (!m) continue;
            const cur = byMonth.get(m) || { month: m, spend: 0, saved: 0 };
            cur.spend += Number(r["Totaal+"] || r.Totaal || 0);
            cur.saved += Number(r.Voordeel || 0);
            byMonth.set(m, cur);
        }
        return Array.from(byMonth.values())
            .sort((a, b) => a.month.localeCompare(b.month))
            .map((x) => ({ ...x, label: monthLabel(x.month) }));
    }, [items]);

    const byKeten = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const k = r.Keten || "—";
            map.set(k, (map.get(k) || 0) + Number(r["Totaal+"] || r.Totaal || 0));
        }
        return Array.from(map.entries())
            .map(([keten, spend]) => ({ keten, spend }))
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 8);
    }, [items]);

    const bySoort = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const k = r.Soort || "Onbekend";
            map.set(k, (map.get(k) || 0) + Number(r["Totaal+"] || r.Totaal || 0));
        }
        return Array.from(map.entries())
            .map(([soort, spend]) => ({ soort, spend }))
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 7);
    }, [items]);

    const topProducts = useMemo(() => {
        const map = new Map();
        for (const r of items) {
            const key = (r.Product || "—").toLowerCase();
            const cur = map.get(key) || {
                product: r.Product || "—",
                spend: 0,
                count: 0,
            };
            cur.spend += Number(r["Totaal+"] || r.Totaal || 0);
            cur.count += Number(r["#"] || 1);
            map.set(key, cur);
        }
        return Array.from(map.values())
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 10);
    }, [items]);

    if (loaded && items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-stoneBorder bg-paperCard px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-stone-500 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        local · client-side · zero backend
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900">
                        Your kassabonnen, but{" "}
                        <span className="text-emerald-600">searchable</span>.
                    </h1>
                    <p className="mt-3 text-stone-600 max-w-2xl mx-auto">
                        Drop your Colruyt / Albert Heijn / Jumbo export. See what you spent,
                        where, on what — and every euro you saved. Your data never leaves
                        this browser.
                    </p>
                </div>
                <Dropzone onImported={bump} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                        Dashboard
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {fmtNum(stats.itemsCount)} line items across{" "}
                        {fmtNum(stats.receipts)} receipts
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total spend"
                    value={fmtEUR(stats.totalSpend)}
                    hint="Net of discounts"
                    icon={Wallet}
                    testid="stat-total-spend"
                />
                <StatCard
                    label="Total saved"
                    value={fmtEUR(stats.totalSaved)}
                    hint={`from discounts & voordeel`}
                    icon={PiggyBank}
                    accent
                    testid="stat-total-saved"
                />
                <StatCard
                    label="Receipts"
                    value={fmtNum(stats.receipts)}
                    hint={`${fmtNum(stats.itemsCount)} line items`}
                    icon={ReceiptIcon}
                    testid="stat-receipts"
                />
                <StatCard
                    label="Avg order"
                    value={fmtEUR(stats.avgOrder)}
                    hint="Per receipt"
                    icon={TrendingUp}
                    testid="stat-avg-order"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div
                    data-testid="chart-monthly-trend"
                    className="lg:col-span-8 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-stone-900">
                            Monthly trend
                        </h3>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500">
                            spend vs savings
                        </span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                <defs>
                                    <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#292524" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#292524" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gSaved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#E7E2D8" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} width={50} />
                                <Tooltip
                                    contentStyle={{ background: "#FFFDF9", border: "1px solid #E7E2D8", borderRadius: 8, fontSize: 12 }}
                                    formatter={(v, n) => [fmtEUR(v), n === "spend" ? "Spend" : "Saved"]}
                                />
                                <Area type="monotone" dataKey="spend" stroke="#292524" strokeWidth={2} fill="url(#gSpend)" />
                                <Area type="monotone" dataKey="saved" stroke="#059669" strokeWidth={2} fill="url(#gSaved)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div
                    data-testid="chart-by-soort"
                    className="lg:col-span-4 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-stone-900">By category</h3>
                        <Tag className="h-4 w-4 text-stone-500" />
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bySoort}
                                    dataKey="spend"
                                    nameKey="soort"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={2}
                                >
                                    {bySoort.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => fmtEUR(v)} contentStyle={{ background: "#FFFDF9", border: "1px solid #E7E2D8", borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div
                    data-testid="chart-by-keten"
                    className="lg:col-span-7 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-stone-900">Spend by store</h3>
                        <Store className="h-4 w-4 text-stone-500" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byKeten} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid stroke="#E7E2D8" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#78716C" }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="keten" tick={{ fontSize: 11, fill: "#292524" }} tickLine={false} axisLine={false} width={110} />
                                <Tooltip formatter={(v) => fmtEUR(v)} contentStyle={{ background: "#FFFDF9", border: "1px solid #E7E2D8", borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="spend" fill="#059669" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div
                    data-testid="top-products"
                    className="lg:col-span-5 bg-paperCard border border-stoneBorder rounded-xl p-5 shadow-sm"
                >
                    <h3 className="font-display font-bold text-stone-900 mb-4">
                        Top 10 products by spend
                    </h3>
                    <ol className="space-y-2">
                        {topProducts.map((p, i) => (
                            <li
                                key={p.product}
                                className="flex items-center justify-between text-sm py-1.5 border-b border-stone-100 last:border-0"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-mono text-xs text-stone-400 w-5">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="truncate text-stone-800">{p.product}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-stone-500 font-mono">
                                        ×{fmtNum(p.count)}
                                    </span>
                                    <span className="font-mono font-semibold text-stone-900">
                                        {fmtEUR(p.spend)}
                                    </span>
                                </div>
                            </li>
                        ))}
                        {topProducts.length === 0 && (
                            <li className="text-sm text-stone-500">No products yet.</li>
                        )}
                    </ol>
                </div>
            </div>
        </div>
    );
}