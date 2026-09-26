// Realistic Belgian/Dutch supermarket receipts (Colruyt/Albert Heijn/Jumbo/Lidl)
const STORES = ["COLRUYT", "ALBERT HEIJN", "JUMBO", "LIDL", "PLUS"];
const CATEGORIES = [
    { Soort: "Zuivel", Groep: "Voeding", items: [["emmental", "franse emmental geraspt", "BONI"], ["mozzarella", "mozzarella di bufala", "BONI"], ["yoghurt", "griekse yoghurt 500g", "CAMPINA"], ["melk", "halfvolle melk 1L", "AH"]] },
    { Soort: "Fruit", Groep: "Voeding", items: [["kiwi", "kiwi gold bio 1st", ""], ["appel", "jonagold 1kg", ""], ["banaan", "chiquita 1kg", "CHIQUITA"]] },
    { Soort: "Groente", Groep: "Voeding", items: [["tomaat", "trostomaat 500g", ""], ["sla", "ijsbergsla per stuk", ""], ["wortel", "wortelen bio 1kg", ""]] },
    { Soort: "Bakkerij", Groep: "Voeding", items: [["brood", "volkorenbrood gesneden", "BONI"], ["croissant", "croissants 4st", ""], ["pistolet", "witte pistolets 6st", ""]] },
    { Soort: "Houdbaar", Groep: "Voeding", items: [["pasta", "spaghetti 500g", "BARILLA"], ["rijst", "basmati rijst 1kg", "BONI"], ["olie", "olijfolie extra vergine 500ml", "BERTOLLI"]] },
    { Soort: "Dranken", Groep: "Voeding", items: [["water", "spa reine 6x1.5L", "SPA"], ["cola", "coca cola 6x33cl", "COCA COLA"], ["bier", "jupiler 6x33cl", "JUPILER"]] },
    { Soort: "Non-Food", Groep: "Huishoud", items: [["wc-papier", "toiletpapier 12rol", "BONI"], ["afwas", "dreft afwasmiddel 1L", "DREFT"]] },
];

function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
function rInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rFloat(a, b, d = 2) { return Math.round((a + Math.random() * (b - a)) * 10 ** d) / 10 ** d; }

export function generateSampleData({ receipts = 30, monthsBack = 5 } = {}) {
    const rows = [];
    const today = new Date();
    let afsId = 18000;
    let itemLine = 0;
    for (let r = 0; r < receipts; r++) {
        const daysBack = rInt(0, monthsBack * 30);
        const d = new Date(today);
        d.setDate(d.getDate() - daysBack);
        const iso = d.toISOString().slice(0, 10);
        const month = iso.slice(0, 7);
        const store = rand(STORES);
        const address = store === "COLRUYT" ? "05 BOERETANG" : "01 CENTRUM";
        const afId = afsId++;
        const ticketTotal = rFloat(15, 120);
        const itemsInReceipt = rInt(3, 10);
        for (let i = 0; i < itemsInReceipt; i++) {
            const cat = rand(CATEGORIES);
            const [product, omschrijving, merk] = rand(cat.items);
            const qty = rInt(1, 4);
            const price = rFloat(0.5, 12);
            const hasDisc = Math.random() < 0.28;
            const discPct = hasDisc ? rand([15, 20, 25, 33, 50]) : 0;
            const totaal = Math.round(price * qty * 100) / 100;
            const voordeel = Math.round(totaal * (discPct / 100) * 100) / 100;
            const totaalPlus = Math.round((totaal - voordeel) * 100) / 100;
            itemLine++;
            rows.push({
                id: `${afId}|${1000 + itemLine}|${iso}|${i + 1}`,
                AfschriftID: afId,
                ArtikelID: 1000 + itemLine,
                "#": qty,
                Prijs: price,
                Korting: discPct,
                Voordeel: voordeel,
                Extra: 0,
                Leeggoed: 0,
                Excl: 0,
                Tax: 0,
                Incl: 0,
                EH: "stuk",
                Product: product,
                Omschrijving: omschrijving,
                Totaal: totaal,
                "Totaal+": totaalPlus,
                Ticket: ticketTotal,
                Datum: iso,
                DatumISO: iso,
                DatumRaw: iso,
                Month: month,
                Bruto: price,
                Netto: Math.round(price * (1 - discPct / 100) * 100) / 100,
                "€": 0,
                kg: 0,
                stuk: qty,
                Merk: merk,
                Verpakking: "",
                Adres: address,
                Soort: cat.Soort,
                GrID: cat.Groep,
                Groep: cat.Groep,
                Keten: store,
                Post: `${store} DEMO`,
                Commentaar: "",
                Mededeling: "",
                Gratis: false,
                Offerte: false,
                Aankoop: null,
                HasDiscount: voordeel > 0,
            });
        }
    }
    return rows;
}