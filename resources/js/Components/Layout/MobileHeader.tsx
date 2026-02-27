import { Link } from "@inertiajs/react";
import {
    Wallet,
    Box,
    Archive,
    Calendar,
    FileText,
    Settings,
    X,
    UserCircle,
    Bell,
    ShieldCheck,
} from "lucide-react";

interface MobileHeaderProps {
    auth: any;
    url: string;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function MobileHeader({
    auth,
    url,
    isSidebarOpen,
    toggleSidebar,
}: MobileHeaderProps) {
    const isActive = (route: string) => url.startsWith(route);

    return (
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
                    <div className="border-t border-slate-100/60 mx-4 pt-3 flex flex-col gap-1 overflow-y-auto max-h-[400px] no-scrollbar">
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
                                              ) && item.href === "/users"
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
                                                  ) && item.href === "/users"
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
    );
}
