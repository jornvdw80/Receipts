export const EUR = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const fmtEUR = (n) => EUR.format(Number(n || 0));
export const fmtNum = (n, digits = 0) =>
    new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(Number(n || 0));

export const fmtPct = (n) =>
    `${new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(Number(n || 0))}%`;

export function fmtDate(iso) {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat("nl-NL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(d);
    } catch {
        return iso;
    }
}

export function monthLabel(monthKey) {
    if (!monthKey) return "—";
    const [y, m] = monthKey.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return new Intl.DateTimeFormat("nl-NL", {
        month: "short",
        year: "numeric",
    }).format(d);
}