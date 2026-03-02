import { router } from "@inertiajs/react";
import { Bell, ChevronRight } from "lucide-react";

interface MobileHeaderProps {
    auth: any;
    url: string;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const getHeaderTitle = (url: string): string => {
    if (url === "/dashboard" || url === "/dashboard?source=pwa")
        return "Imarah";

    const titles: Record<string, string> = {
        "/kas": "Kas Masjid",
        "/zakat": "Zakat",
        "/tromol": "Tromol",
        "/inventaris": "Inventaris",
        "/agenda": "Agenda",
        "/laporan": "Laporan",
        "/settings": "Pengaturan",
        "/profile": "Profil",
        "/profil": "Profil",
        "/user-management": "Manajemen Pengguna",
        "/users": "Manajemen Pengguna",
    };

    const match = Object.keys(titles).find((key) => url.startsWith(key));
    return match ? titles[match] : "Imarah";
};

const getInitial = (name: string): string => {
    return name ? name[0].toUpperCase() : "?";
};

export default function MobileHeader({
    auth,
    url,
    isSidebarOpen,
    toggleSidebar,
}: MobileHeaderProps) {
    const title = getHeaderTitle(url);
    const isDashboard = title === "Imarah";
    const initial = getInitial(auth?.user?.name ?? "");

    return (
        <div className="md:hidden shrink-0 relative z-[100] h-14">
            {/* Fixed Full-Width Header */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between h-14 px-4">
                {/* Judul: "Imarah" di dashboard, nama halaman di halaman lain */}
                <span
                    className={`leading-tight ${
                        isDashboard
                            ? "text-xl font-extrabold text-slate-900 tracking-tight font-poppins"
                            : "text-base font-semibold text-slate-800"
                    }`}
                >
                    {title}
                </span>

                {/* Kanan: Bell + Avatar */}
                <div className="flex items-center gap-2">
                    {/* Bell — placeholder untuk notifikasi */}
                    <button
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                        aria-label="Notifikasi"
                    >
                        <Bell size={18} />
                    </button>

                    {/* Avatar dengan inisial → navigate ke /profile */}
                    <button
                        onClick={() => router.visit(route("profil.mobile"))}
                        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold transition-transform active:scale-95"
                        aria-label="Profil"
                    >
                        {initial}
                    </button>
                </div>
            </div>
        </div>
    );
}
