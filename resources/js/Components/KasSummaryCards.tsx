import React from "react";
import { Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react";

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
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 md:grid-cols-3";

    return (
        <div className={`grid ${gridCols} gap-6 ${className}`}>
            {/* Total Saldo Kas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-green-50 rounded-xl">
                        <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                    Total Saldo Kas
                </p>
                {loading ? (
                    <Skeleton className="h-8 w-32 mt-auto" />
                ) : (
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatter(totalSaldo)}
                    </h4>
                )}
            </div>

            {/* Pemasukan Bulan Ini */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    {monthLabel && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            {monthLabel}
                        </span>
                    )}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                    Pemasukan Bulan Ini
                </p>
                {loading ? (
                    <Skeleton className="h-8 w-28 mt-auto" />
                ) : (
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatter(pemasukanBulanIni)}
                    </h4>
                )}
            </div>

            {/* Pengeluaran Bulan Ini */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-red-50 rounded-xl">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    {monthLabel && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            {monthLabel}
                        </span>
                    )}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                    Pengeluaran Bulan Ini
                </p>
                {loading ? (
                    <Skeleton className="h-8 w-28 mt-auto" />
                ) : (
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatter(pengeluaranBulanIni)}
                    </h4>
                )}
            </div>

            {/* Surplus / Defisit (optional card ke-4) */}
            {hasSurplus && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className={`p-2.5 rounded-xl ${isPositive ? "bg-blue-50" : "bg-orange-50"}`}
                        >
                            <Activity
                                className={`w-5 h-5 ${isPositive ? "text-blue-600" : "text-orange-600"}`}
                            />
                        </div>
                        {monthLabel && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                                {monthLabel}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        {isPositive ? "Surplus" : "Defisit"} Bersih
                    </p>
                    {loading ? (
                        <Skeleton className="h-8 w-28 mt-auto" />
                    ) : (
                        <h4
                            className={`text-2xl font-bold mt-auto ${isPositive ? "text-blue-600" : "text-orange-600"}`}
                        >
                            {surplusDefisit! > 0 ? "+" : ""}
                            {formatter(surplusDefisit!)}
                        </h4>
                    )}
                </div>
            )}
        </div>
    );
}
