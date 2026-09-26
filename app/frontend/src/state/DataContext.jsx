import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { db } from "@/db";

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [tick, setTick] = useState(0);

    const refresh = useCallback(async () => {
        const rows = await db.items.toArray();
        setItems(rows);
        setLoaded(true);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh, tick]);

    const bump = useCallback(() => setTick((t) => t + 1), []);

    const value = useMemo(
        () => ({ items, loaded, refresh, bump }),
        [items, loaded, refresh, bump]
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used inside DataProvider");
    return ctx;
}