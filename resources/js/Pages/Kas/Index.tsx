import { useState, useCallback, useRef } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "@/Layouts/AppLayout";
import { PaginatedResponse, Transaction, User } from "@/types";
import { formatRupiah, parseRupiah } from "@/utils/formatter";
import { useNetwork } from "@/Hooks/useNetwork";
import {
    Plus,
    CheckCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    Wallet,
    ArrowDownRight,
    ArrowUpRight,
    Activity,
    Save,
    Loader2,
    ChevronDown,
} from "lucide-react";

const CATEGORY_OPTIONS = [
    { value: "", label: "Semua Kategori" },
    { value: "zakat_fitrah", label: "Zakat Fitrah" },
    { value: "zakat_maal", label: "Zakat Maal" },
    { value: "infaq", label: "Infaq / Sedekah" },
    { value: "infaq_tromol", label: "Infaq Tromol" },
    { value: "operasional", label: "Operasional" },
    { value: "gaji", label: "Gaji" },
    { value: "lainnya", label: "Lainnya" },
];

interface Props {
    transactions: PaginatedResponse<Transaction>;
    auth: {
        user: User;
    };
    filters?: {
        type?: string;
        category?: string;
        search?: string;
    };
    summary: {
        pemasukan_bulan_ini: number;
        pengeluaran_bulan_ini: number;
        saldo_akhir_bulan: number;
        saldo_total_kas: number;
    };
    month: string | number;
    year: string | number;
}

