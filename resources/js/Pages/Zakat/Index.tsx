import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    Users,
    Wallet,
    Calculator,
    ArrowRight,
    UserCheck,
    ArrowDownToLine,
    ArrowUpFromLine,
} from "lucide-react";

// ── Data menu untuk grid mobile 2x2 ──
const zakatMenusMobile = [
    {
        label: "Data Muzakki",
        routeName: "zakat.muzakki",
        icon: Users,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-500",
    },
    {
        label: "Data Mustahiq",
        routeName: "zakat.mustahiq",
        icon: UserCheck,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-500",
    },
    {
        label: "Penerimaan Zakat",
        routeName: "zakat.penerimaan",
        icon: ArrowDownToLine,
        bgColor: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },
    {
        label: "Penyaluran Zakat",
        routeName: "zakat.penyaluran",
        icon: ArrowUpFromLine,
        bgColor: "bg-amber-50",
        iconColor: "text-amber-500",
    },
];

// ── Data menu untuk list desktop (tidak berubah) ──
const menus = [
    {
        title: "Manajemen Muzakki",
        description: "Kelola data donatur zakat, infaq, dan shodaqoh.",
        icon: Users,
        href: route("zakat.muzakki"),
        color: "bg-blue-500",
    },
    {
        title: "Manajemen Mustahiq",
        description: "Kelola data penerima zakat (8 Ashnaf).",
        icon: Users,
        href: route("zakat.mustahiq"),
        color: "bg-purple-500",
    },
    {
        title: "Penerimaan Zakat",
        description: "Catat dan kelola penerimaan zakat maal & fitrah.",
        icon: Wallet,
        href: route("zakat.penerimaan"),
        color: "bg-emerald-500",
    },
    {
        title: "Penyaluran",
        description: "Kelola distribusi dan penyaluran dana zakat.",
        icon: Wallet,
        href: route("zakat.penyaluran"),
        color: "bg-amber-500",
    },
];

export default function Index() {
    return (
        <AppLayout title="Zakat">
            <Head title="Manajemen Zakat" />

            {/* ── Bagian 1: Judul & deskripsi — hanya tampil di desktop ── */}
            <div className="hidden md:block mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Modul Zakat
                </h1>
                <p className="mt-1 text-sm text-slate-700">
                    Pusat pengelolaan zakat, infaq, dan shodaqoh.
                </p>
            </div>

            {/* ── Bagian 2 & 3: MOBILE ONLY — Grid 2x2 dengan padding top ── */}
            <div className="pt-6 pb-4 md:hidden">
                <div className="grid grid-cols-2 gap-3 px-4">
                    {zakatMenusMobile.map((item) => (
                        <Link key={item.routeName} href={route(item.routeName)}>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col items-center justify-center gap-3 aspect-square active:scale-95 transition-transform">
                                {/* Icon container berwarna */}
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor}`}
                                >
                                    <item.icon
                                        size={22}
                                        className={item.iconColor}
                                    />
                                </div>

                                {/* Nama menu saja — tanpa deskripsi, tanpa "Buka Menu" */}
                                <span className="text-slate-800 text-sm font-semibold text-center leading-tight">
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── DESKTOP ONLY — List card dengan deskripsi & Buka Menu (tidak berubah) ── */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu, index) => (
                    <Link
                        key={index}
                        href={menu.href}
                        className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-slate-100 overflow-hidden group"
                    >
                        <div className="p-6">
                            <div
                                className={`w-12 h-12 ${menu.color} rounded-lg flex items-center justify-center mb-4 text-white shadow-sm`}
                            >
                                <menu.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                {menu.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {menu.description}
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
                                Buka Menu{" "}
                                <ArrowRight className="ml-1 w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
