import Dexie from "dexie";

export const db = new Dexie("receiptTrackerDB");

// Composite primary key on [AfschriftID+ArtikelID+Datum+_rowIdx] to keep line-level uniqueness
db.version(1).stores({
    items:
        "&id, AfschriftID, ArtikelID, Datum, DatumISO, Keten, Merk, Soort, Groep, Product, Voordeel, Totaal, HasDiscount, Month",
    meta: "&key",
});

export async function bulkUpsertItems(rows) {
    if (!rows || rows.length === 0) return { inserted: 0, updated: 0 };
    // Dexie put() upserts by primary key
    await db.items.bulkPut(rows);
    // Approximation: return counts (we can't cheaply know inserted vs updated without querying)
    return { inserted: rows.length, updated: 0 };
}

export async function getAllItems() {
    return db.items.toArray();
}

export async function clearAll() {
    await db.items.clear();
}