import React from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { ChevronLeft, ChevronRight, History } from "lucide-react";

interface Transaction {
    id: string;
    amount: number;
    notes: string | null;
    created_at: string;
    tromol_box?: {
        id: string;
        name: string;
    };
    creator?: {
        id: string;
        name: string;
    };
}

interface Meta {
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface PaginationData {
    data: Transaction[];
    meta: Meta;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function TromolHistory({
    auth,
    transactions,
}: PageProps<{ transactions: PaginationData }>) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const cleanHtmlEntities = (str: string) => {
        if (!str) return "";
        return str
            .replace(/&laquo;/g, "«")
            .replace(/&raquo;/g, "»")
            .replace(/&amp;/g, "&")
            .replace(/Previous/g, "")
            .replace(/Next/g, "");
    };

    return (
        <AppLayout title="Tromol">
            <Head title="Riwayat Input Tromol" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Riwayat Setoran Tromol
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Pencatatan histori penerimaan infaq dari kotak tromol
                        dan kotak QRIS.
                    </p>
                </div>
                <Link
                    href={route("tromol.index")}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Kembali ke Daftar Tromol
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left align-middle">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Tanggal & Waktu</th>
                                <th className="px-6 py-4">Kotak Tromol</th>
                                <th className="px-6 py-4">Petugas Input</th>
                                <th className="px-6 py-4">Catatan</th>
                                <th className="px-6 py-4 text-right">
                                    Nominal Setoran
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {transactions.data.length > 0 ? (
                                transactions.data.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {new Date(
                                                trx.created_at,
                                            ).toLocaleString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                {trx.tromol_box?.name || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-slate-600">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mr-2">
                                                    {(trx.creator?.name || "?")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                {trx.creator?.name || "Sistem"}
                                            </div>
                                        </td>
                                        <td
                                            className="px-6 py-4 text-slate-600 max-w-xs truncate"
                                            title={trx.notes || ""}
                                        >
                                            {trx.notes || (
                                                <span className="italic text-slate-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600 text-base">
                                            + {formatCurrency(trx.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <History className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600">
                                                Belum ada riwayat setoran
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Data setoran dari kolektor kotak
                                                tromol akan muncul di sini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.data.length > 0 && transactions.meta && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.meta?.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.meta?.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.meta?.total || 0}
                            </span>{" "}
                            data
                        </div>
                        <div className="flex space-x-2">
                            {transactions.prev_page_url ? (
                                <Link
                                    href={transactions.prev_page_url}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </Link>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronLeft size={16} />
                                </span>
                            )}

                            <div className="hidden sm:flex space-x-1 mx-2">
                                {transactions.meta?.links &&
                                    transactions.meta.links
                                        .filter(
                                            (l) =>
                                                !l.label.includes("Previous") &&
                                                !l.label.includes("Next") &&
                                                cleanHtmlEntities(l.label) !==
                                                    "",
                                        )
                                        .map((link, idx) =>
                                            link.url ? (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? "bg-slate-800 text-white"
                                                            : "text-slate-600 hover:bg-slate-200 bg-slate-100/50"
                                                    }`}
                                                >
                                                    {cleanHtmlEntities(
                                                        link.label,
                                                    )}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400"
                                                >
                                                    {cleanHtmlEntities(
                                                        link.label,
                                                    )}
                                                </span>
                                            ),
                                        )}
                            </div>

                            {transactions.next_page_url ? (
                                <Link
                                    href={transactions.next_page_url}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </Link>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronRight size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
