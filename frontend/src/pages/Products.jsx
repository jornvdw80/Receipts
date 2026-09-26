import React, { useMemo, useState } from "react";
import { useData } from "./state/DataContext";
import { fmtEUR, fmtDate } from "./lib/format";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, Download, X, ArrowUpDown, Tag } from "lucide-react";
import { toCSV } from "@/lib/parse";
import { toast } from "sonner";

const ALL = "__all__";
const PAGE_SIZE = 50;

function saveBlob(blob, filename) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function Products() {
    const { items } = useData();

    const [q, setQ] = useState("");
    const [keten, setKeten] = useState(ALL);
    const [soort, setSoort] = useState(ALL);
    const [merk, setMerk] = useState(ALL);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [onlyDiscount, setOnlyDiscount] = useState(false);
    const [excludeNonGrocery, setExcludeNonGrocery] = useState(false);
    const [sort, setSort] = useState({ key: "Datum", dir: "desc" });
    const [page, setPage] = useState(0);

    const ketens = useMemo(() => Array.from(new Set(items.map((i) => i.Keten).filter(Boolean))).sort(), [items]);
    const soorten = useMemo(() => Array.from(new Set(items.map((i) => i.Soort).filter(Boolean))).sort(), [items]);
    const merken = useMemo(() => Array.from(new Set(items.map((i) => i.Merk).filter(Boolean))).sort(), [items]);

    const filtered = useMemo(() => {
        const qLow = q.trim().toLowerCase();
        const min = minPrice === "" ? -Infinity : Number(minPrice);
        const max = maxPrice === "" ? Infinity : Number(maxPrice);
        const from = dateFrom ? dateFrom : null;
        const to = dateTo ? dateTo : null;
        const nonGroceryRe = /(citro[eë]n|auto|garage|mazout|benzine|diesel)/i;

        let arr = items.filter((r) => {
            if (qLow) {
                const hay = `${r.Product || ""} ${r.Omschrijving || ""} ${r.Merk || ""}`.toLowerCase();
                if (!hay.includes(qLow)) return false;
            }
            if (keten !== ALL && r.Keten !== keten) return false;
            if (soort !== ALL && r.Soort !== soort) return false;
            if (merk !== ALL && r.Merk !== merk) return false;
            const price = Number(r.Prijs || 0);
            if (price < min || price > max) return false;
            if (from && r.DatumISO && r.DatumISO < from) return false;
            if (to && r.DatumISO && r.DatumISO > to) return false;
            if (onlyDiscount && !r.HasDiscount) return false;
            if (excludeNonGrocery) {
                const label = `${r.Product || ""} ${r.Omschrijving || ""} ${r.Merk || ""} ${r.Soort || ""}`;
                if (nonGroceryRe.test(label)) return false;
            }
            return true;
        });

        arr = arr.slice().sort((a, b) => {
            const av = a[sort.key] ?? "";
            const bv = b[sort.key] ?? "";
            if (typeof av === "number" && typeof bv === "number")
                return sort.dir === "asc" ? av - bv : bv - av;
            return sort.dir === "asc"
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
        return arr;
    }, [items, q, keten, soort, merk, minPrice, maxPrice, dateFrom, dateTo, onlyDiscount, excludeNonGrocery, sort]);

    const totalFiltered = filtered.length;
    const totalSpend = filtered.reduce((s, r) => s + Number(r["Totaal+"] || r.Totaal || 0), 0);
    const totalSaved = filtered.reduce((s, r) => s + Number(r.Voordeel || 0), 0);
    const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

    const toggleSort = (key) => {
        setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    };

    const activeFilterCount = [
        q,
        keten !== ALL,
        soort !== ALL,
        merk !== ALL,
        minPrice,
        maxPrice,
        dateFrom,
        dateTo,
        onlyDiscount,
        excludeNonGrocery,
    ].filter(Boolean).length;

    const resetFilters = () => {
        setQ(""); setKeten(ALL); setSoort(ALL); setMerk(ALL);
        setMinPrice(""); setMaxPrice(""); setDateFrom(""); setDateTo("");
        setOnlyDiscount(false); setExcludeNonGrocery(false); setPage(0);
    };

    const onExport = () => {
        const cols = ["Datum", "Keten", "Merk", "Product", "Omschrijving", "Soort", "Groep", "Prijs", "#", "Voordeel", "Totaal", "Totaal+", "AfschriftID", "ArtikelID"];
        const csv = toCSV(filtered, cols);
        saveBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `kassabon_filtered_${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success(`Exported ${filtered.length} rows`);
    };

    const FiltersPanel = (
        <div className="space-y-4">
            <div>
                <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">Store (Keten)</Label>
                <Select value={keten} onValueChange={(v) => { setKeten(v); setPage(0); }}>
                    <SelectTrigger data-testid="filter-keten" className="mt-1.5 bg-white"><SelectValue placeholder="All stores" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All stores</SelectItem>
                        {ketens.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">Category (Soort)</Label>
                <Select value={soort} onValueChange={(v) => { setSoort(v); setPage(0); }}>
                    <SelectTrigger data-testid="filter-soort" className="mt-1.5 bg-white"><SelectValue placeholder="All categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All categories</SelectItem>
                        {soorten.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">Brand (Merk)</Label>
                <Select value={merk} onValueChange={(v) => { setMerk(v); setPage(0); }}>
                    <SelectTrigger data-testid="filter-merk" className="mt-1.5 bg-white"><SelectValue placeholder="All brands" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All brands</SelectItem>
                        {merken.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">Min €</Label>
                    <Input data-testid="filter-min-price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1.5 bg-white" />
                </div>
                <div>
                    <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">Max €</Label>
                    <Input data-testid="filter-max-price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1.5 bg-white" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">From</Label>
                    <Input data-testid="filter-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1.5 bg-white" />
                </div>
                <div>
                    <Label className="text-xs uppercase tracking-widest font-mono text-stone-500">To</Label>
                    <Input data-testid="filter-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1.5 bg-white" />
                </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stoneBorder bg-white px-3 py-2">
                <Label htmlFor="only-discount" className="text-sm font-medium text-stone-700 cursor-pointer">Only discounted</Label>
                <Switch id="only-discount" data-testid="filter-only-discount" checked={onlyDiscount} onCheckedChange={setOnlyDiscount} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stoneBorder bg-white px-3 py-2">
                <Label htmlFor="excl-non-grocery" className="text-sm font-medium text-stone-700 cursor-pointer">Exclude non-grocery</Label>
                <Switch id="excl-non-grocery" data-testid="filter-exclude-non-grocery" checked={excludeNonGrocery} onCheckedChange={setExcludeNonGrocery} />
            </div>
            <Button variant="outline" onClick={resetFilters} data-testid="filter-reset" className="w-full border-stoneBorder">
                <X className="h-4 w-4 mr-1.5" /> Reset filters
            </Button>
        </div>
    );

    return (
        <div className="space-y-5 animate-fade-in-up">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Products</h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {totalFiltered.toLocaleString("nl-NL")} rows · {fmtEUR(totalSpend)} spent · <span className="text-emerald-700 font-medium">{fmtEUR(totalSaved)} saved</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button data-testid="export-csv-button" onClick={onExport} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* filters – desktop */}
                <aside className="hidden lg:block lg:col-span-3 space-y-4 bg-paperCard border border-stoneBorder rounded-xl p-4 shadow-sm h-fit sticky top-24">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-stone-900">Filters</h3>
                        {activeFilterCount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">{activeFilterCount}</Badge>
                        )}
                    </div>
                    {FiltersPanel}
                </aside>

                {/* main table */}
                <div className="lg:col-span-9 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 bg-paperCard border border-stoneBorder rounded-xl p-3 shadow-sm">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                            <Input
                                data-testid="search-input"
                                value={q}
                                onChange={(e) => { setQ(e.target.value); setPage(0); }}
                                placeholder="Search product, omschrijving, merk…"
                                className="pl-8 bg-white"
                            />
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button data-testid="mobile-filter-button" variant="outline" className="lg:hidden border-stoneBorder gap-1.5">
                                    <SlidersHorizontal className="h-4 w-4" /> Filters
                                    {activeFilterCount > 0 && <Badge className="ml-1 bg-emerald-100 text-emerald-700 border-0">{activeFilterCount}</Badge>}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[90vw] sm:max-w-sm bg-paper overflow-y-auto">
                                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                                <div className="mt-4">{FiltersPanel}</div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div data-testid="products-table" className="border border-stoneBorder rounded-xl overflow-hidden bg-paperCard shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-stone-100/70 border-b border-stoneBorder">
                                    <tr>
                                        {[
                                            ["Datum", "Date"],
                                            ["Keten", "Store"],
                                            ["Product", "Product"],
                                            ["Merk", "Brand"],
                                            ["Soort", "Category"],
                                            ["Prijs", "Price"],
                                            ["#", "Qty"],
                                            ["Voordeel", "Saved"],
                                            ["Totaal+", "Total"],
                                        ].map(([k, l]) => (
                                            <th key={k} onClick={() => toggleSort(k)} className="text-left px-3 py-2.5 font-mono text-[11px] uppercase tracking-widest text-stone-600 cursor-pointer select-none">
                                                <span className="inline-flex items-center gap-1">
                                                    {l}
                                                    <ArrowUpDown className={`h-3 w-3 ${sort.key === k ? "text-stone-900" : "text-stone-400"}`} />
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((r) => (
                                        <tr key={r.id} className="rt-row border-b border-stone-100 last:border-0">
                                            <td className="px-3 py-2 font-mono text-xs text-stone-600 whitespace-nowrap">{fmtDate(r.DatumISO)}</td>
                                            <td className="px-3 py-2 text-stone-800">{r.Keten || "—"}</td>
                                            <td className="px-3 py-2">
                                                <div className="text-stone-900 font-medium">{r.Product || "—"}</div>
                                                {r.Omschrijving && <div className="text-xs text-stone-500 truncate max-w-xs">{r.Omschrijving}</div>}
                                            </td>
                                            <td className="px-3 py-2 text-stone-700 text-xs">{r.Merk || "—"}</td>
                                            <td className="px-3 py-2 text-stone-700 text-xs">{r.Soort || "—"}</td>
                                            <td className="px-3 py-2 text-right font-mono text-stone-800 whitespace-nowrap">{fmtEUR(r.Prijs)}</td>
                                            <td className="px-3 py-2 text-right font-mono text-stone-600">{r["#"] || 1}</td>
                                            <td className={`px-3 py-2 text-right font-mono whitespace-nowrap ${Number(r.Voordeel || 0) > 0 ? "text-emerald-700 font-semibold" : "text-stone-400"}`}>
                                                {Number(r.Voordeel || 0) > 0 ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Tag className="h-3 w-3" /> {fmtEUR(r.Voordeel)}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-semibold text-stone-900 whitespace-nowrap">{fmtEUR(r["Totaal+"] || r.Totaal)}</td>
                                        </tr>
                                    ))}
                                    {pageRows.length === 0 && (
                                        <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-stone-500">No matching rows.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-stoneBorder text-xs text-stone-600 bg-stone-50/60">
                            <div className="font-mono">
                                Page {page + 1} / {totalPages} · {totalFiltered.toLocaleString("nl-NL")} rows
                            </div>
                            <div className="flex items-center gap-1">
                                <Button data-testid="page-prev" size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="border-stoneBorder h-7">Prev</Button>
                                <Button data-testid="page-next" size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} className="border-stoneBorder h-7">Next</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
