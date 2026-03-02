import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Wallet,
    HandHeart,
    BarChart3,
    LayoutGrid,
    Users,
    UserCheck,
    ArrowUpFromLine,
    ArrowDownToLine,
    Package,
    CalendarDays,
    ShoppingBag,
    ChevronRight,
} from "lucide-react";

interface Props {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

// ─── Nav item definitions per role ───────────────────────────────────────────
const superAdminItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard, index: 0 },
    { href: "/kas", label: "Kas", icon: Wallet, index: 1 },
    { href: "/zakat", label: "Zakat", icon: HandHeart, index: 2 },
    { href: "/laporan", label: "Laporan", icon: BarChart3, index: 3 },
    { href: "__sheet__", label: "Lainnya", icon: LayoutGrid, index: 4 },
];

const petugasZakatItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard, index: 0 },
    { href: "/zakat/muzakki", label: "Muzakki", icon: Users, index: 1 },
    { href: "/zakat/mustahiq", label: "Mustahiq", icon: UserCheck, index: 2 },
    {
        href: "/zakat/penyaluran",
        label: "Salur",
        icon: ArrowUpFromLine,
        index: 3,
    },
    {
        href: "/zakat/penerimaan",
        label: "Terima",
        icon: ArrowDownToLine,
        index: 4,
    },
];

const sekretarisItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard, index: 0 },
    { href: "/inventaris", label: "Inventaris", icon: Package, index: 1 },
    { href: "/agenda", label: "Agenda", icon: CalendarDays, index: 2 },
];

// Menu items yang muncul di bottom sheet "Lainnya" (super_admin saja)
const superAdminSheetItems = [
    { href: "/inventaris", label: "Inventaris", icon: Package },
    { href: "/tromol", label: "Tromol", icon: ShoppingBag },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/users", label: "Manajemen Pengguna", icon: Users },
];

const bendaharaSheetItems = [
    { href: "/inventaris", label: "Inventaris", icon: Package },
    { href: "/tromol", label: "Tromol", icon: ShoppingBag },
];

export default function BottomNav({ isSidebarOpen, toggleSidebar }: Props) {
    const { props, url } = usePage<any>();
    const { auth } = props;
    const role: string = auth?.user?.role ?? "";

    const [sheetOpen, setSheetOpen] = useState(false);

    // Pilih nav items sesuai role
    const getNavItems = () => {
        if (["super_admin", "bendahara"].includes(role)) return superAdminItems;
        if (role === "petugas_zakat") return petugasZakatItems;
        if (role === "sekretaris") return sekretarisItems;
        return superAdminItems; // fallback
    };

    const getSheetItems = () => {
        if (role === "super_admin") return superAdminSheetItems;
        if (role === "bendahara") return bendaharaSheetItems;
        return [];
    };

    const navItems = getNavItems();
    const sheetItems = getSheetItems();

    // Active state
    const isActive = (href: string) => {
        if (href === "__sheet__") return sheetOpen;
        if (href === "/dashboard") return url === "/dashboard" || url === "/";
        return url.startsWith(href);
    };

    // Swipe direction tracking + navigation
    const getCurrentIndex = () => {
        for (const item of navItems) {
            if (item.href === "__sheet__") continue;
            if (
                item.href === "/dashboard" &&
                (url === "/dashboard" || url === "/")
            )
                return item.index;
            if (item.href !== "/dashboard" && url.startsWith(item.href))
                return item.index;
        }
        return 0;
    };

    const handleNavClick = (
        href: string,
        targetIndex: number,
        e: React.MouseEvent,
    ) => {
        e.preventDefault();
        if (href === "__sheet__") {
            setSheetOpen(true);
            return;
        }
        const currentIndex = getCurrentIndex();
        if (targetIndex !== currentIndex) {
            sessionStorage.setItem(
                "swipeDirection",
                targetIndex > currentIndex ? "1" : "-1",
            );
        }
        router.visit(href);
    };

    return (
        <>
            {/* Bottom Nav — mobile only */}
            <nav className="flex md:hidden fixed bottom-4 left-4 right-4 h-[68px] bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 z-50 pb-safe">
                <div className="flex justify-around items-center w-full h-full relative px-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <a
                                href={
                                    item.href === "__sheet__" ? "#" : item.href
                                }
                                key={item.href + item.label}
                                onClick={(e) =>
                                    handleNavClick(item.href, item.index, e)
                                }
                                className="flex flex-col items-center justify-center gap-[2px] flex-1 h-full pt-2 pb-1"
                            >
                                <Icon
                                    size={22}
                                    className={`transition-colors duration-200 ${
                                        active
                                            ? "text-emerald-600"
                                            : "text-slate-400"
                                    }`}
                                />
                                <span
                                    className={`text-[10px] transition-colors duration-200 ${
                                        active
                                            ? "text-emerald-600 font-semibold"
                                            : "text-slate-400 font-medium"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Sheet — muncul saat tap "Lainnya" */}
            <AnimatePresence>
                {sheetOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSheetOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) setSheetOpen(false);
                            }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] pb-safe shadow-2xl md:hidden"
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-10 h-1 rounded-full bg-slate-200" />
                            </div>

                            {/* Judul */}
                            <p className="text-center text-sm font-semibold text-slate-500 pb-4">
                                Menu Lainnya
                            </p>

                            {/* Menu list */}
                            <div className="mx-4 mb-8 rounded-2xl overflow-hidden border border-slate-100">
                                {sheetItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => {
                                                setSheetOpen(false);
                                                setTimeout(
                                                    () =>
                                                        router.visit(item.href),
                                                    150,
                                                );
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-4 bg-white text-left active:bg-slate-50 transition-colors ${
                                                index < sheetItems.length - 1
                                                    ? "border-b border-slate-100"
                                                    : ""
                                            }`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                                <Icon
                                                    size={18}
                                                    className="text-emerald-600"
                                                />
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-slate-800">
                                                {item.label}
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                className="text-slate-300"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
