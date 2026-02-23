import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Wallet,
    FileText,
    UserCircle,
    Menu,
} from "lucide-react";

interface Props {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function BottomNav({ isSidebarOpen, toggleSidebar }: Props) {
    const { props, url } = usePage<any>();
    const { auth } = props;

    const isActive = (route: string) => url.startsWith(route);

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] border-t border-slate-100 z-50 pb-safe pb-4">
            <div className="flex justify-around items-center h-16 px-2 w-full max-w-md mx-auto">
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
                    <span className="text-[10px] font-semibold">Dashboard</span>
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
                        <span className="text-[10px] font-semibold">Kas</span>
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
                        <span className="text-[10px] font-semibold">Zakat</span>
                    </Link>
                )}

                <Link
                    href="/laporan"
                    className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive("/laporan") ? "text-green-500" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <FileText
                        size={22}
                        className={
                            isActive("/laporan")
                                ? "fill-green-100 stroke-2"
                                : "stroke-[1.5]"
                        }
                    />
                    <span className="text-[10px] font-semibold">Laporan</span>
                </Link>

                <button
                    onClick={toggleSidebar}
                    className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isSidebarOpen ? "text-green-500" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <Menu
                        size={22}
                        className={isSidebarOpen ? "stroke-2" : "stroke-[1.5]"}
                    />
                    <span className="text-[10px] font-semibold">More</span>
                </button>
            </div>
        </nav>
    );
}
