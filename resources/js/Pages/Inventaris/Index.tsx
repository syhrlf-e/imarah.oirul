import React, { useState } from "react";
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
    ArrowUpDown,
    SlidersHorizontal,
} from "lucide-react";

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
}

export default function InventarisIndex({
    auth,
    items,
}: PageProps<{ items: PaginationData }>) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        processing,
    } = useForm({
        item_name: "",
        quantity: 1,
        condition: "baik",
        location: "",
        notes: "",
    });

    const openAddModal = () => {
        setEditingItem(null);
        reset();
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
        }, 200);
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
        baik: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        rusak_ringan: "bg-amber-50 text-amber-700 border-amber-200/50",
        rusak_berat: "bg-red-50 text-red-700 border-red-200/50",
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
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6">
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
                            placeholder="Cari nama barang..."
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

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left align-middle">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nama Barang</th>
                                <th className="px-6 py-4 text-center">
                                    Jumlah
                                </th>
                                <th className="px-6 py-4">Kondisi</th>
                                <th className="px-6 py-4">Lokasi</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {items.data.length > 0 ? (
                                items.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                                                    <Box size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-700">
                                                    {item.item_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${conditionStyles[item.condition]}`}
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
                                        colSpan={6}
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
                {items.links && items.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-slate-900">
                                {items.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900">
                                {items.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900">
                                {items.total || 0}
                            </span>
                        </div>
                        <div className="flex justify-center space-x-1">
                            {items.links.map((link, idx) =>
                                link.url ? (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            router.get(link.url as string)
                                        }
                                        className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: cleanHtmlEntities(
                                                    link.label,
                                                ),
                                            }}
                                        ></div>
                                    </button>
                                ) : (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{
                                            __html: cleanHtmlEntities(
                                                link.label,
                                            ),
                                        }}
                                    ></span>
                                ),
                            )}
                        </div>
                    </div>
                )}
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
                                        onChange={(e) =>
                                            setData("item_name", e.target.value)
                                        }
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
                                            onChange={(e) =>
                                                setData(
                                                    "quantity",
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
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
                                        onChange={(e) =>
                                            setData("location", e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
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