export default function KasIndex({
    transactions,
    auth,
    summary,
    month,
    year,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category ?? "",
    );
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Swipe direction: 1 = forward (right→left), -1 = backward (left→right)
    const TYPE_ORDER = ["", "in", "out"];
    const navDirRef = useRef<1 | -1>(1);

    // --- Single filter function — always server-side partial reload ---
    const applyFilters = useCallback(
        (params: {
            search?: string;
            type?: string;
            category?: string;
            page?: number;
        }) => {
            router.get(
                route("kas.index"),
                {
                    search: params.search ?? search,
                    type: params.type ?? typeFilter,
                    category: params.category ?? categoryFilter,
                    ...(params.page ? { page: params.page } : {}),
                },
                {
                    only: ["transactions"],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        },
        [search, typeFilter, categoryFilter],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            applyFilters({ search: val });
        }, 350);
    };

    const handleTypeChange = (newType: string) => {
        const oldIdx = TYPE_ORDER.indexOf(typeFilter);
        const newIdx = TYPE_ORDER.indexOf(newType);
        navDirRef.current = newIdx >= oldIdx ? 1 : -1;
        setTypeFilter(newType);
        applyFilters({ type: newType, page: 1 });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setCategoryFilter(val);
        applyFilters({ category: val, page: 1 });
    };

    const handlePageNav = (direction: 1 | -1, url: string | null) => {
        if (!url) return;
        navDirRef.current = direction;
        router.get(
            url,
            {},
            {
                only: ["transactions"],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const [isAddOpen, setIsAddOpen] = useState(false);
    const isOnline = useNetwork();
    const [formattedAmount, setFormattedAmount] = useState("");

    const {
        data: formData,
        setData: setFormData,
        post,
        reset,
        errors,
        processing,
    } = useForm({
        type: "in",
        category: "infaq",
        amount: 0,
        payment_method: "tunai",
        notes: "",
    });

    const openAddModal = () => {
        reset();
        setFormattedAmount("");
        setIsAddOpen(true);
    };

    const closeAddModal = () => {
        setIsAddOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const numberVal = parseRupiah(val);
        setFormData("amount", numberVal);
        setFormattedAmount(formatRupiah(numberVal));
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.amount <= 0) {
            alert("Nominal harus lebih dari 0");
            return;
        }

        post(route("kas.store"), {
            onSuccess: () => closeAddModal(),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getMonthName = (monthNumber: string | number) => {
        const date = new Date();
        date.setMonth(parseInt(monthNumber as string) - 1);
        return date.toLocaleString("id-ID", { month: "long" });
    };

    const isBendaharaOrAdmin =
        auth.user.role === "bendahara" || auth.user.role === "super_admin";
    const isSuperAdmin = auth.user.role === "super_admin";

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            router.delete(route("kas.destroy", id));
        }
    };

    const handleVerify = (id: string) => {
        if (confirm("Verifikasi transaksi ini?")) {
            router.put(route("kas.verify", id));
        }
    };

    return (
        <AppLayout title="Pengelola Kas">
            <Head title="Kas Masjid" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Kas Masjid
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola dan pantau seluruh pemasukan serta pengeluaran
                        operasional masjid.
                    </p>
                </div>
                {isBendaharaOrAdmin && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Transaksi
                    </button>
                )}
            </div>

            {/* Stat Cards - Ringkasan Keuangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 md:px-6">
                {/* Total Kas Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-green-50 rounded-xl">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        Total Saldo Kas
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatCurrency(summary.saldo_total_kas)}
                    </h4>
                </div>

                {/* Pemasukan Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            {getMonthName(month)}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        Pemasukan Bulan Ini
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatCurrency(summary.pemasukan_bulan_ini)}
                    </h4>
                </div>

                {/* Pengeluaran Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-red-50 rounded-xl">
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            {getMonthName(month)}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        Pengeluaran Bulan Ini
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900 mt-auto">
                        {formatCurrency(summary.pengeluaran_bulan_ini)}
                    </h4>
                </div>

                {/* Surplus/Defisit Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className={`p-2.5 rounded-xl ${summary.saldo_akhir_bulan >= 0 ? "bg-blue-50" : "bg-orange-50"}`}
                        >
                            {summary.saldo_akhir_bulan >= 0 ? (
                                <Activity className={`w-5 h-5 text-blue-600`} />
                            ) : (
                                <Activity
                                    className={`w-5 h-5 text-orange-600`}
                                />
                            )}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            {getMonthName(month)}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                        {summary.saldo_akhir_bulan >= 0 ? "Surplus" : "Defisit"}{" "}
                        Bersih
                    </p>
                    <h4
                        className={`text-2xl font-bold mt-auto ${summary.saldo_akhir_bulan >= 0 ? "text-blue-600" : "text-orange-600"}`}
                    >
                        {summary.saldo_akhir_bulan > 0 ? "+" : ""}
                        {formatCurrency(summary.saldo_akhir_bulan)}
                    </h4>
                </div>
            </div>

            <div className="border-t border-slate-200 mb-6 md:mx-6"></div>

            {/* Toolbar Area (Search & Filters) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-2 relative z-10">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Cari keterangan transaksi..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 sm:text-sm transition-colors shadow-sm"
                        />
                    </div>

                    {/* Jenis Transaksi Filter */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 rounded-xl p-1">
                        {(
                            [
                                { value: "", label: "Semua" },
                                { value: "in", label: "Masuk" },
                                { value: "out", label: "Keluar" },
                            ] as { value: "" | "in" | "out"; label: string }[]
                        ).map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleTypeChange(opt.value)}
                                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    typeFilter === opt.value
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Kategori Filter */}
                    <div className="relative shrink-0">
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors shadow-sm cursor-pointer"
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Urutkan */}
                    <button
                        type="button"
                        onClick={() =>
                            setSortOrder(
                                sortOrder === "terbaru" ? "terlama" : "terbaru",
                            )
                        }
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0"
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
                        {sortOrder === "terbaru" ? "Terbaru" : "Terlama"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div
                    className="kas-table-scroll overflow-x-auto overflow-y-auto"
                    style={{
                        maxHeight: "480px",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#CBD5E1 transparent",
                    }}
                >
                    <style>{`
                        .kas-table-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                        .kas-table-scroll::-webkit-scrollbar-track { background: transparent; }
                        .kas-table-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
                        .kas-table-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                    `}</style>
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-4 whitespace-nowrap"
                                >
                                    Tanggal
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Pengimput
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Kategori
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Metode
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                >
                                    Nominal
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Keterangan
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.tbody
                                key={`${transactions.current_page}-${typeFilter}`}
                                className="divide-y divide-slate-100/80"
                                initial={{
                                    x: navDirRef.current * 40,
                                    opacity: 0,
                                }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{
                                    x: navDirRef.current * -40,
                                    opacity: 0,
                                }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px–6 py-12 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Search className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-medium text-slate-600">
                                                    Belum ada data transaksi
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Transaksi yang ditambahkan
                                                    akan muncul di sini.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="bg-white hover:bg-slate-50/80 transition-colors group"
                                        >
                                            {/* Tanggal + Jam */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium text-sm">
                                                <div>
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleTimeString(
                                                        "id-ID",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </div>
                                            </td>

                                            {/* Pengimput */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {item.user?.name ?? "-"}
                                                </span>
                                            </td>

                                            {/* Kategori */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                                    {item.category.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </span>
                                            </td>

                                            {/* Metode */}
                                            <td className="px-6 py-4 capitalize text-slate-600 text-sm">
                                                {item.payment_method || "-"}
                                            </td>

                                            {/* Nominal */}
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${
                                                    item.type === "in"
                                                        ? "text-emerald-600"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {item.type === "in" ? "+" : "-"}{" "}
                                                {formatRupiah(item.amount)}
                                            </td>

                                            {/* Keterangan */}
                                            <td className="px-6 py-4 min-w-[200px]">
                                                <p className="text-slate-600 text-sm whitespace-normal break-words">
                                                    {item.notes || "-"}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.verified_at ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isBendaharaOrAdmin &&
                                                        !item.verified_at && (
                                                            <button
                                                                onClick={() =>
                                                                    handleVerify(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Verifikasi Transaksi"
                                                            >
                                                                <CheckCircle
                                                                    size={18}
                                                                />
                                                            </button>
                                                        )}
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Transaksi"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </motion.tbody>
                        </AnimatePresence>
                    </table>
                </div>

                {/* Pagination (satu untuk semua mode — server-side) */}
                {transactions.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Info */}
                        <span className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">
                                {transactions.total}
                            </span>{" "}
                            data
                            {" · Halaman "}
                            <span className="font-semibold text-slate-800">
                                {transactions.current_page}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-800">
                                {transactions.last_page}
                            </span>
                        </span>

                        {/* Prev / Page Numbers / Next */}
                        <div className="flex items-center gap-1.5">
                            {/* Prev */}
                            <button
                                type="button"
                                disabled={!transactions.prev_page_url}
                                onClick={() =>
                                    handlePageNav(
                                        -1,
                                        transactions.prev_page_url,
                                    )
                                }
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers: prev, current, next */}
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
                                    <button
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
                                                ? "bg-emerald-600 text-white border-emerald-600 cursor-default"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                            {/* Next */}
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
            </div>

            {/* Modal Tambah Transaksi */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeAddModal}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-slate-900">
                                Tambah Transaksi Baru
                            </h3>
                            <button
                                onClick={closeAddModal}
                                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={submitAdd} className="space-y-5">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Jenis Transaksi *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData("type", "in")
                                            }
                                            className={`py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center transition-all ${formData.type === "in" ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                        >
                                            Pemasukan (+In)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData("type", "out")
                                            }
                                            className={`py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center transition-all ${formData.type === "out" ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                        >
                                            Pengeluaran (-Out)
                                        </button>
                                    </div>
                                    {errors.type && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData(
                                                "category",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                    >
                                        <option value="zakat_fitrah">
                                            Zakat Fitrah
                                        </option>
                                        <option value="zakat_maal">
                                            Zakat Maal
                                        </option>
                                        <option value="infaq">
                                            Infaq / Sedekah
                                        </option>
                                        <option value="infaq_tromol">
                                            Infaq Tromol
                                        </option>
                                        <option value="operasional">
                                            Operasional
                                        </option>
                                        <option value="gaji">Gaji</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Nominal (Rp) *
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            formattedAmount ||
                                            (formData.amount === 0
                                                ? ""
                                                : formatRupiah(formData.amount))
                                        }
                                        onChange={handleAmountChange}
                                        className="w-full px-3 py-2 font-mono text-lg font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                        placeholder="Rp 0"
                                    />
                                    {errors.amount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Metode Pembayaran
                                    </label>
                                    <select
                                        value={formData.payment_method}
                                        onChange={(e) =>
                                            setFormData(
                                                "payment_method",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                    >
                                        <option value="tunai">Tunai</option>
                                        <option value="transfer">
                                            Transfer Bank
                                        </option>
                                        <option value="qris">QRIS</option>
                                    </select>
                                    {errors.payment_method && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.payment_method}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Keterangan (Opsional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData("notes", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm resize-none"
                                        rows={3}
                                        placeholder="Contoh: Infaq Hamba Allah, Bayar Listrik Bulan Juni"
                                    ></textarea>
                                    {errors.notes && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeAddModal}
                                        className="flex-1 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !isOnline}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="-ml-1 mr-2 h-4 w-4" />
                                                Simpan Transaksi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
