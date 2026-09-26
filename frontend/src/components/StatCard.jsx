import React from "react";

export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    accent = false,
    testid,
}) {
    return (
        <div
            data-testid={testid}
            className={`relative overflow-hidden rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${accent
                    ? "bg-gradient-to-br from-emerald50soft to-paperCard border-emerald-200"
                    : "bg-paperCard border-stoneBorder"
                }`}
        >
            <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-stone-500">
                    {label}
                </span>
                {Icon && (
                    <div
                        className={`w-8 h-8 rounded-lg grid place-items-center ${accent
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-stone-100 text-stone-600"
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                )}
            </div>
            <div className="mt-4 font-mono font-extrabold tracking-tight text-stone-900 text-2xl sm:text-3xl">
                {value}
            </div>
            {hint && (
                <div className="mt-1.5 text-xs text-stone-500 font-medium">{hint}</div>
            )}
        </div>
    );
}