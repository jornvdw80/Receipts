import * as XLSX from "xlsx";

// Dutch month abbreviations -> month index (0-based)
const NL_MONTHS = {
    jan: 0, feb: 1, mrt: 2, maa: 2, mar: 2, apr: 3, mei: 4, may: 4,
    jun: 5, jul: 6, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dec: 11,
};

/** Parse EU/Dutch number: "1.234,56 А", "50,00%", "0,00 А" -> Number  */
export function parseEUNumber(v) {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    let s = String(v).trim();
    if (!s) return 0;
    // strip currency, spaces, %, thin spaces
    s = s.replace(/[А$ге%\s\u00A0]/g, "");
    // if both `.` and `,` exist, `.` is thousand sep, `,` decimal
    if (s.indexOf(",") !== -1 && s.indexOf(".") !== -1) {
        s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.indexOf(",") !== -1) {
        // only comma -> decimal comma
        s = s.replace(",", ".");
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
}

/** Parse Dutch/mixed date: "16/sep/26", "16-09-2026", "2026-09-16", Excel serial */
export function parseDate(v) {
    if (v === null || v === undefined || v === "") return null;
    if (v instanceof Date && !isNaN(v)) return v;
    if (typeof v === "number") {
        // Excel serial date
        const d = XLSX.SSF.parse_date_code(v);
        if (d) return new Date(Date.UTC(d.y, d.m - 1, d.d));
    }
    const s = String(v).trim();

    // ISO-ish YYYY-MM-DD
    let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));

    // DD/mon/YY or DD/mon/YYYY (Dutch month abbrev)
    m = s.match(/^(\d{1,2})[\s/.-]([A-Za-z]{3,4})[\s/.-](\d{2,4})$/);
    if (m) {
        const day = +m[1];
        const mon = NL_MONTHS[m[2].slice(0, 3).toLowerCase()];
        let year = +m[3];
        if (year < 100) year += 2000;
        if (mon !== undefined) return new Date(Date.UTC(year, mon, day));
    }

    // DD-MM-YYYY / DD/MM/YYYY
    m = s.match(/^(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{2,4})$/);
    if (m) {
        let year = +m[3];
        if (year < 100) year += 2000;
        return new Date(Date.UTC(year, +m[2] - 1, +m[1]));
    }

    const fallback = new Date(s);
    return isNaN(fallback) ? null : fallback;
}

export function parseBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v || "").trim().toUpperCase();
    if (s === "WAAR" || s === "TRUE" || s === "1" || s === "JA") return true;
    if (s === "ONWAAR" || s === "FALSE" || s === "0" || s === "NEE") return false;
    return null;
}

const NUMERIC_COLS = new Set([
    "Prijs", "Korting", "Voordeel", "Extra", "Leeggoed", "Excl", "Tax", "Incl",
    "Totaal", "Totaal+", "Ticket", "Bruto", "Netto", "А", "kg", "stuk", "#",
]);
const BOOL_COLS = new Set(["Gratis", "Offerte", "Aankoop"]);

function normalizeRow(raw, idx) {
    const row = {};
    for (const rawKey of Object.keys(raw)) {
        // Strip BOM & weird whitespace from headers
        const key = rawKey.replace(/^\uFEFF/, "").trim();
        const val = raw[rawKey];
        if (NUMERIC_COLS.has(key)) {
            row[key] = parseEUNumber(val);
        } else if (BOOL_COLS.has(key)) {
            row[key] = parseBool(val);
        } else if (key === "Datum") {
            const d = parseDate(val);
            row.DatumRaw = val ?? null;
            row.DatumISO = d ? d.toISOString().slice(0, 10) : null;
            row.Month = d ? row.DatumISO.slice(0, 7) : null;
            row.Datum = row.DatumISO;
        } else {
            row[key] = typeof val === "string" ? val.trim() : val;
        }
    }
    // Normalize store name casing
    if (row.Keten) row.Keten = String(row.Keten).toUpperCase();
    if (row.Merk) row.Merk = String(row.Merk).toUpperCase();

    // HasDiscount = Voordeel > 0 (actual А saved) OR Korting > 0 (%)
    row.HasDiscount = Number(row.Voordeel || 0) > 0 || Number(row.Korting || 0) > 0;

    // Composite unique id for dedup
    const afs = row.AfschriftID ?? "";
    const art = row.ArtikelID ?? "";
    const dat = row.DatumISO ?? "";
    const line = row["#"] ?? idx;
    row.id = `${afs}|${art}|${dat}|${line}`;
    return row;
}

export async function parseFile(file) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: false });
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    // Get header row to detect delimiter oddities? SheetJS handles CSV+semicolons for xlsx read of .csv.
    const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    const rows = json.map((r, i) => normalizeRow(r, i));
    return rows;
}

export async function parseCSVSemicolon(text) {
    // fallback CSV parse when a raw string is provided
    const wb = XLSX.read(text, { type: "string", FS: ";", raw: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    return json.map((r, i) => normalizeRow(r, i));
}

export function toCSV(rows, columns) {
    if (!rows || rows.length === 0) return "";
    const cols = columns || Object.keys(rows[0]).filter((k) => !k.startsWith("_"));
    const escape = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };
    const header = cols.join(";");
    const body = rows.map((r) => cols.map((c) => escape(r[c])).join(";")).join("\n");
    return header + "\n" + body;
}