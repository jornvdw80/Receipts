import React, { useRef, useState } from "react";
import { useData } from "@/state/DataContext";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, RotateCcw, FileUp, Sparkles, ShieldCheck, HardDrive } from "lucide-react";
import { db, bulkUpsertItems, clearAll } from "@/db";
import { toCSV } from "@/lib/parse";
import { generateSampleData } from "@/lib/sampleData";
import { toast } from "sonner";

function saveBlob(blob, filename) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function DataControls() {
    const { items, bump } = useData();
    const restoreRef = useRef(null);
    const [busy, setBusy] = useState(false);

    const exportJSON = () => {
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            count: items.length,
            items,
        };
        saveBlob(
            new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
            `kassabon_backup_${new Date().toISOString().slice(0, 10)}.json`
        );
        toast.success(`Exported ${items.length} records`);
    };

    const exportCSV = () => {
        const csv = toCSV(items);
        saveBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `kassabon_all_${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success(`Exported ${items.length} rows to CSV`);
    };

    const onRestore = async (files) => {
        if (!files || !files[0]) return;
        setBusy(true);
        try {
            const text = await files[0].text();
            const parsed = JSON.parse(text);
            const rows = Array.isArray(parsed) ? parsed : parsed.items || [];
            if (!rows.length) throw new Error("No records found in file");
            await bulkUpsertItems(rows);
            toast.success(`Restored ${rows.length} records`);
            bump();
        } catch (e) {
            toast.error("Restore failed", { description: e.message });
        } finally {
            setBusy(false);
        }
    };

    const doReset = async () => {
        await clearAll();
        toast.success("All local data wiped");
        bump();
    };

    const loadDemo = async () => {
        setBusy(true);
        try {
            const rows = generateSampleData({ receipts: 40, monthsBack: 6 });
            await bulkUpsertItems(rows);
            toast.success(`Added ${rows.length} demo items`);
            bump();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up max-w-4xl">
            <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Data</h1>
                <p className="text-sm text-stone-500 mt-1">Backup, restore, or wipe. Everything is local to this browser.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-stoneBorder bg-paperCard p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-stone-900">Privacy</h3>
                            <p className="text-sm text-stone-600 mt-1">
                                Everything lives in IndexedDB on this device. Nothing is uploaded, nothing is tracked. Backup regularly if this matters to you.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-stoneBorder bg-paperCard p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 grid place-items-center">
                            <HardDrive className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-stone-900">Storage</h3>
                            <p className="text-sm text-stone-600 mt-1">
                                <span className="font-mono">{items.length.toLocaleString("nl-NL")}</span> line items currently stored locally.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-stoneBorder bg-paperCard shadow-sm divide-y divide-stone-100">
                <Row
                    title="Export backup (JSON)"
                    desc="Full dump of every row. Keep it safe — this is your only recovery path if you clear the browser."
                    action={
                        <Button data-testid="export-json-button" onClick={exportJSON} disabled={!items.length} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
                            <Download className="h-4 w-4" /> Download JSON
                        </Button>
                    }
                />
                <Row
                    title="Export all as CSV"
                    desc="Universal spreadsheet format with all Dutch column names preserved."
                    action={
                        <Button data-testid="export-all-csv-button" onClick={exportCSV} disabled={!items.length} variant="outline" className="border-stoneBorder rounded-lg gap-2">
                            <Download className="h-4 w-4" /> Download CSV
                        </Button>
                    }
                />
                <Row
                    title="Restore from backup"
                    desc="Merges records with what's already stored. Duplicates auto-skipped."
                    action={
                        <>
                            <input ref={restoreRef} data-testid="restore-input" type="file" accept=".json" className="hidden" onChange={(e) => onRestore(e.target.files)} />
                            <Button data-testid="restore-button" onClick={() => restoreRef.current?.click()} disabled={busy} variant="outline" className="border-stoneBorder rounded-lg gap-2">
                                <Upload className="h-4 w-4" /> Choose JSON file
                            </Button>
                        </>
                    }
                />
                <Row
                    title="Load demo data"
                    desc="Add 40 realistic Belgian/Dutch supermarket receipts across 6 months — great for testing."
                    action={
                        <Button data-testid="load-demo-button" onClick={loadDemo} disabled={busy} variant="outline" className="border-stoneBorder rounded-lg gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600" /> Load demo
                        </Button>
                    }
                />
                <Row
                    title="Reset everything"
                    desc="Wipe the local database. This cannot be undone. Export a backup first."
                    action={
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button data-testid="reset-button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 rounded-lg gap-2">
                                    <RotateCcw className="h-4 w-4" /> Reset local data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Wipe local data?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will delete all {items.length.toLocaleString("nl-NL")} line items in this browser. Make sure you exported a backup first — there is no cloud copy.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel data-testid="reset-cancel">Cancel</AlertDialogCancel>
                                    <AlertDialogAction data-testid="reset-confirm" className="bg-red-600 hover:bg-red-700" onClick={doReset}>
                                        Yes, wipe it
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    }
                />
            </div>
        </div>
    );
}

function Row({ title, desc, action }) {
    return (
        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex-1">
                <div className="font-display font-bold text-stone-900">{title}</div>
                <div className="text-sm text-stone-600 mt-0.5">{desc}</div>
            </div>
            <div className="flex-shrink-0">{action}</div>
        </div>
    );
}