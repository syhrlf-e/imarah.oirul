import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Wallet,
    FileText,
    UserCircle,
    LogOut,
    Archive,
} from "lucide-react";

interface Props {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function BottomNav({ isSidebarOpen, toggleSidebar }: Props) {
    const { props, url } = usePage<any>();
    const { auth } = props;
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isActive = (route: string) => url.startsWith(route);

    return (
        <div className="flex md:hidden fixed bottom-4 left-4 right-4 h-[68px] bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 z-50">
            {/* Overlay for profile dropdown */}
            {isProfileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsProfileOpen(false)}
                ></div>
            )}

            <nav className="flex justify-around items-center w-full h-full relative z-50 px-2">
                <Link
                    href="/dashboard"
                    prefetch
                    onClick={() => setIsProfileOpen(false)}
                    className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/dashboard") ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                >
                    <LayoutDashboard
                        className={`w-5 h-5 ${
                            isActive("/dashboard")
                                ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]"
                                : "stroke-2"
                        }`}
                    />
                    <span className="text-[10px]">Dashboard</span>
                </Link>

                {["super_admin", "bendahara"].includes(auth.user?.role) && (
                    <Link
                        href="/kas"
                        prefetch
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/kas") ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                    >
                        <Wallet
                            className={`w-5 h-5 ${isActive("/kas") ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]" : "stroke-2"}`}
                        />
                        <span className="text-[10px]">Kas</span>
                    </Link>
                )}

                {auth.user?.role === "sekretaris" && (
                    <Link
                        href="/inventaris"
                        prefetch
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/inventaris") ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                    >
                        <Archive
                            className={`w-5 h-5 ${isActive("/inventaris") ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]" : "stroke-2"}`}
                        />
                        <span className="text-[10px]">Inventaris</span>
                    </Link>
                )}

                {["super_admin", "bendahara", "petugas_zakat"].includes(
                    auth.user?.role,
                ) && (
                    <Link
                        href={
                            auth.user?.role === "petugas_zakat"
                                ? "/zakat/muzakki"
                                : "/zakat"
                        }
                        prefetch
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/zakat") ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                    >
                        <UserCircle
                            className={`w-5 h-5 ${isActive("/zakat") ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]" : "stroke-2"}`}
                        />
                        <span className="text-[10px]">Zakat</span>
                    </Link>
                )}

                {["super_admin", "bendahara"].includes(auth.user?.role) && (
                    <Link
                        href="/laporan"
                        prefetch
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/laporan") ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                    >
                        <FileText
                            className={`w-5 h-5 ${isActive("/laporan") ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]" : "stroke-[1.5]"}`}
                        />
                        <span className="text-[10px]">Laporan</span>
                    </Link>
                )}

                <div className="relative flex flex-col items-center justify-center w-16 h-full">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 outline-none ${isProfileOpen ? "text-[#22C55E] font-semibold" : "text-slate-400 hover:text-slate-600 font-normal"}`}
                    >
                        <div
                            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold ${isProfileOpen ? "bg-[#22C55E] text-white" : "bg-slate-200 text-slate-500"}`}
                        >
                            {auth.user.name.charAt(0)}
                        </div>
                        <span className="text-[10px]">Profil</span>
                    </button>

                    {/* Logout Dropdown */}
                    <div
                        className={`absolute right-0 bottom-[calc(100%+16px)] w-48 bg-white rounded-2xl shadow-lg border border-slate-100 transition-all duration-200 ${isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`}
                    >
                        <div className="p-3 border-b border-slate-50">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize truncate">
                                {auth.user.role.replace("_", " ")}
                            </p>
                        </div>
                        <div className="p-2">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full flex items-center px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                            >
                                <LogOut size={14} className="mr-2.5" />
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
