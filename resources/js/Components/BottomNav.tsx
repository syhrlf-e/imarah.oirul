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
        <div className="md:hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none">
            <nav className="bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 rounded-2xl mx-auto max-w-md pointer-events-auto overflow-hidden">
                <div className="flex justify-around items-center h-16 px-2 w-full">
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
                        <span className="text-[10px] font-semibold">
                            Laporan
                        </span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
