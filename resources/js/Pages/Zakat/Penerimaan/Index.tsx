import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import EmptyState from "@/Components/EmptyState";
import PrimaryButton from "@/Components/PrimaryButton";
import ZakatForm from "./Components/ZakatForm";
import {
    Plus,
    Search,
    Wallet,
    Trash2,
    Edit2,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    SlidersHorizontal,
    Clock,
    ArrowDownToLine,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import DataTable, { ColumnDef } from "@/Components/DataTable";
import { formatRupiah } from "@/utils/formatter";
import { router as inertiaRouter } from "@inertiajs/react";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";

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

const categoryLabel = (cat: string) =>
    cat === "zakat_maal" ? "Zakat Maal" : "Zakat Fitrah";

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

const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

// ── Mobile Swipe Card ──────────────────────────────────────
function MobileSwipeCard({
    trx,
    activeSwipeId,
    setActiveSwipeId,
    canCreate,
    onDelete,
}: {
    trx: Transaction;
    activeSwipeId: string | null;
    setActiveSwipeId: (id: string | null) => void;
    canCreate: boolean;
    onDelete: (id: string) => void;
}) {
    const controls = useAnimation();
    const dragLimit = canCreate ? -120 : -64;

    useEffect(() => {
        if (activeSwipeId !== trx.id) controls.start({ x: 0 });
    }, [activeSwipeId, trx.id, controls]);

    const handleDragEnd = (_e: any, info: PanInfo) => {
        if (info.offset.x < -30 || info.velocity.x < -200) {
            controls.start({ x: dragLimit });
            setActiveSwipeId(trx.id);
        } else {
            controls.start({ x: 0 });
            if (activeSwipeId === trx.id) setActiveSwipeId(null);
        }
    };

    const initials = trx.donatur_name.charAt(0).toUpperCase();
    const isMaal = trx.category === "zakat_maal";

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-slate-50 border border-slate-100">
            {/* Action panel */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 gap-2 bg-slate-50">
                {canCreate && (
                    <button
                        onClick={() => alert("Edit belum tersedia di mobile")}
                        className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl"
                    >
                        <Edit2 size={17} />
                    </button>
                )}
                <button
                    onClick={() => onDelete(trx.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl"
                >
                    <Trash2 size={17} />
                </button>
            </div>

            {/* Foreground card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: dragLimit, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 w-full bg-white px-4 py-3 flex items-center gap-3"
            >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                    {initials}
                </div>

                {/* Info kiri */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                        {trx.donatur_name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                                isMaal
                                    ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                    : "bg-green-50 text-green-700 border-green-200/50"
                            }`}
                        >
                            {categoryLabel(trx.category)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            · {paymentLabel(trx.payment_method)}
                        </span>
                    </div>
                </div>

                {/* Info kanan */}
                <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-emerald-600 tabular-nums">
                        +{formatRupiah(trx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateShort(trx.created_at)}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────
export default function Index({ transactions, muzakkis }: Props) {
    const { auth } = usePage().props as any;
    const canCreate = ["super_admin", "bendahara", "petugas_zakat"].includes(
        auth.user.role,
    );

    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [jenisFilter, setJenisFilter] = useState<
        "" | "zakat_maal" | "zakat_fitrah"
    >("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);

    const handlePageNav = (direction: number, url: string | null) => {
        if (!url) return;
        router.get(
            url,
            { search, sort: sortAlpha, order: sortOrder },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSortToggle = () => {
        const next = sortOrder === "terbaru" ? "terlama" : "terbaru";
        setSortOrder(next);
        router.get(
            route("zakat.penerimaan"),
            { search, order: next },
            { preserveState: true, replace: true },
        );
    };

    // Filter data client-side untuk jenis zakat (mobile toggle)
    const filteredData = jenisFilter
        ? transactions.data.filter((t) => t.category === jenisFilter)
        : transactions.data;

    const confirmDelete = () => {
        if (confirmDeleteId) {
            router.delete(route("zakat.penerimaan") + `/${confirmDeleteId}`, {
                onSuccess: () => setConfirmDeleteId(null),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout title="Pengelola Zakat">
            <Head title="Penerimaan Zakat" />

            {/* ═══════════════════════════════════════
                MOBILE ONLY
                ═══════════════════════════════════════ */}
            <div
                className="flex flex-col md:hidden -mx-4 -mt-2"
                style={{ height: "calc(100dvh - 56px - 68px)" }}
            >
                <div className="flex-1 overflow-y-auto">
                    {/* Sticky searchbar + sort + toggle jenis */}
                    <div className="sticky top-0 bg-slate-50 border-b border-slate-100 px-4 pb-3 pt-2 z-30 shadow-sm space-y-2">
                        {/* Baris 1: Search + sort icon */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama muzakki..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                                />
                            </div>
                            <button
                                onClick={handleSortToggle}
                                className={`p-2.5 rounded-xl border transition-colors ${
                                    sortOrder === "terlama"
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                                        : "bg-white border-slate-200 text-slate-400"
                                }`}
                            >
                                <Clock size={16} />
                            </button>
                        </div>

                        {/* Baris 2: Toggle jenis zakat — centered, bukan full width */}
                        <div className="flex justify-center">
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                                {(
                                    ["", "zakat_maal", "zakat_fitrah"] as const
                                ).map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setJenisFilter(val)}
                                        className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            jenisFilter === val
                                                ? "text-emerald-700"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        {jenisFilter === val && (
                                            <motion.div
                                                layoutId="activeJenisPenerimaan"
                                                className="absolute inset-0 bg-white border border-emerald-400 rounded-lg shadow-sm -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        {val === ""
                                            ? "Semua"
                                            : val === "zakat_maal"
                                              ? "Zakat Maal"
                                              : "Zakat Fitrah"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <div
                        className={`px-4 pt-3 flex flex-col gap-2 ${filteredData.length > 0 ? "pb-24" : "pb-4"}`}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredData.map((trx) => (
                                <motion.div
                                    key={trx.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <MobileSwipeCard
                                        trx={trx}
                                        activeSwipeId={activeSwipeId}
                                        setActiveSwipeId={setActiveSwipeId}
                                        canCreate={canCreate}
                                        onDelete={setConfirmDeleteId}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredData.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-slate-400 py-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <ArrowDownToLine className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-600 text-sm">
                                    Belum ada data penerimaan
                                </p>
                                {canCreate && (
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="mt-3 text-xs text-emerald-600 font-medium"
                                    >
                                        + Catat Penerimaan
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAB */}
            {canCreate && (
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="md:hidden fixed bottom-[104px] right-4 z-50 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-medium text-xs px-4 py-2.5 rounded-full shadow-md shadow-emerald-500/25 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Catat
                </button>
            )}

            {/* ═══════════════════════════════════════
                DESKTOP ONLY — tidak berubah
                ═══════════════════════════════════════ */}
            <div className="hidden md:contents">
                <PageHeader
                    title="Penerimaan Zakat"
                    description="Pencatatan pemasukan Zakat Maal dan Zakat Fitrah dari para jamaah."
                >
                    {transactions.data.length > 0 && (
                        <PrimaryButton
                            onClick={() => setIsFormOpen(true)}
                            className="!py-2.5 font-medium cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Catat Penerimaan Zakat
                        </PrimaryButton>
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
                                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${trx.category === "zakat_maal" ? "bg-blue-50 text-blue-700 border-blue-200/50" : "bg-green-50 text-green-700 border-green-200/50"}`}
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
                                cellClassName:
                                    "text-slate-600 max-w-xs truncate",
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
                                    handlePageNav(
                                        -1,
                                        transactions.prev_page_url,
                                    )
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
                                            p >= 1 &&
                                            p <= transactions.last_page,
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
                                                if (
                                                    p ===
                                                    transactions.current_page
                                                )
                                                    return;
                                                handlePageNav(
                                                    p >
                                                        transactions.current_page
                                                        ? 1
                                                        : -1,
                                                    p >
                                                        transactions.current_page
                                                        ? transactions.next_page_url
                                                        : transactions.prev_page_url,
                                                );
                                            }}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${p === transactions.current_page ? "bg-green-600 text-white border-green-600 cursor-default" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
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
            </div>

            {/* ── Modal ── */}
            <ZakatForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                muzakkis={muzakkis}
            />
        </AppLayout>
    );
}
