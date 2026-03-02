import { useState, useCallback, useRef, useEffect } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
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
    Clock,
    XCircle,
    Download,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import KasSummaryCards from "@/Components/KasSummaryCards";
import FormActions from "@/Components/FormActions";
import DataTable, { ColumnDef } from "@/Components/DataTable";
import PrimaryButton from "@/Components/PrimaryButton";
import CustomSelect from "@/Components/CustomSelect";
import RupiahInput from "@/Components/RupiahInput";

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

function MobileSwipeCard({
    transaction,
    activeSwipeId,
    setActiveSwipeId,
    isBendaharaOrAdmin,
    isSuperAdmin,
    formatDateMobile,
    handleVerify,
    handleDelete,
}: {
    transaction: Transaction;
    activeSwipeId: string | null;
    setActiveSwipeId: (id: string | null) => void;
    isBendaharaOrAdmin: boolean;
    isSuperAdmin: boolean;
    formatDateMobile: (date: string) => string;
    handleVerify: (id: string) => void;
    handleDelete: (id: string) => void;
}) {
    const hasVerify = isBendaharaOrAdmin && !transaction.verified_at;
    const hasDelete = isSuperAdmin;
    const hasActions = hasVerify || hasDelete;

    // Width actions panel per button
    const dragLimit = hasVerify && hasDelete ? -120 : hasActions ? -72 : 0;
    const controls = useAnimation();

    useEffect(() => {
        if (activeSwipeId !== transaction.id) {
            controls.start({ x: 0 });
        }
    }, [activeSwipeId, transaction.id, controls]);

    const handleDragEnd = (_event: any, info: PanInfo) => {
        if (!hasActions) return;

        const dragThreshold = -30;
        if (info.offset.x < dragThreshold || info.velocity.x < -200) {
            controls.start({ x: dragLimit });
            setActiveSwipeId(transaction.id);
        } else {
            controls.start({ x: 0 });
            if (activeSwipeId === transaction.id) {
                setActiveSwipeId(null);
            }
        }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-slate-50 border border-slate-100 overflow-x-hidden">
            {/* Background Actions (Tersembunyi di bawah panel drag) */}
            {hasActions && (
                <div className="absolute inset-y-0 right-0 flex items-center px-4 space-x-2 bg-slate-50 shadow-[inset_4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">
                    {hasVerify && (
                        <button
                            onClick={() => handleVerify(transaction.id)}
                            className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-xl active:bg-green-200 transition-colors"
                            title="Verifikasi"
                        >
                            <CheckCircle size={18} />
                        </button>
                    )}
                    {hasDelete && (
                        <button
                            onClick={() => handleDelete(transaction.id)}
                            className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl active:bg-red-200 transition-colors"
                            title="Hapus"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )}

            {/* Foreground Card */}
            <motion.div
                drag={hasActions ? "x" : false}
                dragConstraints={{ left: dragLimit, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 w-full bg-white px-4 py-3 flex items-center justify-between"
            >
                {/* Kolom kiri */}
                <div className="flex flex-col gap-0.5 max-w-[55%]">
                    <span className="text-sm font-semibold text-slate-900 capitalize truncate">
                        {transaction.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-400">
                        {formatDateMobile(transaction.created_at)}
                    </span>
                </div>

                {/* Kolom kanan */}
                <div className="flex flex-col gap-0.5 items-end pl-2">
                    <span
                        className={`text-sm font-semibold whitespace-nowrap ${
                            transaction.type === "in"
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                    >
                        {transaction.type === "in" ? "+" : "-"}
                        {formatRupiah(transaction.amount)}
                    </span>
                    <div className="flex items-center gap-1 mt-[1px]">
                        <span className="text-xs text-slate-400 capitalize">
                            {transaction.payment_method || "-"}
                        </span>
                        {transaction.verified_at ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

interface BreakdownItem {
    category: string;
    total: number;
}

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
    breakdown: {
        pemasukan: BreakdownItem[];
        pengeluaran: BreakdownItem[];
    };
    month: string | number;
    year: string | number;
}

export default function KasIndex({
    transactions,
    auth,
    summary,
    breakdown,
    month,
    year,
    filters,
}: Props) {
    const [activeTab, setActiveTab] = useState<"tampilan" | "catat">(
        "tampilan",
    );
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
    const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);

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

    const [page, setPage] = useState(1);
    const [allTransactions, setAllTransactions] = useState(transactions.data);
    const [hasMore, setHasMore] = useState(transactions.next_page_url !== null);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // Reset list saat transactions props berganti (akibat search atau filter diubah dan kembali ke page 1)
    useEffect(() => {
        if (transactions.current_page === 1) {
            setAllTransactions(transactions.data);
            setPage(1);
            setHasMore(transactions.next_page_url !== null);
        }
    }, [transactions]);

    const loadMore = useCallback(() => {
        if (!hasMore) return;

        router.get(
            route("kas.index"),
            {
                search,
                type: typeFilter,
                category: categoryFilter,
                sort: sortOrder,
                page: page + 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["transactions"],
                onSuccess: (pageProps) => {
                    const pageData = pageProps.props
                        .transactions as PaginatedResponse<Transaction>;
                    setAllTransactions((prev) => {
                        const existingIds = new Set(prev.map((t) => t.id));
                        const filtered = pageData.data.filter(
                            (t) => !existingIds.has(t.id),
                        );
                        return [...prev, ...filtered];
                    });
                    setPage((prev) => prev + 1);
                    setHasMore(pageData.next_page_url !== null);
                },
            },
        );
    }, [page, hasMore, search, typeFilter, categoryFilter, sortOrder]);

    // IntersectionObserver untuk deteksi scroll ke bawah
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 },
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

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
        clearErrors();
        setIsAddOpen(true);
    };

    const closeAddModal = () => {
        setIsAddOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleAmountChange = (numberVal: number) => {
        setFormData("amount", numberVal);
        if (numberVal > 999999999) {
            setError("amount", "Nominal maks Rp. 999.999.999");
        } else {
            clearErrors("amount");
        }
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
            },
        });
    };

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 640);
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDateMobile = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} • ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", ".")}`;
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

    const formatCat = (cat: string) => {
        const withSpaces = cat.replace(/_/g, " ");
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    };

    return (
        <AppLayout title="Pengelola Kas">
            <Head title="Kas Masjid" />

            {/* ── MOBILE: Scroll-then-Stick Layout ── */}
            {/* Fixed height = screen - header (56px) - bottom nav (68px) */}
            <div
                className="flex flex-col md:hidden -mx-4 -mt-2"
                style={{ height: "calc(100dvh - 56px - 68px)" }}
            >
                {/* Scroll container UTAMA — seluruh konten scroll di sini */}
                <div className="flex-1 overflow-y-auto">
                    {/* Toggle — ikut scroll, posisi tengah */}
                    <div className="flex justify-center px-4 py-3 bg-white">
                        <div className="flex bg-slate-100 rounded-full p-1 shadow-inner">
                            <button
                                onClick={() => setActiveTab("tampilan")}
                                className={`relative px-6 py-1.5 rounded-full text-sm font-semibold transition-colors z-10 ${
                                    activeTab === "tampilan"
                                        ? "text-white"
                                        : "text-slate-500"
                                }`}
                            >
                                {activeTab === "tampilan" && (
                                    <motion.div
                                        layoutId="activeToggleKas"
                                        className="absolute inset-0 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/30 -z-10"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                Tampilan
                            </button>
                            <button
                                onClick={() => setActiveTab("catat")}
                                className={`relative px-6 py-1.5 rounded-full text-sm font-semibold transition-colors z-10 ${
                                    activeTab === "catat"
                                        ? "text-white"
                                        : "text-slate-500"
                                }`}
                            >
                                {activeTab === "catat" && (
                                    <motion.div
                                        layoutId="activeToggleKas"
                                        className="absolute inset-0 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/30 -z-10"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                Catat
                            </button>
                        </div>
                    </div>

                    {/* ── Tab Tampilan ── */}
                    {activeTab === "tampilan" && (
                        <div className="px-4 pb-4 space-y-3">
                            <KasSummaryCards
                                totalSaldo={summary.saldo_total_kas}
                                pemasukanBulanIni={summary.pemasukan_bulan_ini}
                                pengeluaranBulanIni={
                                    summary.pengeluaran_bulan_ini
                                }
                                surplusDefisit={summary.saldo_akhir_bulan}
                                monthLabel={getMonthName(month)}
                            />

                            {/* Card Rincian Pemasukan */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        Rincian Pemasukan
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        {getMonthName(month)}
                                    </span>
                                </div>
                                {breakdown.pemasukan.length > 0 ? (
                                    <ul className="divide-y divide-slate-50">
                                        {breakdown.pemasukan.map(
                                            (item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex justify-between items-center px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span className="text-sm text-slate-700">
                                                            {formatCat(
                                                                item.category,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            item.total,
                                                        )}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-center text-sm text-slate-400 py-6">
                                        Belum ada pemasukan bulan ini
                                    </p>
                                )}
                            </div>

                            {/* Card Rincian Pengeluaran */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                        Rincian Pengeluaran
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        {getMonthName(month)}
                                    </span>
                                </div>
                                {breakdown.pengeluaran.length > 0 ? (
                                    <ul className="divide-y divide-slate-50">
                                        {breakdown.pengeluaran.map(
                                            (item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex justify-between items-center px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        <span className="text-sm text-slate-700">
                                                            {formatCat(
                                                                item.category,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-red-600">
                                                        {formatCurrency(
                                                            item.total,
                                                        )}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-center text-sm text-slate-400 py-6">
                                        Belum ada pengeluaran bulan ini
                                    </p>
                                )}
                            </div>

                            {/* Tombol Filter & Download */}
                            <div className="flex gap-3 pb-2">
                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                                    <SlidersHorizontal size={15} />
                                    Filter
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                                    <Download size={15} />
                                    Download
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Tab Catat ── */}
                    {activeTab === "catat" && (
                        <div className="flex flex-col">
                            {/* Search + Filter — STICKY top-0 saat toggle scroll hilang. z-30 agar card tidak overlap */}
                            <div className="sticky top-0 bg-slate-50 border-b border-slate-100 px-4 pb-2 pt-1 z-30 shadow-sm relative space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari keterangan transaksi..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                                    />
                                </div>
                                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                                    {(
                                        [
                                            { value: "", label: "Semua" },
                                            { value: "in", label: "Masuk" },
                                            { value: "out", label: "Keluar" },
                                        ] as {
                                            value: "" | "in" | "out";
                                            label: string;
                                        }[]
                                    ).map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                handleTypeChange(opt.value)
                                            }
                                            className={`relative flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 text-center ${
                                                typeFilter === opt.value
                                                    ? "text-green-700"
                                                    : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        >
                                            {typeFilter === opt.value && (
                                                <motion.div
                                                    layoutId="activeFilterKasTabMobile"
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
                            </div>

                            {/* Cards — mengikuti flow normal. Jika data kosong, pb dihilangkan agar tidak bisa di-scroll kosong */}
                            <div
                                className={`px-4 pt-3 flex flex-col gap-2 relative z-0 ${allTransactions.length > 0 ? "pb-24" : "pb-4"}`}
                            >
                                <AnimatePresence mode="popLayout">
                                    {allTransactions.map((transaction) => (
                                        <motion.div
                                            key={transaction.id}
                                            layout
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <MobileSwipeCard
                                                transaction={transaction}
                                                activeSwipeId={activeSwipeId}
                                                setActiveSwipeId={
                                                    setActiveSwipeId
                                                }
                                                isBendaharaOrAdmin={
                                                    isBendaharaOrAdmin
                                                }
                                                isSuperAdmin={isSuperAdmin}
                                                formatDateMobile={
                                                    formatDateMobile
                                                }
                                                handleVerify={handleVerify}
                                                handleDelete={handleDelete}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {allTransactions.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center text-slate-400 py-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="font-medium text-slate-600 text-sm">
                                            Belum ada data transaksi
                                        </p>
                                    </motion.div>
                                )}
                                {/* Infinite scroll loader */}
                                <div
                                    ref={loaderRef}
                                    className="py-2 flex justify-center h-10 shrink-0"
                                >
                                    {hasMore && (
                                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* end mobile layout */}

            {/* FAB — Floating Action Button (mobile only, tab Catat) */}
            {isBendaharaOrAdmin && activeTab === "catat" && (
                <button
                    onClick={openAddModal}
                    className="md:hidden fixed bottom-[104px] right-4 z-50 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-medium text-xs px-4 py-2.5 rounded-full shadow-md shadow-emerald-500/25 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Catat
                </button>
            )}

            {/* ── DESKTOP ONLY: Summary Cards + FilterBar + DataTable ── */}
            <div className="hidden md:contents">
                <KasSummaryCards
                    totalSaldo={summary.saldo_total_kas}
                    pemasukanBulanIni={summary.pemasukan_bulan_ini}
                    pengeluaranBulanIni={summary.pengeluaran_bulan_ini}
                    surplusDefisit={summary.saldo_akhir_bulan}
                    monthLabel={getMonthName(month)}
                    className="mb-8 md:px-6 shrink-0"
                />

                {/* Separator + Catat Transaksi button — Bendahara/Admin only */}
                <div className="flex items-center gap-4 mb-6 md:mx-6">
                    <div className="flex-1 border-t border-slate-200" />
                    {isBendaharaOrAdmin && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-full shadow-md shadow-emerald-500/25 transition-all shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Catat Transaksi
                        </button>
                    )}
                </div>

                {/* Desktop Toolbar — search, filter, sort */}
                <FilterBar
                    searchPlaceholder="Cari keterangan transaksi..."
                    searchValue={search}
                    onSearchChange={(val) =>
                        handleSearchChange({
                            target: { value: val },
                        } as React.ChangeEvent<HTMLInputElement>)
                    }
                    addon={
                        <div className="flex items-center justify-start gap-1 p-1 bg-slate-100 rounded-xl">
                            {(
                                [
                                    { value: "", label: "Semua" },
                                    { value: "in", label: "Masuk" },
                                    { value: "out", label: "Keluar" },
                                ] as {
                                    value: "" | "in" | "out";
                                    label: string;
                                }[]
                            ).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleTypeChange(opt.value)}
                                    className={`relative flex-none px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 ${
                                        typeFilter === opt.value
                                            ? "text-green-700"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {typeFilter === opt.value && (
                                        <motion.div
                                            layoutId="activeFilterKasTab"
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
                            className="relative z-50 inline-flex items-center justify-between w-[200px] px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                        >
                            <Filter className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                            <span className="truncate flex-1 text-left">
                                {CATEGORY_OPTIONS.find(
                                    (opt) => opt.value === categoryFilter,
                                )?.label || "Semua Kategori"}
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
                                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[60] p-1"
                                >
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {CATEGORY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    handleCategoryChange(
                                                        opt.value,
                                                    )
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
                        className="inline-flex items-center justify-center w-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0"
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-500" />
                        {sortOrder === "terbaru" ? "Terbaru" : "Terlama"}
                    </button>
                    {/* Desktop: Filter & Download buttons */}
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <SlidersHorizontal size={15} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <Download size={15} />
                        Download
                    </button>
                </FilterBar>

                <DataTable
                    className="flex flex-1 min-h-[400px]"
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
                                cellClassName:
                                    "capitalize text-slate-600 text-sm",
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
            </div>
            {/* end hidden md:contents */}

            {/* Pagination Desktop - Muncul dinamis hanya jika lebih dari 1 halaman */}
            {transactions.last_page > 1 && (
                <div className="hidden md:flex px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col sm:flex-row items-center justify-between gap-3 mt-2 shrink-0">
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

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                            onClick={closeAddModal}
                        ></motion.div>

                        <motion.div
                            initial={
                                isMobile
                                    ? { y: "100%", opacity: 0 }
                                    : { opacity: 0, scale: 0.95, y: 16 }
                            }
                            animate={
                                isMobile
                                    ? { y: 0, opacity: 1 }
                                    : { opacity: 1, scale: 1, y: 0 }
                            }
                            exit={
                                isMobile
                                    ? { y: "100%", opacity: 0 }
                                    : { opacity: 0, scale: 0.95, y: 16 }
                            }
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.4,
                            }}
                            className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[95vh] sm:h-auto sm:max-h-[80vh]"
                        >
                            <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full z-20"></div>
                            <div className="px-5 sm:px-6 py-4 pt-8 sm:pt-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Catat Transaksi
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

                            <div className="p-5 sm:p-6 pb-safe flex-1 overflow-y-auto bg-white min-h-0">
                                <form
                                    id="kas-form"
                                    onSubmit={submitAdd}
                                    className="space-y-4 sm:space-y-5"
                                >
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
                                        <CustomSelect
                                            value={formData.category}
                                            onChange={(val) =>
                                                setFormData("category", val)
                                            }
                                            options={CATEGORY_OPTIONS.filter(
                                                (opt) => opt.value !== "",
                                            )}
                                        />
                                        {errors.category && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label
                                            className={`block text-sm font-semibold mb-1.5 ${errors.amount ? "text-red-500" : "text-slate-700"}`}
                                        >
                                            Nominal (Rp) *
                                        </label>
                                        <RupiahInput
                                            value={formData.amount}
                                            onValueChange={handleAmountChange}
                                            isError={!!errors.amount}
                                        />
                                        <div className="flex justify-between items-start mt-1">
                                            {errors.amount ? (
                                                <p className="text-xs text-red-500">
                                                    {errors.amount}
                                                </p>
                                            ) : (
                                                <div></div>
                                            )}
                                            <p
                                                className={`text-xs font-medium ${errors.amount ? "text-red-500" : "text-slate-400"}`}
                                            >
                                                *maks Rp. 999.999.999
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Metode Pembayaran
                                        </label>
                                        <CustomSelect
                                            value={formData.payment_method}
                                            onChange={(val) =>
                                                setFormData(
                                                    "payment_method",
                                                    val,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "tunai",
                                                    label: "Tunai",
                                                },
                                                {
                                                    value: "transfer",
                                                    label: "Transfer Bank",
                                                },
                                                {
                                                    value: "qris",
                                                    label: "QRIS",
                                                },
                                            ]}
                                        />
                                        {errors.payment_method && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Keterangan *
                                        </label>
                                        <textarea
                                            required
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
                                </form>
                            </div>
                            <div className="p-5 sm:p-6 border-t border-slate-100 shrink-0 bg-white pb-safe">
                                <FormActions
                                    onCancel={closeAddModal}
                                    processing={processing}
                                    submitDisabled={!isOnline}
                                    layout="full-width"
                                    submitText="Simpan Transaksi"
                                    formId="kas-form"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
