import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
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
    ChevronDown,
    ChevronRight,
    Bell,
} from "lucide-react";
import { User, PageProps } from "@/types";
import BottomNav from "@/Components/BottomNav";

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: Props) {
    const { props, url } = usePage<any>();
    const { auth } = props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isZakatOpen, setIsZakatOpen] = useState(url.startsWith("/zakat"));
    const [isTromolOpen, setIsTromolOpen] = useState(url.startsWith("/tromol"));
    const [scrolled, setScrolled] = useState(false);

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
            {/* PWA Window Controls Overlay - Drag Region */}
            <div className="pwa-titlebar-drag"></div>
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col md:translate-x-0 md:static md:inset-auto md:my-4 md:ml-4 md:rounded-2xl md:shadow-sm ${
                    isSidebarOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full"
                }`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
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
                    <div className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Menu Utama
                    </div>

                    <Link
                        href="/dashboard"
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive("/dashboard")
                                ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <LayoutDashboard
                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/dashboard") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        />
                        Dashboard
                    </Link>

                    {/* Zakat Collapsible */}
                    {["super_admin", "bendahara", "petugas_zakat"].includes(
                        auth.user.role,
                    ) && (
                        <div>
                            <button
                                onClick={() => setIsZakatOpen(!isZakatOpen)}
                                className={`group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive("/zakat") && !isZakatOpen
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
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
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isZakatOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                            >
                                <div className="pl-11 pr-3 py-1 space-y-1 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-slate-200">
                                    <Link
                                        href="/zakat/muzakki"
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors relative ${isActive("/zakat/muzakki") ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                    >
                                        Muzakki
                                    </Link>
                                    <Link
                                        href="/zakat/mustahiq"
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors relative ${isActive("/zakat/mustahiq") ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                    >
                                        Mustahiq
                                    </Link>
                                    <Link
                                        href="/zakat/transaksi"
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors relative ${isActive("/zakat/transaksi") ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                    >
                                        Transaksi
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tromol Collapsible */}
                    {["super_admin", "bendahara", "petugas_zakat"].includes(
                        auth.user.role,
                    ) && (
                        <div>
                            <button
                                onClick={() => setIsTromolOpen(!isTromolOpen)}
                                className={`group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive("/tromol") && !isTromolOpen
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
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
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors relative ${url === "/tromol" ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                    >
                                        Daftar Kotak
                                    </Link>
                                    <Link
                                        href="/tromol/history"
                                        className={`block px-3 py-2 text-sm rounded-lg transition-colors relative ${isActive("/tromol/history") ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                    >
                                        Riwayat
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Administrasi
                    </div>

                    {/* Kas Masjid & Inventaris (Admin & Bendahara only) */}
                    {["super_admin", "bendahara"].includes(auth.user.role) && (
                        <>
                            <Link
                                href="/kas"
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive("/kas")
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <Wallet
                                    className={`w-5 h-5 mr-3 transition-colors ${isActive("/kas") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                />
                                Kas Masjid
                            </Link>

                            <Link
                                href="/inventaris"
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive("/inventaris")
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <Archive
                                    className={`w-5 h-5 mr-3 transition-colors ${isActive("/inventaris") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                />
                                Inventaris
                            </Link>
                        </>
                    )}

                    <Link
                        href="/agenda"
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive("/agenda")
                                ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Calendar
                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/agenda") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        />
                        Agenda
                    </Link>

                    <Link
                        href="/laporan"
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive("/laporan")
                                ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <FileText
                            className={`w-5 h-5 mr-3 transition-colors ${isActive("/laporan") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        />
                        Laporan
                    </Link>

                    {/* Pengaturan hanya Super Admin & Bendahara */}
                    {["super_admin", "bendahara"].includes(auth.user.role) && (
                        <div className="mt-auto pt-4 border-t border-slate-200">
                            <Link
                                href="/settings"
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive("/settings")
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <Settings
                                    className={`w-5 h-5 mr-3 transition-colors ${isActive("/settings") ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                                />
                                Pengaturan
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Desktop/Mobile Header */}
                <header className="flex-none z-30 bg-white border-b border-slate-200 md:border-none relative shadow-sm md:mt-4 md:mx-4 md:rounded-2xl">
                    <div className="flex items-center justify-between h-[70px] px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            {title && (
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight hidden md:block">
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
                                        <p className="text-sm font-bold text-slate-800 leading-tight">
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

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:p-4 relative flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={url}
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
