import React, { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Plus,
    Edit2,
    Trash2,
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Search,
    ArrowUpDown,
    SlidersHorizontal,
} from "lucide-react";

interface User {
    id: string;
    name: string;
}

interface Agenda {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    location: string | null;
    type: "kajian" | "rapat" | "kegiatan_sosial" | "lainnya";
    created_at: string;
    creator?: User;
}

interface PaginationData {
    data: Agenda[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number;
    to: number;
}

export default function AgendaIndex({
    auth,
    agendas,
}: PageProps<{ agendas: PaginationData }>) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">(
        "terbaru",
    );
    const [sortAlpha, setSortAlpha] = useState<"a-z" | "z-a">("a-z");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);

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
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        type: "kajian",
    });

    const openAddModal = () => {
        setEditingAgenda(null);
        reset();
        setIsAddOpen(true);
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
        } catch {
            return "";
        }
    };

    const openEditModal = (agenda: Agenda) => {
        setEditingAgenda(agenda);
        setData({
            title: agenda.title,
            description: agenda.description || "",
            start_time: formatDateForInput(agenda.start_time),
            end_time: agenda.end_time
                ? formatDateForInput(agenda.end_time)
                : "",
            location: agenda.location || "",
            type: agenda.type,
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setTimeout(() => {
            setEditingAgenda(null);
            reset();
        }, 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAgenda) {
            put(route("agenda.update", editingAgenda.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("agenda.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus agenda ini?")) {
            destroy(route("agenda.destroy", id));
        }
    };

    const cleanHtmlEntities = (str: string) => {
        return str
            .replace(/&laquo;/g, "«")
            .replace(/&raquo;/g, "»")
            .replace(/&amp;/g, "&");
    };

    const typeStyles = {
        kajian: "bg-blue-50 text-blue-700 border-blue-200/50",
        rapat: "bg-purple-50 text-purple-700 border-purple-200/50",
        kegiatan_sosial: "bg-orange-50 text-orange-700 border-orange-200/50",
        lainnya: "bg-slate-100 text-slate-700 border-slate-200/50",
    };

    const formatDisplayDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const formatDisplayTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <AppLayout title="Pengelola Agenda">
            <Head title="Agenda Masjid" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Agenda Masjid
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola jadwal kajian, rapat, dan kegiatan komunitas di
                        masjid.
                    </p>
                </div>
                {["super_admin", "bendahara", "petugas_zakat"].includes(
                    auth.user.role,
                ) && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Agenda
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
                            placeholder="Cari agenda kegiatan..."
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
            {/* Grid vs Table View - Switch to a beautiful Card Grid for Agendas */}
            {agendas.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {agendas.data.map((agenda) => (
                        <div
                            key={agenda.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col h-full"
                        >
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeStyles[agenda.type]} capitalize`}
                                    >
                                        {agenda.type.replace(/_/g, " ")}
                                    </span>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {[
                                            "super_admin",
                                            "bendahara",
                                            "petugas_zakat",
                                        ].includes(auth.user.role) && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(agenda)
                                                    }
                                                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {auth.user.role ===
                                                    "super_admin" && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                agenda.id,
                                                            )
                                                        }
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                                    {agenda.title}
                                </h3>

                                <p className="text-sm text-slate-500 mb-6 line-clamp-3">
                                    {agenda.description || (
                                        <span className="italic text-slate-400">
                                            Tidak ada deskripsi
                                        </span>
                                    )}
                                </p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-start text-sm text-slate-600">
                                        <div className="mt-0.5 mr-3 p-1.5 bg-slate-50 rounded-lg text-emerald-600">
                                            <CalendarIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {formatDisplayDate(
                                                    agenda.start_time,
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {formatDisplayTime(
                                                    agenda.start_time,
                                                )}
                                                {agenda.end_time &&
                                                    ` - ${formatDisplayTime(agenda.end_time)}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="mr-3 p-1.5 bg-slate-50 rounded-lg text-emerald-600">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="truncate flex-1">
                                            {agenda.location || (
                                                <span className="italic text-slate-400">
                                                    Lokasi belum diatur
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Belum ada agenda
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
                        Jadwal kajian dan kegiatan masih kosong. Tambahkan
                        agenda baru untuk mulai menginformasikan kegiatan ke
                        jamaah.
                    </p>
                    {["super_admin", "bendahara", "petugas_zakat"].includes(
                        auth.user.role,
                    ) && (
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Sekarang
                        </button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {agendas.links && agendas.links.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <div className="text-sm text-slate-500 font-medium">
                        Menampilkan{" "}
                        <span className="text-slate-900">
                            {agendas.from || 0}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-900">
                            {agendas.to || 0}
                        </span>{" "}
                        dari{" "}
                        <span className="text-slate-900">
                            {agendas.total || 0}
                        </span>
                    </div>
                    <div className="flex justify-center space-x-1">
                        {agendas.links.map((link, idx) =>
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
                                        __html: cleanHtmlEntities(link.label),
                                    }}
                                ></span>
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Modal Add/Edit */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingAgenda
                                    ? "Edit Agenda Kegiatan"
                                    : "Tambah Agenda Baru"}
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

                        <div className="overflow-y-auto p-6">
                            <form
                                onSubmit={handleSubmit}
                                id="agenda-form"
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Judul Agenda *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        placeholder="Misal: Kajian Rutin Ba'da Subuh"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Waktu Mulai *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                value={data.start_time}
                                                onChange={(e) =>
                                                    setData(
                                                        "start_time",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                                required
                                            />
                                        </div>
                                        {errors.start_time && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.start_time}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Waktu Selesai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.end_time}
                                            onChange={(e) =>
                                                setData(
                                                    "end_time",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        />
                                        {errors.end_time && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.end_time}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Tipe Kegiatan *
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) =>
                                                setData(
                                                    "type",
                                                    e.target.value as any,
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        >
                                            <option value="kajian">
                                                Kajian
                                            </option>
                                            <option value="rapat">Rapat</option>
                                            <option value="kegiatan_sosial">
                                                Kegiatan Sosial
                                            </option>
                                            <option value="lainnya">
                                                Lainnya
                                            </option>
                                        </select>
                                        {errors.type && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Lokasi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) =>
                                                setData(
                                                    "location",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Masjid Utama / Zoom"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                        />
                                        {errors.location && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Deskripsi Kegiatan
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm resize-none"
                                        rows={3}
                                        placeholder="Ceritakan detail kegiatan atau tambahkan catatan khusus..."
                                    ></textarea>
                                    {errors.description && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="agenda-form"
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                            >
                                {processing ? "Menyimpan..." : "Simpan Agenda"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
