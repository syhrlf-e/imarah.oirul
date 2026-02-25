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
    Activity,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import Pagination from "@/Components/Pagination";
import DataTable, { ColumnDef } from "@/Components/DataTable";
import { formatRupiah } from "@/utils/formatter";
import { Link, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

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

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
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

    const handlePageNav = (direction: number, url: string | null) => {
        if (!url) return;
        router.get(
            url,
            { search, sort: sortAlpha, order: sortOrder },
            { preserveState: true, preserveScroll: true },
        );
    };

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
            <Head title="Penerimaan Zakat" />

            {/* Header Section */}
            <PageHeader
                title="Penerimaan Zakat"
                description="Pencatatan pemasukan Zakat Maal dan Zakat Fitrah dari para jamaah."
            >
                {transactions.data.length > 0 && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm font-medium cursor-pointer"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Catat Penerimaan Zakat
                    </button>
                )}
            </PageHeader>

            <FilterBar
                searchPlaceholder="Cari penerimaan..."
                searchValue={search}
                onSearchChange={setSearch}
            >
                <button
                    type="button"
                    onClick={() =>
                        setSortAlpha(sortAlpha === "a-z" ? "z-a" : "a-z")
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
                            sortOrder === "terbaru" ? "terlama" : "terbaru",
                        )
                    }
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
                    {sortOrder === "terbaru" ? "Terbaru" : "Terlama"}
                </button>
            </FilterBar>

            {/* Main Content Area */}
            <DataTable
                className="flex-1 min-h-[400px]"
                tableFixed
                columns={
                    [
                        {
                            key: "tanggal",
                            header: "Tanggal Penerimaan",
                            cellClassName:
                                "whitespace-nowrap text-slate-600 font-medium",
                            render: (trx) => trx.created_at,
                        },
                        {
                            key: "muzakki",
                            header: "Nama Muzakki",
                            cellClassName: "whitespace-nowrap",
                            render: (trx) => (
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
                            ),
                        },
                        {
                            key: "jenis",
                            header: "Jenis Zakat",
                            cellClassName: "whitespace-nowrap",
                            render: (trx) => (
                                <span
                                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                                        trx.category === "zakat_maal"
                                            ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                            : "bg-green-50 text-green-700 border-green-200/50"
                                    }`}
                                >
                                    {categoryLabel(trx.category)}
                                </span>
                            ),
                        },
                        {
                            key: "metode",
                            header: "Metode Bayar",
                            cellClassName: "whitespace-nowrap",
                            render: (trx) => (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                    {paymentLabel(trx.payment_method)}
                                </span>
                            ),
                        },
                        {
                            key: "keterangan",
                            header: "Keterangan",
                            cellClassName: "text-slate-600 max-w-xs truncate",
                            render: (trx) =>
                                trx.notes || (
                                    <span className="italic text-slate-400">
                                        -
                                    </span>
                                ),
                        },
                        {
                            key: "nominal",
                            header: "Nominal",
                            headerClassName: "text-right",
                            cellClassName:
                                "whitespace-nowrap text-right font-bold text-green-600 text-base",
                            render: (trx) => formatRupiah(trx.amount),
                        },
                    ] satisfies ColumnDef<(typeof transactions.data)[0]>[]
                }
                data={transactions.data}
                keyExtractor={(row) => row.id}
                emptyState={
                    <EmptyState
                        message="Belum ada riwayat penerimaan zakat yang tercatat."
                        actionLabel="Catat Penerimaan Zakat"
                        onAction={() => setIsFormOpen(true)}
                    />
                }
            />

            {/* Pagination */}
            {transactions.last_page > 1 && (
                <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 shrink-0">
                    <span className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-800">
                            {transactions.total}
                        </span>{" "}
                        data{" · Halaman "}
                        <span className="font-semibold text-slate-800">
                            {transactions.current_page}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-slate-800">
                            {transactions.last_page}
                        </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={!transactions.prev_page_url}
                            onClick={() =>
                                handlePageNav(-1, transactions.prev_page_url)
                            }
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <AnimatePresence mode="popLayout">
                            {[
                                transactions.current_page - 1,
                                transactions.current_page,
                                transactions.current_page + 1,
                            ]
                                .filter(
                                    (p) =>
                                        p >= 1 && p <= transactions.last_page,
                                )
                                .map((p) => (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                            if (p === transactions.current_page)
                                                return;
                                            handlePageNav(
                                                p > transactions.current_page
                                                    ? 1
                                                    : -1,
                                                p > transactions.current_page
                                                    ? transactions.next_page_url
                                                    : transactions.prev_page_url,
                                            );
                                        }}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                                            p === transactions.current_page
                                                ? "bg-green-600 text-white border-green-600 cursor-default"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {p}
                                    </motion.button>
                                ))}
                        </AnimatePresence>

                        <button
                            type="button"
                            disabled={!transactions.next_page_url}
                            onClick={() =>
                                handlePageNav(1, transactions.next_page_url)
                            }
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <ZakatForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                muzakkis={muzakkis}
            />
        </AppLayout>
    );
}
