import { useState, useEffect, useRef } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import EmptyState from "@/Components/EmptyState";
import PrimaryButton from "@/Components/PrimaryButton";
import CustomSelect from "@/Components/CustomSelect";
import MustahiqForm from "./Components/MustahiqForm";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Upload,
    FileSpreadsheet,
    X,
    ArrowUpDown,
    SlidersHorizontal,
    Clock,
    Users,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import DataTable, { ColumnDef } from "@/Components/DataTable";

interface Mustahiq {
    id: string;
    name: string;
    ashnaf: string;
    address: string | null;
    description: string | null;
}

interface Props {
    mustahiqs: {
        data: Mustahiq[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search?: string;
        ashnaf?: string;
    };
}

const ASHNAF_LABELS: Record<string, string> = {
    fakir: "Fakir",
    miskin: "Miskin",
    amil: "Amil",
    mualaf: "Mualaf",
    riqab: "Riqab",
    gharim: "Gharim",
    fisabilillah: "Fisabilillah",
    ibnusabil: "Ibnu Sabil",
};

const ASHNAF_STYLES: Record<string, string> = {
    fakir: "bg-red-50 text-red-700 border-red-200/50",
    miskin: "bg-orange-50 text-orange-700 border-orange-200/50",
    amil: "bg-blue-50 text-blue-700 border-blue-200/50",
    mualaf: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    riqab: "bg-purple-50 text-purple-700 border-purple-200/50",
    gharim: "bg-yellow-50 text-yellow-700 border-yellow-200/50",
    fisabilillah: "bg-teal-50 text-teal-700 border-teal-200/50",
    ibnusabil: "bg-indigo-50 text-indigo-700 border-indigo-200/50",
};

// ── Mobile Swipe Card ──────────────────────────────────────
function MobileSwipeCard({
    mustahiq,
    activeSwipeId,
    setActiveSwipeId,
    onEdit,
    onDelete,
}: {
    mustahiq: Mustahiq;
    activeSwipeId: string | null;
    setActiveSwipeId: (id: string | null) => void;
    onEdit: (m: Mustahiq) => void;
    onDelete: (id: string) => void;
}) {
    const controls = useAnimation();

    useEffect(() => {
        if (activeSwipeId !== mustahiq.id) controls.start({ x: 0 });
    }, [activeSwipeId, mustahiq.id, controls]);

    const handleDragEnd = (_e: any, info: PanInfo) => {
        if (info.offset.x < -30 || info.velocity.x < -200) {
            controls.start({ x: -120 });
            setActiveSwipeId(mustahiq.id);
        } else {
            controls.start({ x: 0 });
            if (activeSwipeId === mustahiq.id) setActiveSwipeId(null);
        }
    };

    const initials = mustahiq.name.charAt(0).toUpperCase();
    const badgeStyle =
        ASHNAF_STYLES[mustahiq.ashnaf] ||
        "bg-slate-50 text-slate-600 border-slate-200";
    const badgeLabel = ASHNAF_LABELS[mustahiq.ashnaf] || mustahiq.ashnaf;

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-slate-50 border border-slate-100">
            {/* Action panel */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 gap-2 bg-slate-50">
                <button
                    onClick={() => onEdit(mustahiq)}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl"
                >
                    <Edit2 size={17} />
                </button>
                <button
                    onClick={() => onDelete(mustahiq.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl"
                >
                    <Trash2 size={17} />
                </button>
            </div>

            {/* Foreground card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 w-full bg-white px-4 py-3 flex items-center gap-3"
            >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                        {mustahiq.name}
                    </p>
                    <span
                        className={`inline-flex items-center mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${badgeStyle}`}
                    >
                        {badgeLabel}
                    </span>
                </div>

                {/* Alamat */}
                <div className="shrink-0 max-w-[38%] text-right">
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">
                            {mustahiq.address || "–"}
                        </span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────
export default function Index({ mustahiqs, filters }: Props) {
    const { auth } = usePage().props as any;
    const canCreate = ["super_admin", "bendahara", "petugas_zakat"].includes(
        auth.user.role,
    );

    const [search, setSearch] = useState(filters.search || "");
    const [ashnafFilter, setAshnafFilter] = useState(filters.ashnaf || "");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMustahiq, setEditingMustahiq] = useState<Mustahiq | null>(
        null,
    );
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: importData,
        setData: setImportData,
        post: postImport,
        processing: importing,
        reset: resetImport,
    } = useForm<{ file: File | null }>({ file: null });

    const handlePageNav = (direction: number, url: string | null) => {
        if (!url) return;
        router.get(
            url,
            { search, ashnaf: ashnafFilter, sort: sortAlpha, order: sortOrder },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Debounce search & filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                search !== (filters.search || "") ||
                ashnafFilter !== (filters.ashnaf || "")
            ) {
                router.get(
                    route("zakat.mustahiq"),
                    { search, ashnaf: ashnafFilter },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, ashnafFilter]);

    const handleSortToggle = () => {
        const next = sortOrder === "terbaru" ? "terlama" : "terbaru";
        setSortOrder(next);
        router.get(
            route("zakat.mustahiq"),
            { search, ashnaf: ashnafFilter, order: next },
            { preserveState: true, replace: true },
        );
    };

    const handleCreate = () => {
        setEditingMustahiq(null);
        setIsFormOpen(true);
    };
    const handleEdit = (m: Mustahiq) => {
        setEditingMustahiq(m);
        setIsFormOpen(true);
    };
    const handleDelete = (id: string) => setConfirmDeleteId(id);
    const confirmDelete = () => {
        if (confirmDeleteId) {
            router.delete(route("zakat.mustahiq.destroy", confirmDeleteId), {
                onSuccess: () => setConfirmDeleteId(null),
                preserveScroll: true,
            });
        }
    };
    const handleImport = () => {
        if (!importData.file) return;
        postImport(route("zakat.mustahiq.import"), {
            forceFormData: true,
            onSuccess: () => {
                setIsImportOpen(false);
                resetImport();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    return (
        <AppLayout title="Pengelola Zakat">
            <Head title="Manajemen Mustahiq" />

            {/* ═══════════════════════════════════════
                MOBILE ONLY
                ═══════════════════════════════════════ */}
            <div
                className="flex flex-col md:hidden -mx-4 -mt-2"
                style={{ height: "calc(100dvh - 56px - 68px)" }}
            >
                <div className="flex-1 overflow-y-auto">
                    {/* Sticky searchbar */}
                    <div className="sticky top-0 bg-slate-50 border-b border-slate-100 px-4 pb-2 pt-2 z-30 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau alamat..."
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
                                title={
                                    sortOrder === "terbaru"
                                        ? "Terbaru"
                                        : "Terlama"
                                }
                            >
                                <Clock size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Cards */}
                    <div
                        className={`px-4 pt-3 flex flex-col gap-2 ${mustahiqs.data.length > 0 ? "pb-24" : "pb-4"}`}
                    >
                        <AnimatePresence mode="popLayout">
                            {mustahiqs.data.map((mustahiq) => (
                                <motion.div
                                    key={mustahiq.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <MobileSwipeCard
                                        mustahiq={mustahiq}
                                        activeSwipeId={activeSwipeId}
                                        setActiveSwipeId={setActiveSwipeId}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {mustahiqs.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-slate-400 py-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Users className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-600 text-sm">
                                    Belum ada data mustahiq
                                </p>
                                {canCreate && (
                                    <button
                                        onClick={handleCreate}
                                        className="mt-3 text-xs text-emerald-600 font-medium"
                                    >
                                        + Daftarkan Mustahiq
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
                    onClick={handleCreate}
                    className="md:hidden fixed bottom-[104px] right-4 z-50 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-medium text-xs px-4 py-2.5 rounded-full shadow-md shadow-emerald-500/25 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Daftarkan
                </button>
            )}

            {/* ═══════════════════════════════════════
                DESKTOP ONLY — tidak berubah
                ═══════════════════════════════════════ */}
            <div className="hidden md:contents">
                <PageHeader
                    title="Data Mustahiq"
                    description="Kelola data penerima zakat berdasarkan pembagian 8 Ashnaf."
                >
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Excel
                    </button>
                    {mustahiqs.data.length > 0 && (
                        <PrimaryButton
                            onClick={handleCreate}
                            className="!py-2.5 font-medium cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Daftarkan Mustahiq
                        </PrimaryButton>
                    )}
                </PageHeader>

                <FilterBar
                    searchPlaceholder="Cari nama jamaah atau alamat..."
                    searchValue={search}
                    onSearchChange={setSearch}
                    addon={
                        <>
                            <CustomSelect
                                value={ashnafFilter}
                                onChange={(val) => setAshnafFilter(val)}
                                className="w-full sm:w-48"
                                options={[
                                    { value: "", label: "Semua Kategori" },
                                    ...Object.entries(ASHNAF_LABELS).map(
                                        ([value, label]) => ({ value, label }),
                                    ),
                                ]}
                            />
                        </>
                    }
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
                                key: "data",
                                header: "Data Mustahiq",
                                cellClassName: "whitespace-nowrap",
                                render: (mustahiq) => (
                                    <div className="flex items-center">
                                        <div className="font-bold text-slate-800">
                                            {mustahiq.name}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "ashnaf",
                                header: "Kategori (Ashnaf)",
                                cellClassName: "whitespace-nowrap",
                                render: (mustahiq) => (
                                    <span className="font-medium text-slate-700 capitalize">
                                        {ASHNAF_LABELS[mustahiq.ashnaf] ||
                                            mustahiq.ashnaf}
                                    </span>
                                ),
                            },
                            {
                                key: "alamat",
                                header: "Alamat",
                                cellClassName: "text-slate-600 max-w-xs",
                                render: (mustahiq) =>
                                    mustahiq.address ? (
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {mustahiq.address}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">
                                            Belum diisi
                                        </span>
                                    ),
                            },
                            {
                                key: "keterangan",
                                header: "Keterangan",
                                cellClassName: "text-slate-600 max-w-xs",
                                render: (mustahiq) => (
                                    <div className="line-clamp-2">
                                        {mustahiq.description || (
                                            <span className="text-slate-400 italic">
                                                Tidak ada keterangan
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: "actions",
                                header: "Aksi",
                                headerClassName: "text-right pr-6",
                                cellClassName:
                                    "whitespace-nowrap text-right text-sm",
                                render: (mustahiq) => (
                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(mustahiq)}
                                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Data"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(mustahiq.id)
                                            }
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Data"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ] satisfies ColumnDef<(typeof mustahiqs.data)[0]>[]
                    }
                    data={mustahiqs.data}
                    keyExtractor={(row) => row.id}
                    emptyState={
                        <EmptyState
                            message="Belum ada data mustahiq yang sesuai kriteria pencarian."
                            actionLabel="Daftarkan Mustahiq"
                            onAction={handleCreate}
                        />
                    }
                />

                {mustahiqs.last_page > 1 && (
                    <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 shrink-0">
                        <span className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">
                                {mustahiqs.total}
                            </span>{" "}
                            data{" · Halaman "}
                            <span className="font-semibold text-slate-800">
                                {mustahiqs.current_page}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-800">
                                {mustahiqs.last_page}
                            </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={!mustahiqs.prev_page_url}
                                onClick={() =>
                                    handlePageNav(-1, mustahiqs.prev_page_url)
                                }
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <AnimatePresence mode="popLayout">
                                {[
                                    mustahiqs.current_page - 1,
                                    mustahiqs.current_page,
                                    mustahiqs.current_page + 1,
                                ]
                                    .filter(
                                        (p) =>
                                            p >= 1 && p <= mustahiqs.last_page,
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
                                                    p === mustahiqs.current_page
                                                )
                                                    return;
                                                handlePageNav(
                                                    p > mustahiqs.current_page
                                                        ? 1
                                                        : -1,
                                                    p > mustahiqs.current_page
                                                        ? mustahiqs.next_page_url
                                                        : mustahiqs.prev_page_url,
                                                );
                                            }}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${p === mustahiqs.current_page ? "bg-green-600 text-white border-green-600 cursor-default" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                                        >
                                            {p}
                                        </motion.button>
                                    ))}
                            </AnimatePresence>
                            <button
                                type="button"
                                disabled={!mustahiqs.next_page_url}
                                onClick={() =>
                                    handlePageNav(1, mustahiqs.next_page_url)
                                }
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <MustahiqForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mustahiq={editingMustahiq}
            />
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Mustahiq?"
                variant="danger"
            >
                Apakah Anda yakin ingin menghapus data ini?
            </ConfirmDialog>

            {isImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Import Data Mustahiq
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setIsImportOpen(false);
                                    resetImport();
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) =>
                                        setImportData(
                                            "file",
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="hidden"
                                    id="import-file-mustahiq"
                                />
                                <label
                                    htmlFor="import-file-mustahiq"
                                    className="cursor-pointer"
                                >
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-slate-700">
                                        {importData.file
                                            ? importData.file.name
                                            : "Klik untuk pilih file"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        .xlsx, .xls, atau .csv (maks 5MB)
                                    </p>
                                </label>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500">
                                <p className="font-semibold text-slate-600 mb-1">
                                    Format kolom Excel:
                                </p>
                                <p>Nama | Ashnaf | Alamat | Keterangan</p>
                                <p className="mt-1 text-slate-400">
                                    Ashnaf: fakir, miskin, amil, mualaf, riqab,
                                    gharim, fisabilillah, ibnusabil
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-6 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsImportOpen(false);
                                    resetImport();
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importData.file || importing}
                                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {importing ? "Mengimport..." : "Import Data"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
