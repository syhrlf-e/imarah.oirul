import React from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { LogOut } from "lucide-react";

interface UserProp {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface MobileProfileProps {
    user: UserProp;
}

export default function Mobile({ user }: MobileProfileProps) {
    // Parser untuk mengekstraksi hingga maksimal 2 inisial kata dari string Nama
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <AppLayout title="Profil">
            <Head title="Profil Akun" />
            <div className="flex flex-col items-center pt-12 px-5 h-full relative">
                {/* Avatar Bulat 24x24 px dg Inisial Nama */}
                <div className="w-24 h-24 mt-4 rounded-full bg-[#22C55E] flex items-center justify-center shadow-md">
                    <span className="text-3xl font-bold text-[#052e16]">
                        {getInitials(user.name)}
                    </span>
                </div>

                {/* Nama Real User */}
                <h1 className="text-xl font-bold text-slate-900 mt-4 text-center">
                    {user.name}
                </h1>

                {/* Badge Otoritas Role */}
                <span className="mt-2 px-3 py-1 text-xs font-medium border border-[#22C55E] text-[#22C55E] bg-white rounded-full capitalize">
                    {user.role.replace("_", " ")}
                </span>

                {/* Zona Tombol (di-push menjauh dari Avatar) */}
                <div className="mt-8 w-full max-w-sm">
                    {/* Tombol Logout Merah Penuh */}
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-colors"
                    >
                        <LogOut size={18} />
                        Keluar
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
