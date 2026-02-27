import { Link, usePage, router } from "@inertiajs/react";
import {
    LayoutDashboard,
    Wallet,
    FileText,
    UserCircle,
    Archive,
} from "lucide-react";

interface Props {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function BottomNav({ isSidebarOpen, toggleSidebar }: Props) {
    const { props, url } = usePage<any>();
    const { auth } = props;

    // Visual rendering rules map to RBAC context roles
    const getVisibleItems = () => {
        const items = [];
        items.push({
            href: "/dashboard",
            label: "Dashboard",
            index: 0,
            icon: LayoutDashboard,
            isAvatar: false,
        });

        if (["super_admin", "bendahara"].includes(auth.user?.role)) {
            items.push({
                href: "/kas",
                label: "Kas",
                index: 1,
                icon: Wallet,
                isAvatar: false,
            });
        } else if (auth.user?.role === "sekretaris") {
            items.push({
                href: "/inventaris",
                label: "Inventaris",
                index: 1,
                icon: Archive,
                isAvatar: false,
            });
        }

        if (
            ["super_admin", "bendahara", "petugas_zakat"].includes(
                auth.user?.role,
            )
        ) {
            items.push({
                href:
                    auth.user?.role === "petugas_zakat"
                        ? "/zakat/muzakki"
                        : "/zakat",
                label: "Zakat",
                index: 2,
                icon: UserCircle,
                isAvatar: false,
            });
        }

        if (["super_admin", "bendahara"].includes(auth.user?.role)) {
            items.push({
                href: "/laporan",
                label: "Laporan",
                index: 3,
                icon: FileText,
                isAvatar: false,
            });
        }

        items.push({
            href: "/profil-mobile",
            label: "Profil",
            index: 4,
            icon: UserCircle,
            isAvatar: true,
        });

        return items;
    };

    const visibleItems = getVisibleItems();

    const isDashboard = url === "/" || url === "/dashboard";

    // Dapatkan visualActiveIndex saat ini untuk perbandingan saat click
    const getCurrentIndex = () => {
        for (let i = 0; i < visibleItems.length; i++) {
            const item = visibleItems[i];
            if (isDashboard && item.index === 0) return item.index;
            if (!isDashboard && url.startsWith(item.href)) return item.index;
        }
        return 0;
    };

    const handleNavClick = (
        href: string,
        targetIndex: number,
        e: React.MouseEvent,
    ) => {
        e.preventDefault(); // Mencegah link default agar kita bisa set Storage dulu
        const currentIndex = getCurrentIndex();

        // Simpan direction: 1 mundur/ke kiri, -1 ke kanan.
        // Pastikan arah logika benar ke AppLayout
        if (targetIndex !== currentIndex) {
            sessionStorage.setItem(
                "swipeDirection",
                targetIndex > currentIndex ? "1" : "-1",
            );
        }

        router.visit(href);
    };

    return (
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white rounded-t-[20px] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-50">
            <div className="flex justify-around items-center w-full h-full relative px-2">
                {visibleItems.map((item) => {
                    const isActive =
                        (isDashboard && item.index === 0) ||
                        (!isDashboard && url.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <a
                            href={item.href}
                            key={item.href}
                            onClick={(e) =>
                                handleNavClick(item.href, item.index, e)
                            }
                            className="flex flex-col items-center justify-center gap-[2px] flex-1 h-full pt-2 pb-1"
                        >
                            {item.isAvatar ? (
                                <div
                                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-200 ${
                                        isActive
                                            ? "bg-[#22C55E] text-white"
                                            : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                                    }`}
                                >
                                    {auth.user?.name?.charAt(0) || "U"}
                                </div>
                            ) : (
                                <Icon
                                    className={`w-5 h-5 transition-colors duration-200 ${
                                        isActive
                                            ? "fill-[#22C55E]/20 stroke-2 text-[#22C55E]"
                                            : "stroke-2 text-slate-400 hover:text-slate-600"
                                    }`}
                                />
                            )}
                            <span
                                className={`text-[10px] transition-colors duration-200 ${
                                    isActive
                                        ? "text-[#22C55E] font-semibold"
                                        : "text-slate-400 hover:text-slate-600 font-normal"
                                }`}
                            >
                                {item.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
