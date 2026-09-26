import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, ShoppingBag, PiggyBank, Settings2 } from "lucide-react";
import Dropzone from "./Dropzone";

const tabs = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
    { to: "/receipts", label: "Receipts", icon: Receipt, testid: "nav-receipts" },
    { to: "/products", label: "Products", icon: ShoppingBag, testid: "nav-products" },
    { to: "/savings", label: "Savings", icon: PiggyBank, testid: "nav-savings" },
    { to: "/data", label: "Data", icon: Settings2, testid: "nav-data" },
];

export default function Header({ onImported }) {
    return (
        <header
            data-testid="app-header"
            className="sticky top-0 z-40 w-full border-b border-stoneBorder bg-paper/85 backdrop-blur-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-stone-900 grid place-items-center shadow-sm">
                        <span className="font-display font-extrabold text-emerald-400 text-lg">k</span>
                    </div>
                    <div>
                        <div className="font-display text-lg font-bold leading-none text-stone-900">
                            Kassabon
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                            spending · savings · receipts
                        </div>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-white/60 border border-stoneBorder rounded-full p-1 shadow-sm">
                    {tabs.map((t) => (
                        <NavLink
                            key={t.to}
                            to={t.to}
                            end={t.to === "/"}
                            data-testid={t.testid}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive
                                    ? "bg-stone-900 text-white shadow-sm"
                                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                }`
                            }
                        >
                            <t.icon className="h-4 w-4" />
                            <span>{t.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="flex-shrink-0">
                    <Dropzone compact onImported={onImported} />
                </div>
            </div>

            {/* mobile nav */}
            <div className="md:hidden border-t border-stoneBorder overflow-x-auto">
                <div className="flex items-center gap-1 px-3 py-2 min-w-max">
                    {tabs.map((t) => (
                        <NavLink
                            key={t.to}
                            to={t.to}
                            end={t.to === "/"}
                            data-testid={`${t.testid}-mobile`}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isActive
                                    ? "bg-stone-900 text-white"
                                    : "text-stone-600 hover:bg-stone-100"
                                }`
                            }
                        >
                            <t.icon className="h-3.5 w-3.5" />
                            {t.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </header>
    );
}