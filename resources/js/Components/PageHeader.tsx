import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Opsional: elemen aksi di sisi kanan (tombol tambah, kembali, dll) */
    children?: ReactNode;
    /** Opsional: tambahkan kelas tambahan pada wrapper luar */
    className?: string;
}

/**
 * Komponen header seragam untuk semua halaman data.
 * Menampilkan judul halaman, deskripsi opsional, dan slot aksi (children) di sebelah kanan.
 */
export default function PageHeader({
    title,
    description,
    children,
    className = "",
}: PageHeaderProps) {
    return (
        <div
            className={`mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:px-6 ${className}`}
        >
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">{children}</div>
            )}
        </div>
    );
}
