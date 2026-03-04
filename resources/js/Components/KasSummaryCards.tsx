import React from "react";
import { Wallet, Activity, ArrowUp, ArrowDown } from "lucide-react";

interface KasSummaryCardsProps {
    totalSaldo: number;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
    surplusDefisit?: number; // optional: jika diisi maka tampilkan card ke-4
    monthLabel?: string; // optional: label badge bulan (default: bulan ini)
    loading?: boolean; // optional: tampilkan skeleton state
    className?: string;
    formatter?: (value: number) => string;
}

function formatDefault(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-slate-100 rounded animate-pulse ${className}`} />
    );
}

export default function KasSummaryCards({
    totalSaldo,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    surplusDefisit,
    monthLabel,
    loading = false,
    className = "",
    formatter = formatDefault,
}: KasSummaryCardsProps) {
    const hasSurplus = surplusDefisit !== undefined;
    const isPositive = (surplusDefisit ?? 0) >= 0;
    const gridCols = hasSurplus
        ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-2 md:grid-cols-3";

    return (
        <>
            {/* ══════════════════════════════════════
                MOBILE ONLY — 1 card besar unified
                Style: seperti surplus (bg-emerald-50 border)
                ══════════════════════════════════════ */}
            <div
                className={`block md:hidden relative overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-200 p-5 shadow-sm ${className}`}
            >
                {/* SVG Pattern — warna gelap agar kontras di bg terang */}
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-[0.12] pointer-events-none">
                    <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="80%"
                            cy="20%"
                            r="60"
                            fill="none"
                            stroke="#065f46"
                            strokeWidth="2"
                        />
                        <circle
                            cx="95%"
                            cy="50%"
                            r="90"
                            fill="none"
                            stroke="#065f46"
                            strokeWidth="2"
                        />
                        <circle
                            cx="70%"
                            cy="80%"
                            r="45"
                            fill="none"
                            stroke="#065f46"
                            strokeWidth="2"
                        />
                        <circle
                            cx="85%"
                            cy="90%"
                            r="30"
                            fill="#065f46"
                            fillOpacity="0.3"
                        />
                        <circle
                            cx="60%"
                            cy="30%"
                            r="20"
                            fill="#065f46"
                            fillOpacity="0.2"
                        />
                    </svg>
                </div>

                {/* Konten di atas SVG */}
                <div className="relative z-10">
                    {/* Header — tanpa icon Wallet */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-emerald-700 text-sm font-medium">
                            Total Saldo Kas
                        </span>
                        {monthLabel && (
                            <span className="text-emerald-600 text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                                {monthLabel}
                            </span>
                        )}
                    </div>

                    {/* Nominal saldo */}
                    {loading ? (
                        <Skeleton className="h-8 w-40 mb-4 bg-emerald-200/50" />
                    ) : (
                        <p className="text-emerald-800 text-2xl font-bold tracking-tight mb-4">
                            {formatter(totalSaldo)}
                        </p>
                    )}

                    {/* Pemasukan & Pengeluaran — tanpa kotak, hanya teks + icon */}
                    <div className="flex gap-6">
                        <div>
                            <div className="flex items-center gap-1 mb-0.5">
                                <ArrowUp
                                    size={12}
                                    className="text-emerald-600"
                                />
                                <span className="text-emerald-600 text-[11px] font-medium">
                                    Pemasukan
                                </span>
                            </div>
                            {loading ? (
                                <Skeleton className="h-5 w-24 bg-emerald-200/50" />
                            ) : (
                                <p className="text-emerald-700 text-sm font-semibold">
                                    {formatter(pemasukanBulanIni)}
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-0.5">
                                <ArrowDown size={12} className="text-red-500" />
                                <span className="text-red-500 text-[11px] font-medium">
                                    Pengeluaran
                                </span>
                            </div>
                            {loading ? (
                                <Skeleton className="h-5 w-24 bg-red-100" />
                            ) : (
                                <p className="text-red-600 text-sm font-semibold">
                                    {formatter(pengeluaranBulanIni)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                DESKTOP ONLY — 3 card terpisah
                (tidak berubah dari versi repo)
                ══════════════════════════════════════ */}
            <div
                className={`hidden md:grid ${gridCols} gap-4 md:gap-6 ${className}`}
            >
                {/* Total Saldo Kas */}
                <div className="col-span-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2 md:p-2.5 bg-emerald-50 rounded-xl">
                            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">
                        Total Saldo Kas
                    </p>
                    {loading ? (
                        <Skeleton className="h-8 w-32 mt-auto" />
                    ) : (
                        <h4 className="text-xl md:text-2xl font-bold text-slate-900 mt-auto">
                            {formatter(totalSaldo)}
                        </h4>
                    )}
                </div>

                {/* Pemasukan Bulan Ini */}
                <div className="col-span-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2 md:p-2.5 bg-emerald-50 rounded-xl">
                            <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                        </div>
                        {monthLabel && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold bg-slate-100 text-slate-500">
                                {monthLabel}
                            </span>
                        )}
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">
                        Pemasukan Bln Ini
                    </p>
                    {loading ? (
                        <Skeleton className="h-6 w-24 mt-auto" />
                    ) : (
                        <h4 className="text-base md:text-2xl font-semibold md:font-bold text-emerald-600 mt-auto">
                            {formatter(pemasukanBulanIni)}
                        </h4>
                    )}
                </div>

                {/* Pengeluaran Bulan Ini */}
                <div className="col-span-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2 md:p-2.5 bg-red-50 rounded-xl">
                            <ArrowDown className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        </div>
                        {monthLabel && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold bg-slate-100 text-slate-500">
                                {monthLabel}
                            </span>
                        )}
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">
                        Pengeluaran Bln Ini
                    </p>
                    {loading ? (
                        <Skeleton className="h-6 w-24 mt-auto" />
                    ) : (
                        <h4 className="text-base md:text-2xl font-semibold md:font-bold text-red-500 mt-auto">
                            {formatter(pengeluaranBulanIni)}
                        </h4>
                    )}
                </div>

                {/* Surplus / Defisit (optional card ke-4, desktop only) */}
                {hasSurplus && (
                    <div className="col-span-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div
                                className={`p-2 md:p-2.5 rounded-xl ${isPositive ? "bg-blue-50" : "bg-orange-50"}`}
                            >
                                <Activity
                                    className={`w-4 h-4 md:w-5 md:h-5 ${isPositive ? "text-blue-600" : "text-orange-600"}`}
                                />
                            </div>
                            {monthLabel && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold bg-slate-100 text-slate-500">
                                    {monthLabel}
                                </span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">
                            {isPositive ? "Surplus" : "Defisit"} Bersih
                        </p>
                        {loading ? (
                            <Skeleton className="h-6 w-24 mt-auto" />
                        ) : (
                            <h4
                                className={`text-base md:text-2xl font-semibold md:font-bold mt-auto ${isPositive ? "text-blue-600" : "text-orange-600"}`}
                            >
                                {surplusDefisit! > 0 ? "+" : ""}
                                {formatter(surplusDefisit!)}
                            </h4>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
