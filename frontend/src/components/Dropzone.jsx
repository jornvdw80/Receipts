import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, FileUp, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { parseFile } from "../lib/parse";
import { bulkUpsertItems } from "../db";
import { generateSampleData } from "../lib/sampleData";

export default function Dropzone({ onImported, compact = false }) {
    const inputRef = useRef(null);
    const [drag, setDrag] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleFiles = useCallback(
        async (files) => {
            if (!files || files.length === 0) return;
            setBusy(true);
            try {
                let total = 0;
                for (const f of files) {
                    const rows = await parseFile(f);
                    await bulkUpsertItems(rows);
                    total += rows.length;
                }
                toast.success(`Imported ${total} line items`, {
                    description: "Data merged locally. Duplicates auto-skipped.",
                });
                onImported && onImported(total);
            } catch (e) {
                console.error(e);
                toast.error("Import failed", {
                    description: e.message || "Could not parse file.",
                });
            } finally {
                setBusy(false);
            }
        },
        [onImported]
    );

    const onDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
    };

    const loadSample = async () => {
        setBusy(true);
        try {
            const rows = generateSampleData({ receipts: 40, monthsBack: 6 });
            await bulkUpsertItems(rows);
            toast.success(`Loaded ${rows.length} demo line items`);
            onImported && onImported(rows.length);
        } finally {
            setBusy(false);
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    data-testid="import-file-input"
                    type="file"
                    accept=".xlsx,.csv,.xls"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <Button
                    data-testid="header-import-button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-lg"
                >
                    <FileUp className="h-4 w-4" /> {busy ? "Importing…" : "Import file"}
                </Button>
                <Button
                    data-testid="header-demo-button"
                    onClick={loadSample}
                    disabled={busy}
                    variant="outline"
                    className="gap-2 rounded-lg border-stoneBorder"
                >
                    <Sparkles className="h-4 w-4" /> Demo data
                </Button>
            </div>
        );
    }

    return (
        <div
            data-testid="import-dropzone"
            onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative overflow-hidden cursor-pointer border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-all group grain ${drag
                    ? "dropzone-active"
                    : "border-emerald-600/30 bg-emerald-50/20 hover:border-emerald-500 hover:bg-emerald-50/40"
                }`}
        >
            <input
                ref={inputRef}
                data-testid="import-file-input"
                type="file"
                accept=".xlsx,.csv,.xls"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-stone-900">
                Drop your Aankopen.csv or .xlsx
            </h3>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-lg mx-auto">
                Semicolon-separated CSV, Dutch column headers, EU number formats
                (<span className="font-mono">1.234,56 €</span>) — all handled automatically. Nothing is uploaded; your data stays in this browser.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                    data-testid="dropzone-browse-button"
                    disabled={busy}
                    className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                    }}
                >
                    <FileUp className="h-4 w-4" /> {busy ? "Importing…" : "Browse file"}
                </Button>
                <Button
                    data-testid="dropzone-demo-button"
                    variant="outline"
                    disabled={busy}
                    className="rounded-lg border-stoneBorder gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        loadSample();
                    }}
                >
                    <Sparkles className="h-4 w-4 text-emerald-600" /> Load demo Dutch
                    receipts
                </Button>
            </div>
            <p className="mt-4 text-xs font-mono text-stone-500">
                AfschriftID · ArtikelID · Datum · Product · Merk · Keten · Soort ·
                Korting · Voordeel · Totaal · WAAR/ONWAAR
            </p>
        </div>
    );
}
