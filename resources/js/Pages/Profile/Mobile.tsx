import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { User, Lock, Settings, LogOut, ChevronRight } from "lucide-react";

interface UserProp {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface MobileProfileProps {
    user: UserProp;
}

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

const formatRole = (role: string): string => {
    const map: Record<string, string> = {
        super_admin: "Super Admin",
        bendahara: "Bendahara",
        petugas_zakat: "Petugas Zakat",
        sekretaris: "Sekretaris",
        irmas: "Irmas",
    };
    return map[role] || role;
};

export default function Mobile({ user }: MobileProfileProps) {
    const menuItems = [
        {
            icon: User,
            label: "Edit Profil",
            href: route("profile.edit"),
        },
        {
            icon: Lock,
            label: "Ganti Password",
            href: route("profile.edit") + "#password",
        },
        {
            icon: Settings,
            label: "Pengaturan App",
            href: route("settings.index"),
        },
    ];

    return (
        <AppLayout title="Profil">
            <Head title="Profil" />

            <div className="flex flex-col items-center px-4 py-8 gap-6">
                {/* Avatar Besar */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-white">
                            {getInitials(user.name)}
                        </span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-slate-900">
                            {user.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {formatRole(user.role)}
                        </p>
                    </div>
                </div>

                {/* Menu Grup 1 — Aksi Profil */}
                <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                                    index < menuItems.length - 1
                                        ? "border-b border-slate-100"
                                        : ""
                                }`}
                            >
                                <Icon
                                    size={18}
                                    className="text-slate-400 shrink-0"
                                />
                                <span className="flex-1 font-medium">
                                    {item.label}
                                </span>
                                <ChevronRight
                                    size={16}
                                    className="text-slate-300"
                                />
                            </Link>
                        );
                    })}
                </div>

                {/* Menu Grup 2 — Keluar */}
                <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span className="font-medium">Keluar</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
