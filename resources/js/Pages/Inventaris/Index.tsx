import React, { useState, useEffect, useCallback, useRef } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Plus,
    Edit2,
    Trash2,
    Box,
    Info,
    Search,
    ChevronDown,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
    id: string;
    name: string;
}

interface InventoryItem {
    id: string;
    item_name: string;
    quantity: number;
    condition: "baik" | "rusak_ringan" | "rusak_berat";
    location: string | null;
    notes: string | null;
    created_at: string;
    creator?: User;
}

interface PaginationData {
    data: InventoryItem[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function InventarisIndex({
    auth,
    items,
    filters,
}: PageProps<{
    items: PaginationData;
    filters?: { search?: string; condition?: string };
}>) {
    const [search, setSearch] = useState(filters?.search || "");
    const [conditionFilter, setConditionFilter] = useState(
        filters?.condition || "semua",
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        clearErrors,
        errors,
        processing,
    } = useForm({
        item_name: "",
        quantity: "" as number | string,
        condition: "baik",
        location: "",
        notes: "",
    });

    const openAddModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setData({
            item_name: "",
            quantity: "" as number | string,
            condition: "baik",
            location: "",
            notes: "",
        });
        setIsAddOpen(true);
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setData({
            item_name: item.item_name,
            quantity: item.quantity,
            condition: item.condition,
            location: item.location || "",
            notes: item.notes || "",
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setTimeout(() => {
            setEditingItem(null);
            reset();
            clearErrors();
            setData({
                item_name: "",
                quantity: "" as number | string,
                condition: "baik",
                location: "",
                notes: "",
            });
        }, 200);
    };

    const applyFilters = useCallback(
        (params: { search?: string; condition?: string; page?: number }) => {
            router.get(
                route("inventaris.index"),
                {
                    search: params.search ?? search,
                    condition: params.condition ?? conditionFilter,
                    ...(params.page ? { page: params.page } : {}),
                },
                {
                    only: ["items", "filters"],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        },
        [search, conditionFilter],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        searchTimer.current = setTimeout(() => {
            applyFilters({ search: value, page: 1 });
        }, 500);
    };

    const handlePageNav = (direction: number, url: string | null) => {
        if (!url) return;
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get("page");
        applyFilters({ page: page ? parseInt(page) : 1 });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route("inventaris.update", editingItem.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("inventaris.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
            destroy(route("inventaris.destroy", id));
        }
    };

    const cleanHtmlEntities = (str: string) => {
        return str
            .replace(/&laquo;/g, "«")
            .replace(/&raquo;/g, "»")
            .replace(/&amp;/g, "&");
    };

    const conditionStyles = {
        baik: "bg-white text-emerald-600 border-emerald-300 font-medium",
        rusak_ringan: "bg-white text-amber-600 border-amber-300 font-medium",
        rusak_berat: "bg-white text-red-600 border-red-300 font-medium",
    };

    const conditionLabels = {
        baik: "Baik",
        rusak_ringan: "Rusak Ringan",
        rusak_berat: "Rusak Berat",
    };

    return (
        <AppLayout title="Pengelola Inventaris">
            <Head title="Inventaris Masjid" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Inventaris
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Daftar barang, fasilitas, dan aset yang dimiliki oleh
                        masjid.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Barang
                </button>
            </div>

            <div className="mb-2 relative z-20 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 shrink-0">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm"
                            placeholder="Cari nama barang..."
                        />
                    </div>

                    {/* Kondisi Filter Dropdown - Custom UI */}
                    <div className="relative shrink-0 z-50">
                        {/* Invisible overlay for closing dropdown */}
                        {isFilterOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsFilterOpen(false)}
                            ></div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="relative z-50 inline-flex items-center justify-between w-full sm:w-[180px] px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <span className="flex items-center">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="truncate">
                                    {conditionFilter === "semua" ||
                                    !conditionFilter
                                        ? "Semua Kondisi"
                                        : conditionLabels[
                                              conditionFilter as keyof typeof conditionLabels
                                          ]}
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 ${isFilterOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[60] p-1"
                                >
                                    {[
                                        {
                                            value: "semua",
                                            label: "Semua Kondisi",
                                        },
                                        { value: "baik", label: "Baik" },
                                        {
                                            value: "rusak_ringan",
                                            label: "Rusak Ringan",
                                        },
                                        {
                                            value: "rusak_berat",
                                            label: "Rusak Berat",
                                        },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setConditionFilter(opt.value);
                                                setIsFilterOpen(false);
                                                applyFilters({
                                                    condition: opt.value,
                                                    page: 1,
                                                });
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                (conditionFilter || "semua") ===
                                                opt.value
                                                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0">
                <div
                    className="inventaris-table-scroll overflow-x-auto overflow-y-auto rounded-t-2xl flex-1 min-h-0"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#CBD5E1 transparent",
                    }}
                >
                    <style>{`
                        .inventaris-table-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                        .inventaris-table-scroll::-webkit-scrollbar-track { background: transparent; }
                        .inventaris-table-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
                        .inventaris-table-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                    `}</style>
                    <table className="w-full text-sm text-left align-middle table-fixed">
                        <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-[15%]">Tanggal</th>
                                <th className="px-6 py-4 w-[20%]">
                                    Nama Barang
                                </th>
                                <th className="px-6 py-4 text-center w-[12%]">
                                    Jumlah
                                </th>
                                <th className="px-6 py-4 w-[13%]">Kondisi</th>
                                <th className="px-6 py-4 w-[15%]">Lokasi</th>
                                <th className="px-6 py-4 w-[15%]">
                                    Keterangan
                                </th>
                                <th className="px-6 py-4 text-right w-[10%]">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {items.data.length > 0 ? (
                                items.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium text-sm">
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-slate-700">
                                                {item.item_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-slate-700 font-medium">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${conditionStyles[item.condition]}`}
                                            >
                                                {
                                                    conditionLabels[
                                                        item.condition
                                                    ]
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {item.location || (
                                                <span className="text-slate-400 italic">
                                                    Belum diatur
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                                            {item.notes || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Barang"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Barang"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <Info className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600">
                                                Belum ada data barang
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-800">
                            {items.total}
                        </span>{" "}
                        data
                        {" · Halaman "}
                        <span className="font-semibold text-slate-800">
                            {items.current_page}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-slate-800">
                            {items.last_page}
                        </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={!items.prev_page_url}
                            onClick={() =>
                                handlePageNav(-1, items.prev_page_url)
                            }
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <AnimatePresence mode="popLayout">
                            {[
                                items.current_page - 1,
                                items.current_page,
                                items.current_page + 1,
                            ]
                                .filter((p) => p >= 1 && p <= items.last_page)
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
                                            if (p === items.current_page)
                                                return;
                                            handlePageNav(
                                                p > items.current_page ? 1 : -1,
                                                p > items.current_page
                                                    ? items.next_page_url
                                                    : items.prev_page_url,
                                            );
                                        }}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                                            p === items.current_page
                                                ? "bg-emerald-600 text-white border-emerald-600 cursor-default"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {p}
                                    </motion.button>
                                ))}
                        </AnimatePresence>

                        <button
                            type="button"
                            disabled={!items.next_page_url}
                            onClick={() =>
                                handlePageNav(1, items.next_page_url)
                            }
                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Add/Edit */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingItem
                                    ? "Edit Data Barang"
                                    : "Tambah Barang Baru"}
                            </h3>
                            <button
                                onClick={closeModal}
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

                        <form onSubmit={handleSubmit} className="px-6 py-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Nama Barang *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.item_name}
                                        onChange={(e) => {
                                            const sanitized =
                                                e.target.value.replace(
                                                    /[<>()[\]{}]/g,
                                                    "",
                                                );
                                            setData("item_name", sanitized);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        placeholder="Misal: Kipas Angin Dinding"
                                        required
                                    />
                                    {errors.item_name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.item_name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Jumlah *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Allow empty string to completely clear the input
                                                if (val === "") {
                                                    setData("quantity", "");
                                                    return;
                                                }
                                                // Parse to int to remove leading zeros, then update state
                                                const parsed = parseInt(
                                                    val,
                                                    10,
                                                );
                                                if (
                                                    !isNaN(parsed) &&
                                                    parsed >= 0
                                                ) {
                                                    setData("quantity", parsed);
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                            required
                                        />
                                        {errors.quantity && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.quantity}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Kondisi *
                                        </label>
                                        <select
                                            value={data.condition}
                                            onChange={(e) =>
                                                setData(
                                                    "condition",
                                                    e.target.value as any,
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        >
                                            <option value="baik">Baik</option>
                                            <option value="rusak_ringan">
                                                Rusak Ringan
                                            </option>
                                            <option value="rusak_berat">
                                                Rusak Berat
                                            </option>
                                        </select>
                                        {errors.condition && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.condition}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Lokasi Penyimpanan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => {
                                            const sanitized =
                                                e.target.value.replace(
                                                    /[<>()[\]{}]/g,
                                                    "",
                                                );
                                            setData("location", sanitized);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        placeholder="Misal: Gudang Belakang"
                                    />
                                    {errors.location && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.location}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Keterangan / Catatan
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => {
                                            const sanitized =
                                                e.target.value.replace(
                                                    /[<>()[\]{}]/g,
                                                    "",
                                                );
                                            setData("notes", sanitized);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm resize-none"
                                        rows={3}
                                        placeholder="Tambahkan informasi detail jika perlu..."
                                    ></textarea>
                                    {errors.notes && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Simpan Data"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
