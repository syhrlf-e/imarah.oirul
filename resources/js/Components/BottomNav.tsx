import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Wallet,
    FileText,
    UserCircle,
    Menu,
    LogOut,
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
        <div className="md:hidden fixed bottom-4 inset-x-4 z-50 pointer-events-none">
            <nav className="bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 rounded-2xl mx-auto max-w-sm pointer-events-auto overflow-hidden">
                <div className="flex justify-around items-center h-[4.5rem] px-2 w-full relative">
                    {/* User Profile Dropdown (Mobile Only) */}
                    <div
                        className={`absolute bottom-[110%] right-4 w-48 bg-white rounded-xl shadow-lg border border-slate-100 transition-all duration-200 z-50 origin-bottom-right ${isProfileOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}`}
                    >
                        <div className="p-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                                {auth.user.role.replace("_", " ")}
                            </p>
                        </div>
                        <div className="p-2">
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                            >
                                <LogOut size={16} className="mr-3" />
                                Keluar
                            </Link>
                        </div>
                    </div>

                    {/* Invisible overlay to close dropdown on outside click */}
                    {isProfileOpen && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileOpen(false)}
                        ></div>
                    )}
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/dashboard") ? "text-green-500" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <LayoutDashboard
                            size={22}
                            className={
                                isActive("/dashboard")
                                    ? "fill-green-100 stroke-2"
                                    : "stroke-2"
                            }
                        />
                        <span className="text-[10px] font-semibold">
                            Dashboard
                        </span>
                    </Link>

                    {["super_admin", "bendahara"].includes(auth.user?.role) && (
                        <Link
                            href="/kas"
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/kas") ? "text-green-500" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <Wallet
                                size={22}
                                className={
                                    isActive("/kas")
                                        ? "fill-green-100 stroke-2"
                                        : "stroke-2"
                                }
                            />
                            <span className="text-[10px] font-semibold">
                                Kas
                            </span>
                        </Link>
                    )}

                    {["super_admin", "bendahara", "petugas_zakat"].includes(
                        auth.user?.role,
                    ) && (
                        <Link
                            href="/zakat"
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/zakat") ? "text-green-500" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <UserCircle
                                size={22}
                                className={
                                    isActive("/zakat")
                                        ? "fill-green-100 stroke-2"
                                        : "stroke-2"
                                }
                            />
                            <span className="text-[10px] font-semibold">
                                Zakat
                            </span>
                        </Link>
                    )}

                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex flex-col items-center justify-center w-16 h-full space-y-1 text-slate-400 hover:text-slate-600 relative z-50"
                    >
                        <div className="w-6 h-6 flex justify-center items-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm ring-2 ring-white">
                            {auth.user.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-semibold">
                            Profil
                        </span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
