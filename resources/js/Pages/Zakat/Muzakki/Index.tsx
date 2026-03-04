import { useState, useEffect, useRef } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import EmptyState from "@/Components/EmptyState";
import PrimaryButton from "@/Components/PrimaryButton";
import MuzakkiForm from "./Components/MuzakkiForm";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Phone,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Upload,
    FileSpreadsheet,
    X,
    ArrowUpDown,
    SlidersHorizontal,
    Clock,
    User,
} from "lucide-react";
import FilterBar from "@/Components/FilterBar";
import PageHeader from "@/Components/PageHeader";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import DataTable, { ColumnDef } from "@/Components/DataTable";

interface Muzakki {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface Props {
    muzakkis: {
        data: Muzakki[];
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
    };
}

// ── Mobile Swipe Card ──────────────────────────────────────
function MobileSwipeCard({
    muzakki,
    activeSwipeId,
    setActiveSwipeId,
    onEdit,
    onDelete,
}: {
    muzakki: Muzakki;
    activeSwipeId: string | null;
    setActiveSwipeId: (id: string | null) => void;
    onEdit: (m: Muzakki) => void;
    onDelete: (id: string) => void;
}) {
    const controls = useAnimation();

    useEffect(() => {
        if (activeSwipeId !== muzakki.id) controls.start({ x: 0 });
    }, [activeSwipeId, muzakki.id, controls]);

    const handleDragEnd = (_e: any, info: PanInfo) => {
        if (info.offset.x < -30 || info.velocity.x < -200) {
            controls.start({ x: -120 });
            setActiveSwipeId(muzakki.id);
        } else {
            controls.start({ x: 0 });
            if (activeSwipeId === muzakki.id) setActiveSwipeId(null);
        }
    };

    const initials = muzakki.name.charAt(0).toUpperCase();

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-slate-50 border border-slate-100">
            {/* Action panel */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 gap-2 bg-slate-50">
                <button
                    onClick={() => onEdit(muzakki)}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl"
                >
                    <Edit2 size={17} />
                </button>
                <button
                    onClick={() => onDelete(muzakki.id)}
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
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                        {muzakki.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Phone size={11} />
                        {muzakki.phone || "Belum diisi"}
                    </p>
                </div>

                {/* Alamat */}
                <div className="shrink-0 max-w-[40%] text-right">
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 justify-end">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">
                            {muzakki.address || "–"}
                        </span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────
export default function Index({ muzakkis, filters }: Props) {
    const { auth } = usePage().props as any;
    const canCreate = ["super_admin", "bendahara", "petugas_zakat"].includes(
        auth.user.role,
    );

    const [search, setSearch] = useState(filters.search || "");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMuzakki, setEditingMuzakki] = useState<Muzakki | null>(null);
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
            { search, sort: sortAlpha, order: sortOrder },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || "")) {
                router.get(
                    route("zakat.muzakki"),
                    { search },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSortToggle = () => {
        const next = sortOrder === "terbaru" ? "terlama" : "terbaru";
        setSortOrder(next);
        router.get(
            route("zakat.muzakki"),
            { search, order: next },
            { preserveState: true, replace: true },
        );
    };

    const handleCreate = () => {
        setEditingMuzakki(null);
        setIsFormOpen(true);
    };
    const handleEdit = (muzakki: Muzakki) => {
        setEditingMuzakki(muzakki);
        setIsFormOpen(true);
    };
    const handleDelete = (id: string) => setConfirmDeleteId(id);
    const confirmDelete = () => {
        if (confirmDeleteId) {
            router.delete(route("zakat.muzakki.destroy", confirmDeleteId), {
                onSuccess: () => setConfirmDeleteId(null),
                preserveScroll: true,
            });
        }
    };
    const handleImport = () => {
        if (!importData.file) return;
        postImport(route("zakat.muzakki.import"), {
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
            <Head title="Manajemen Muzakki" />

            {/* ═══════════════════════════════════════
                MOBILE ONLY — Scroll-then-Stick Layout
                ═══════════════════════════════════════ */}
            <div
                className="flex flex-col md:hidden -mx-4 -mt-2"
                style={{ height: "calc(100dvh - 56px - 68px)" }}
            >
                <div className="flex-1 overflow-y-auto">
                    {/* Sticky searchbar + sort icon */}
                    <div className="sticky top-0 bg-slate-50 border-b border-slate-100 px-4 pb-2 pt-2 z-30 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau no telepon..."
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
                        className={`px-4 pt-3 flex flex-col gap-2 ${muzakkis.data.length > 0 ? "pb-24" : "pb-4"}`}
                    >
                        <AnimatePresence mode="popLayout">
                            {muzakkis.data.map((muzakki) => (
                                <motion.div
                                    key={muzakki.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <MobileSwipeCard
                                        muzakki={muzakki}
                                        activeSwipeId={activeSwipeId}
                                        setActiveSwipeId={setActiveSwipeId}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {muzakkis.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-slate-400 py-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <User className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-600 text-sm">
                                    Belum ada data muzakki
                                </p>
                                {canCreate && (
                                    <button
                                        onClick={handleCreate}
                                        className="mt-3 text-xs text-emerald-600 font-medium"
                                    >
                                        + Daftarkan Muzakki
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAB — mobile only */}
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
                    title="Data Muzakki"
                    description="Kelola direktori donatur zakat, infaq, dan shodaqoh."
                >
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Excel
                    </button>
                    {muzakkis.data.length > 0 && (
                        <PrimaryButton
                            onClick={handleCreate}
                            className="!py-2.5 font-medium cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Daftarkan Muzakki
                        </PrimaryButton>
                    )}
                </PageHeader>

                <FilterBar
                    searchPlaceholder="Cari nama jamaah atau nomor telepon..."
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
                                key: "info",
                                header: "Informasi Muzakki",
                                render: (muzakki) => (
                                    <div className="flex items-center">
                                        <div>
                                            <div className="font-bold text-slate-800">
                                                {muzakki.name}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                ID: {muzakki.id.substring(0, 8)}
                                                ...
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "phone",
                                header: "Kontak",
                                cellClassName:
                                    "whitespace-nowrap text-slate-600 font-medium",
                                render: (muzakki) =>
                                    muzakki.phone ? (
                                        <div className="flex items-center text-slate-600">
                                            <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                            {muzakki.phone}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">
                                            Belum diisi
                                        </span>
                                    ),
                            },
                            {
                                key: "address",
                                header: "Alamat",
                                cellClassName: "text-slate-600 max-w-xs",
                                render: (muzakki) =>
                                    muzakki.address ? (
                                        <div className="flex items-start">
                                            <MapPin className="w-3.5 h-3.5 mr-2 mt-1 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {muzakki.address}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">
                                            Belum diisi
                                        </span>
                                    ),
                            },
                            {
                                key: "actions",
                                header: "Aksi",
                                headerClassName: "text-right pr-6",
                                cellClassName:
                                    "whitespace-nowrap text-right text-sm",
                                render: (muzakki) => (
                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(muzakki)}
                                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Data"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(muzakki.id)
                                            }
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Data"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ] satisfies ColumnDef<(typeof muzakkis.data)[0]>[]
                    }
                    data={muzakkis.data}
                    keyExtractor={(row) => row.id}
                    emptyState={
                        <EmptyState
                            message="Belum ada data muzakki yang sesuai kriteria pencarian."
                            actionLabel="Daftarkan Muzakki"
                            onAction={handleCreate}
                        />
                    }
                />

                {/* Pagination */}
                {muzakkis.last_page > 1 && (
                    <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 shrink-0">
                        <span className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">
                                {muzakkis.total}
                            </span>{" "}
                            data{" · Halaman "}
                            <span className="font-semibold text-slate-800">
                                {muzakkis.current_page}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-800">
                                {muzakkis.last_page}
                            </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={!muzakkis.prev_page_url}
                                onClick={() =>
                                    handlePageNav(-1, muzakkis.prev_page_url)
                                }
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <AnimatePresence mode="popLayout">
                                {[
                                    muzakkis.current_page - 1,
                                    muzakkis.current_page,
                                    muzakkis.current_page + 1,
                                ]
                                    .filter(
                                        (p) =>
                                            p >= 1 && p <= muzakkis.last_page,
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
                                                if (p === muzakkis.current_page)
                                                    return;
                                                handlePageNav(
                                                    p > muzakkis.current_page
                                                        ? 1
                                                        : -1,
                                                    p > muzakkis.current_page
                                                        ? muzakkis.next_page_url
                                                        : muzakkis.prev_page_url,
                                                );
                                            }}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                                                p === muzakkis.current_page
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
                                disabled={!muzakkis.next_page_url}
                                onClick={() =>
                                    handlePageNav(1, muzakkis.next_page_url)
                                }
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals (always rendered) ── */}
            <MuzakkiForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                muzakki={editingMuzakki}
            />
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Muzakki?"
                variant="danger"
            >
                Apakah Anda yakin ingin menghapus data ini? Data transaksi
                terkait tidak akan dihapus permanen, namun status donatur ini
                akan dinonaktifkan.
            </ConfirmDialog>

            {isImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-xl">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Import Data Muzakki
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
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors">
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
                                    id="import-file-muzakki"
                                />
                                <label
                                    htmlFor="import-file-muzakki"
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
                                <p>Nama | No HP | Alamat</p>
                                <p className="mt-1 text-slate-400">
                                    Baris pertama harus berisi header (Nama,
                                    No_HP, Alamat)
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
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
