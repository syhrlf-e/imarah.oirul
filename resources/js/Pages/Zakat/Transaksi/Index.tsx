import { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import EmptyState from "@/Components/EmptyState";
import ZakatForm from "./Components/ZakatForm";
import {
    Plus,
    Search,
    Wallet,
    Calculator,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    SlidersHorizontal,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatter";
import { Link } from "@inertiajs/react";

interface Transaction {
    id: string;
    created_at: string;
    donatur_name: string;
    category: string;
    amount: number;
    payment_method: string;
    notes: string | null;
    status: string;
}

interface Muzakki {
    id: string;
    name: string;
}

interface Meta {
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[]; // Or a specific array type if needed
        meta: Meta;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    muzakkis: Muzakki[];
}

export default function Index({ transactions, muzakkis }: Props) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const categoryLabel = (cat: string) => {
        return cat === "zakat_maal" ? "Zakat Maal" : "Zakat Fitrah";
    };

    const paymentLabel = (method: string) => {
        switch (method) {
            case "tunai":
                return "Tunai";
            case "transfer":
                return "Transfer";
            case "qris":
                return "QRIS";
            default:
                return method;
        }
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
        <AppLayout title="Pengelola Zakat">
            <Head title="Transaksi Zakat" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Riwayat Zakat
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Pencatatan pemasukan Zakat Maal dan Zakat Fitrah dari
                        para jamaah.
                    </p>
                </div>
                {transactions.data.length > 0 && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Catat Zakat
                    </button>
                )}
            </div>

            <div className="mb-2 relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm"
                            placeholder="Cari transaksi..."
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() =>
                                setSortAlpha(
                                    sortAlpha === "a-z" ? "z-a" : "a-z",
                                )
                            }
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                        >
                            <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                            {sortAlpha === "a-z" ? "A-Z" : "Z-A"}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setSortOrder(
                                    sortOrder === "terbaru"
                                        ? "terlama"
                                        : "terbaru",
                                )
                            }
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
                            {sortOrder === "terbaru" ? "Terbaru" : "Terlama"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left align-middle">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">
                                    Tanggal Penerimaan
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Nama Muzakki
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Jenis Zakat
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Metode Bayar
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Keterangan
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                >
                                    Nominal
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
                                            {trx.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3">
                                                    {trx.donatur_name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-800">
                                                    {trx.donatur_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                                                    trx.category ===
                                                    "zakat_maal"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                                                }`}
                                            >
                                                {categoryLabel(trx.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                                {paymentLabel(
                                                    trx.payment_method,
                                                )}
                                            </span>
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
                                            {formatRupiah(trx.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12">
                                        <EmptyState
                                            message="Belum ada riwayat transaksi zakat yang tercatat."
                                            actionLabel="Catat Zakat Perdana"
                                            onAction={() => setIsFormOpen(true)}
                                        />
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
                                {transactions.meta.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.meta.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.meta.total || 0}
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
                                {transactions.meta.links &&
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

            <ZakatForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                muzakkis={muzakkis}
            />
        </AppLayout>
    );
}
