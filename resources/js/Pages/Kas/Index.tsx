import { useState, useCallback, useRef } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
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
    TrendingUp,
    TrendingDown,
    Loader2,
    Filter,
    ChevronDown,
    Activity,
    Save,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import KasSummaryCards from "@/Components/KasSummaryCards";
import DataTable, { ColumnDef } from "@/Components/DataTable";

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
        sort?: string;
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
    const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        filters?.sort === "terlama" ? "terlama" : "terbaru",
    );
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- Single filter function — always server-side partial reload ---
    const applyFilters = useCallback(
        (params: {
            search?: string;
            type?: string;
            category?: string;
            sort?: string;
            page?: number;
        }) => {
            router.get(
                route("kas.index"),
                {
                    search: params.search ?? search,
                    type: params.type ?? typeFilter,
                    category: params.category ?? categoryFilter,
                    sort: params.sort ?? sortOrder,
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
        [search, typeFilter, categoryFilter, sortOrder],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            applyFilters({ search: val, page: 1 });
        }, 350);
    };

    const handleTypeChange = (newType: string) => {
        setTypeFilter(newType);
        applyFilters({ type: newType, page: 1 });
    };

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        setIsCategoryFilterOpen(false);
        applyFilters({ category: val, page: 1 });
    };

    const handlePageNav = (direction: 1 | -1, url: string | null) => {
        if (!url) return;
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
        setError,
        clearErrors,
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
        clearErrors();
        setIsAddOpen(true);
    };

    const closeAddModal = () => {
        setIsAddOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        let numberVal = parseRupiah(val);

        if (numberVal > 999999999) {
            numberVal = 999999999;
        }

        setFormData("amount", numberVal);
        setFormattedAmount(formatRupiah(numberVal));
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.amount <= 0) {
            setError("amount", "Nominal harus lebih dari 0");
            return;
        }

        post(route("kas.store"), {
            onSuccess: () => {
                closeAddModal();
                reset();
                setFormattedAmount("");
            },
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
            <PageHeader
                title="Kas Masjid"
                description="Kelola dan pantau seluruh pemasukan serta pengeluaran operasional masjid."
            >
                {isBendaharaOrAdmin && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm font-medium cursor-pointer"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Transaksi
                    </button>
                )}
            </PageHeader>

            {/* Stat Cards - Ringkasan Keuangan */}
            <KasSummaryCards
                totalSaldo={summary.saldo_total_kas}
                pemasukanBulanIni={summary.pemasukan_bulan_ini}
                pengeluaranBulanIni={summary.pengeluaran_bulan_ini}
                surplusDefisit={summary.saldo_akhir_bulan}
                monthLabel={getMonthName(month)}
                className="mb-8 md:px-6 shrink-0"
            />

            <div className="border-t border-slate-200 mb-6 md:mx-6"></div>

            {/* Toolbar Area (Search & Filters) */}
            <FilterBar
                searchPlaceholder="Cari keterangan transaksi..."
                searchValue={search}
                onSearchChange={(val) =>
                    handleSearchChange({
                        target: { value: val },
                    } as React.ChangeEvent<HTMLInputElement>)
                }
                addon={
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 rounded-xl p-1 relative">
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
                                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 ${
                                    typeFilter === opt.value
                                        ? "text-green-700"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {typeFilter === opt.value && (
                                    <motion.div
                                        layoutId="activeFilterTab"
                                        className="absolute inset-0 bg-white border border-green-500 rounded-lg shadow-sm -z-10"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                }
            >
                {/* Kategori Filter Dropdown */}
                <div className="relative shrink-0 z-50">
                    {isCategoryFilterOpen && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsCategoryFilterOpen(false)}
                        ></div>
                    )}
                    <button
                        type="button"
                        onClick={() =>
                            setIsCategoryFilterOpen(!isCategoryFilterOpen)
                        }
                        className="relative z-50 inline-flex items-center justify-between w-full sm:w-[200px] px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                        <span className="flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            <span className="truncate">
                                {CATEGORY_OPTIONS.find(
                                    (opt) => opt.value === categoryFilter,
                                )?.label || "Semua Kategori"}
                            </span>
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 shrink-0 ${isCategoryFilterOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                    <AnimatePresence>
                        {isCategoryFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-full sm:w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[60] p-1"
                            >
                                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                handleCategoryChange(opt.value)
                                            }
                                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                                categoryFilter === opt.value
                                                    ? "bg-green-50 text-green-700 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Urutkan */}
                <button
                    type="button"
                    onClick={() => {
                        const newSort =
                            sortOrder === "terbaru" ? "terlama" : "terbaru";
                        setSortOrder(newSort);
                        applyFilters({ sort: newSort, page: 1 });
                    }}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
                    {sortOrder === "terbaru" ? "Terbaru" : "Terlama"}
                </button>
            </FilterBar>

            <DataTable
                className="flex-1 min-h-[400px]"
                tableFixed
                columns={
                    [
                        {
                            key: "tanggal",
                            header: "Tanggal",
                            width: "w-[13%]",
                            cellClassName:
                                "whitespace-nowrap text-slate-600 font-medium text-sm",
                            render: (item) => (
                                <>
                                    <div>
                                        {new Date(
                                            item.created_at,
                                        ).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">
                                        {new Date(
                                            item.created_at,
                                        ).toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </>
                            ),
                        },
                        {
                            key: "pengimput",
                            header: "Pengimput",
                            width: "w-[16%]",
                            cellClassName: "whitespace-nowrap",
                            render: (item) => (
                                <span className="text-sm text-slate-700 font-medium">
                                    {item.user?.name ?? "-"}
                                </span>
                            ),
                        },
                        {
                            key: "kategori",
                            header: "Kategori",
                            width: "w-[12%]",
                            render: (item) => (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                    {item.category.replace(/_/g, " ")}
                                </span>
                            ),
                        },
                        {
                            key: "metode",
                            header: "Metode",
                            width: "w-[10%]",
                            cellClassName: "capitalize text-slate-600 text-sm",
                            render: (item) => item.payment_method || "-",
                        },
                        {
                            key: "nominal",
                            header: "Nominal",
                            width: "w-[15%]",
                            cellClassName: (item) =>
                                `whitespace-nowrap font-bold text-sm ${
                                    item.type === "in"
                                        ? "text-green-600"
                                        : "text-red-500"
                                }`,
                            render: (item) =>
                                `${item.type === "in" ? "+" : "-"} ${formatRupiah(item.amount)}`,
                        },
                        {
                            key: "keterangan",
                            header: "Keterangan",
                            width: "w-[24%]",
                            render: (item) => (
                                <p className="text-slate-600 text-sm whitespace-normal break-words">
                                    {item.notes || "-"}
                                </p>
                            ),
                        },
                        {
                            key: "status",
                            header: "Status",
                            width: "w-[12%]",
                            cellClassName: "whitespace-nowrap",
                            render: (item) =>
                                item.verified_at ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200/50">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Terverifikasi
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                                        Pending
                                    </span>
                                ),
                        },
                        {
                            key: "aksi",
                            header: "Aksi",
                            width: "w-[10%]",
                            cellClassName: "whitespace-nowrap text-sm",
                            render: (item) => (
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isBendaharaOrAdmin &&
                                        !item.verified_at && (
                                            <button
                                                onClick={() =>
                                                    handleVerify(item.id)
                                                }
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Verifikasi Transaksi"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Transaksi"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ),
                        },
                    ] satisfies ColumnDef<(typeof transactions.data)[0]>[]
                }
                data={transactions.data}
                keyExtractor={(row) => row.id}
                emptyState={
                    <div className="flex flex-col items-center justify-center text-slate-400 py-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-600">
                            Belum ada data transaksi
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Transaksi yang ditambahkan akan muncul di sini.
                        </p>
                    </div>
                }
            />

            {/* Pagination - Muncul dinamis hanya jika lebih dari 1 halaman */}
            {transactions.last_page > 1 && (
                <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 shrink-0">
                    {/* Info */}
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

                    {/* Prev / Page Numbers / Next */}
                    <div className="flex items-center gap-1.5">
                        {/* Prev */}
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

                        {/* Page numbers */}
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
                                    <div className="flex justify-between items-start mt-1">
                                        {errors.amount ? (
                                            <p className="text-xs text-red-500">
                                                {errors.amount}
                                            </p>
                                        ) : (
                                            <div></div>
                                        )}
                                        <p className="text-xs text-slate-400 font-medium">
                                            *maks Rp. 999.999.999
                                        </p>
                                    </div>
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
                                        onChange={(e) => {
                                            // Sanitize input: Remove potential XSS characters like < > [ ] { }
                                            const sanitizedValue =
                                                e.target.value.replace(
                                                    /[<>()[\]{}]/g,
                                                    "",
                                                );
                                            setFormData(
                                                "notes",
                                                sanitizedValue,
                                            );
                                        }}
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
