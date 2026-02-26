import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/Components/Toast";
import GlobalToastListener from "@/Components/GlobalToastListener";
import {
    LayoutDashboard,
    Wallet,
    Box,
    Archive,
    Calendar,
    FileText,
    Settings,
    Menu,
    X,
    UserCircle,
    Home,
    LogOut,
    ChevronRight,
    Bell,
    ShieldCheck,
    AlertOctagon,
} from "lucide-react";
import { User, PageProps } from "@/types";
import BottomNav from "@/Components/BottomNav";

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: Props) {
    const { props, url, component } = usePage<any>();
    const { auth } = props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isZakatOpen, setIsZakatOpen] = useState(url.startsWith("/zakat"));
    const [isTromolOpen, setIsTromolOpen] = useState(url.startsWith("/tromol"));
    const [scrolled, setScrolled] = useState(false);
    const [isKickedOut, setIsKickedOut] = useState(false);

    // Heartbeat Polling: Cek apakah akun masih aktif / belum dihapus admin
    useEffect(() => {
        const interval = setInterval(() => {
            // Karena kita mendaftarkan global interceptor, abaikan alert toast jika 401/403 dari Heartbeat
            window.axios
                .get("/api/session-heartbeat", {
                    // Konfigurasi ini memberitahu interceptor custom kita untuk tidak memunculkan toast pada background check
                    headers: { "X-Silent-Ping": "true" },
                })
                .catch((err) => {
                    if (
                        err.response &&
                        (err.response.status === 401 ||
                            err.response.status === 403)
                    ) {
                        setIsKickedOut(true);
                    }
                });
        }, 10000); // 10 Detik sekali

        return () => clearInterval(interval);
    }, []);

    // Handle scroll for glassmorphism header effect on mobile
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const isActive = (route: string) => url.startsWith(route);

    return (
        <div className="h-screen bg-slate-100 font-sans flex text-slate-900 overflow-hidden text-sm">
            <Toaster />
            <GlobalToastListener />
            {/* PWA Window Controls Overlay - Drag Region */}
            <div className="pwa-titlebar-drag"></div>
            {/* Sidebar (Desktop Only) */}
            <aside className="hidden md:flex flex-col z-10 w-72 bg-white my-4 ml-4 rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-poppins">
                                Imarah
                            </h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                Sistem manajemen masjid
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 flex flex-col overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    <Link
                        href="/dashboard"
                        className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive("/dashboard")
                                ? "text-emerald-700 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        {isActive("/dashboard") && (
                            <motion.div
                                layoutId="sidebarActiveMenu"
                                className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                        <LayoutDashboard
                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/dashboard") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        />
                        Dashboard
                    </Link>

                    {/* Kas Masjid (Admin & Bendahara) */}
                    {["super_admin", "bendahara"].includes(auth.user.role) && (
                        <Link
                            href="/kas"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive("/kas")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/kas") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <Wallet
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/kas") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Kas Masjid
                        </Link>
                    )}

                    {/* Inventaris (Admin & Sekretaris) */}
                    {["super_admin", "sekretaris"].includes(auth.user.role) && (
                        <Link
                            href="/inventaris"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive("/inventaris")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/inventaris") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <Archive
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/inventaris") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Inventaris
                        </Link>
                    )}

                    {/* Agenda (Super Admin) */}
                    {["super_admin"].includes(auth.user.role) && (
                        <Link
                            href="/agenda"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive("/agenda")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/agenda") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <Calendar
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/agenda") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Agenda
                        </Link>
                    )}

                    {/* Laporan (Super Admin & Bendahara) */}
                    {["super_admin", "bendahara"].includes(auth.user.role) && (
                        <Link
                            href="/laporan"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive("/laporan")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/laporan") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <FileText
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/laporan") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Laporan
                        </Link>
                    )}

                    {["super_admin", "bendahara", "petugas_zakat"].includes(
                        auth.user.role,
                    ) && (
                        <>
                            {auth.user.role === "petugas_zakat" ? (
                                <>
                                    {/* Urutan datar khusus Petugas Zakat */}
                                    <Link
                                        href="/zakat/muzakki"
                                        className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/zakat/muzakki") ? "text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        {isActive("/zakat/muzakki") && (
                                            <motion.div
                                                layoutId="sidebarActiveMenu"
                                                className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <UserCircle
                                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/zakat/muzakki") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                        />
                                        Data Muzakki
                                    </Link>
                                    <Link
                                        href="/zakat/mustahiq"
                                        className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/zakat/mustahiq") ? "text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        {isActive("/zakat/mustahiq") && (
                                            <motion.div
                                                layoutId="sidebarActiveMenu"
                                                className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <UserCircle
                                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/zakat/mustahiq") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                        />
                                        Data Mustahiq
                                    </Link>
                                    <Link
                                        href="/zakat/penerimaan"
                                        className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/zakat/penerimaan") ? "text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        {isActive("/zakat/penerimaan") && (
                                            <motion.div
                                                layoutId="sidebarActiveMenu"
                                                className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <UserCircle
                                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/zakat/penerimaan") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                        />
                                        Penerimaan
                                    </Link>
                                    <Link
                                        href="/zakat/penyaluran"
                                        className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/zakat/penyaluran") ? "text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        {isActive("/zakat/penyaluran") && (
                                            <motion.div
                                                layoutId="sidebarActiveMenu"
                                                className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <UserCircle
                                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/zakat/penyaluran") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                        />
                                        Penyaluran
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {/* Zakat Collapsible (Admin & Bendahara) */}
                                    <div>
                                        <button
                                            onClick={() =>
                                                setIsZakatOpen(!isZakatOpen)
                                            }
                                            className={`group relative z-10 w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                isActive("/zakat") &&
                                                !isZakatOpen
                                                    ? "text-emerald-700 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            {isActive("/zakat") &&
                                                !isZakatOpen && (
                                                    <motion.div
                                                        layoutId="sidebarActiveMenu"
                                                        className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 30,
                                                        }}
                                                    />
                                                )}
                                            <div className="flex items-center">
                                                <UserCircle
                                                    className={`w-5 h-5 mr-3 transition-colors ${isActive("/zakat") && !isZakatOpen ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                                />
                                                Zakat
                                            </div>
                                            <ChevronRight
                                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isZakatOpen ? "rotate-90" : ""}`}
                                            />
                                        </button>

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isZakatOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                                        >
                                            <div className="pl-11 pr-3 py-1 space-y-1 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-slate-200">
                                                <Link
                                                    href="/zakat/muzakki"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${isActive("/zakat/muzakki") ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {isActive(
                                                        "/zakat/muzakki",
                                                    ) && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Muzakki
                                                </Link>
                                                <Link
                                                    href="/zakat/mustahiq"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${isActive("/zakat/mustahiq") ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {isActive(
                                                        "/zakat/mustahiq",
                                                    ) && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Mustahiq
                                                </Link>
                                                <Link
                                                    href="/zakat/penerimaan"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${isActive("/zakat/penerimaan") ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {isActive(
                                                        "/zakat/penerimaan",
                                                    ) && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Penerimaan
                                                </Link>
                                                <Link
                                                    href="/zakat/penyaluran"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${isActive("/zakat/penyaluran") ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {isActive(
                                                        "/zakat/penyaluran",
                                                    ) && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Penyaluran
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tromol Collapsible (Admin & Bendahara only) */}
                                    <div>
                                        <button
                                            onClick={() =>
                                                setIsTromolOpen(!isTromolOpen)
                                            }
                                            className={`group relative z-10 w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                isActive("/tromol") &&
                                                !isTromolOpen
                                                    ? "text-emerald-700 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            {isActive("/tromol") &&
                                                !isTromolOpen && (
                                                    <motion.div
                                                        layoutId="sidebarActiveMenu"
                                                        className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 30,
                                                        }}
                                                    />
                                                )}
                                            <div className="flex items-center">
                                                <Box
                                                    className={`w-5 h-5 mr-3 transition-colors ${isActive("/tromol") && !isTromolOpen ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                                />
                                                Tromol
                                            </div>
                                            <ChevronRight
                                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTromolOpen ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isTromolOpen ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                                        >
                                            <div className="pl-11 pr-3 py-1 space-y-1 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-slate-200">
                                                <Link
                                                    href="/tromol"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${url === "/tromol" ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {url === "/tromol" && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Daftar Kotak
                                                </Link>
                                                <Link
                                                    href="/tromol/history"
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors relative z-10 ${isActive("/tromol/history") ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                                >
                                                    {isActive(
                                                        "/tromol/history",
                                                    ) && (
                                                        <motion.div
                                                            layoutId="sidebarActiveMenu"
                                                            className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                        />
                                                    )}
                                                    Riwayat
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </nav>

                {/* Manajemen Pengguna & Pengaturan HANYA Super Admin (Mentok Bawah) */}
                {auth.user.role === "super_admin" && (
                    <div className="mt-auto p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                        <Link
                            href="/users"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1 ${
                                isActive("/users")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/users") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <ShieldCheck
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/users") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Manajemen Pengguna
                        </Link>
                        <Link
                            href="/settings"
                            className={`group relative z-10 flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive("/settings")
                                    ? "text-emerald-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {isActive("/settings") && (
                                <motion.div
                                    layoutId="sidebarActiveMenu"
                                    className="absolute inset-0 bg-emerald-50 rounded-xl shadow-sm shadow-emerald-100/50 -z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <Settings
                                className={`w-5 h-5 mr-3 transition-colors ${isActive("/settings") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            />
                            Pengaturan
                        </Link>
                    </div>
                )}
            </aside>

            <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative bg-slate-50/50">
                {/* Space Placeholder to prevent content jump due to fixed header */}
                {/* Space Placeholder to prevent content jump due to fixed header */}

                {/* Mobile Header (Expandable Island) */}
                <div className="md:hidden shrink-0 relative z-[100] mb-4 h-14 mt-4 mx-4">
                    {/* Dark Overlay placed behind everything when menu is open */}
                    <div
                        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-[90] ${
                            isSidebarOpen
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                        }`}
                        onClick={toggleSidebar}
                    />

                    {/* Fixed Island Header Container */}
                    <div className="fixed top-4 left-5 right-5 z-[100] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-3xl">
                        {/* Always visible header portion */}
                        <div className="flex items-center justify-between h-14 px-5 bg-transparent shrink-0">
                            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-poppins">
                                Imarah
                            </span>
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors relative">
                                    <Bell size={18} />
                                </button>
                                <button
                                    className="flex flex-col justify-center items-end cursor-pointer w-6 h-6 py-1 transition-all duration-300"
                                    onClick={toggleSidebar}
                                >
                                    {isSidebarOpen ? (
                                        <X
                                            size={20}
                                            className="text-slate-700 animate-in fade-in zoom-in duration-200"
                                        />
                                    ) : (
                                        <div className="flex flex-col gap-[4px] items-end w-5 animate-in fade-in zoom-in duration-200 pt-0.5">
                                            <div className="h-[2px] w-6 bg-slate-700 rounded-full" />
                                            <div className="h-[2px] w-4 bg-slate-700 rounded-full ml-auto" />
                                            <div className="h-[2px] w-6 bg-slate-700 rounded-full" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Expandable Menu Content - Sliding from bottom of the header */}
                        <div
                            className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                isSidebarOpen
                                    ? "max-h-[500px] opacity-100 pb-2"
                                    : "max-h-0 opacity-0 pointer-events-none"
                            }`}
                        >
                            <div className="border-t border-slate-100/60 mx-4 pt-3 flex flex-col gap-1">
                                {[
                                    {
                                        href: "/kas",
                                        label: "Kas Masjid",
                                        icon: Wallet,
                                        roles: ["bendahara"],
                                    },
                                    {
                                        href: "/inventaris",
                                        label: "Inventaris",
                                        icon: Archive,
                                        roles: ["super_admin", "sekretaris"],
                                    },
                                    {
                                        href: "/agenda",
                                        label: "Agenda",
                                        icon: Calendar,
                                        roles: ["super_admin"],
                                    },
                                    {
                                        href: "/laporan",
                                        label: "Laporan",
                                        icon: FileText,
                                        roles: ["bendahara"],
                                    },
                                    {
                                        href: "/zakat",
                                        label: "Zakat",
                                        icon: UserCircle,
                                        roles: ["bendahara"],
                                    },
                                    {
                                        href: "/tromol",
                                        label: "Kotak Tromol",
                                        icon: Box,
                                        roles: ["super_admin", "bendahara"],
                                    },

                                    // Mobile specific for petugas zakat (Flattened menu)
                                    {
                                        href: "/zakat/muzakki",
                                        label: "Data Muzakki",
                                        icon: UserCircle,
                                        roles: ["petugas_zakat"],
                                    },
                                    {
                                        href: "/zakat/mustahiq",
                                        label: "Data Mustahiq",
                                        icon: UserCircle,
                                        roles: ["petugas_zakat"],
                                    },
                                    {
                                        href: "/zakat/penerimaan",
                                        label: "Penerimaan",
                                        icon: UserCircle,
                                        roles: ["petugas_zakat"],
                                    },
                                    {
                                        href: "/zakat/penyaluran",
                                        label: "Penyaluran",
                                        icon: UserCircle,
                                        roles: ["petugas_zakat"],
                                    },

                                    {
                                        href: "/settings",
                                        label: "Pengaturan",
                                        icon: Settings,
                                        roles: ["super_admin"],
                                    },
                                    {
                                        href: "/users",
                                        label: "Manajemen Pengguna",
                                        icon: ShieldCheck,
                                        roles: ["super_admin"],
                                    },
                                ].map((item, index) => {
                                    // Check Role
                                    if (!item.roles.includes(auth.user.role))
                                        return null;

                                    const active = isActive(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={toggleSidebar}
                                            style={{
                                                transitionDelay: isSidebarOpen
                                                    ? `${index * 50}ms`
                                                    : "0ms",
                                            }}
                                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                                                active
                                                    ? item.roles.includes(
                                                          "super_admin",
                                                      ) &&
                                                      item.href === "/users"
                                                        ? "bg-purple-50 text-purple-700"
                                                        : "bg-emerald-50 text-emerald-700"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            } ${
                                                isSidebarOpen
                                                    ? "opacity-100 translate-y-0"
                                                    : "opacity-0 translate-y-2"
                                            }`}
                                        >
                                            <Icon
                                                className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${
                                                    active
                                                        ? item.roles.includes(
                                                              "super_admin",
                                                          ) &&
                                                          item.href === "/users"
                                                            ? "text-purple-600"
                                                            : "text-emerald-600"
                                                        : "text-slate-400"
                                                }`}
                                            />
                                            <span className="group-hover:translate-x-1 transition-transform">
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Desktop Header */}
                <header className="hidden md:block flex-none z-30 bg-white md:border-none relative shadow-sm md:mt-4 md:mx-4 md:rounded-2xl">
                    <div className="flex items-center justify-between h-[70px] px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            {title && (
                                <h1 className="text-lg font-semibold text-slate-900 tracking-tight hidden md:block">
                                    {title}
                                </h1>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors relative">
                                <Bell size={20} />
                            </button>

                            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                            <div className="relative">
                                {/* Invisible overlay to close dropdown on outside click */}
                                {isProfileOpen && (
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                )}

                                <div
                                    className="relative z-50 flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors -mr-2"
                                    onClick={() =>
                                        setIsProfileOpen(!isProfileOpen)
                                    }
                                >
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-medium text-slate-800 leading-tight">
                                            {auth.user.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 capitalize">
                                            {auth.user.role.replace("_", " ")}
                                        </p>
                                    </div>
                                    <div className="w-9 h-9 flex justify-center items-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                        {auth.user.name.charAt(0)}
                                    </div>
                                </div>

                                {/* Dropdown Menu Logout */}
                                <div
                                    className={`absolute right-0 top-[110%] w-48 bg-white rounded-xl shadow-lg border border-slate-100 transition-all duration-200 z-50 ${isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
                                >
                                    <div className="p-2">
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                                        >
                                            <LogOut
                                                size={16}
                                                className="mr-3"
                                            />
                                            Keluar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-20 md:p-6 no-scrollbar md:scrollbar-default relative flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={component}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full flex-1 flex flex-col lg:min-h-0"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <BottomNav
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
        </div>
    );
}
