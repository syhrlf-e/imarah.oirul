import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/Components/Toast";
import GlobalToastListener from "@/Components/GlobalToastListener";
import { User, PageProps } from "@/types";
import BottomNav from "@/Components/BottomNav";
import Sidebar from "@/Components/Layout/Sidebar";
import MobileHeader from "@/Components/Layout/MobileHeader";
import TopHeader from "@/Components/Layout/TopHeader";

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: Props) {
    const { props, url, component } = usePage<any>();
    const { auth } = props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isKickedOut, setIsKickedOut] = useState(false);

    // Heartbeat Polling: Cek apakah akun masih aktif / belum dihapus admin
    useEffect(() => {
        const interval = setInterval(() => {
            // Karena kita mendaftarkan global interceptor, abaikan alert toast jika 401/403 dari Heartbeat
            window.axios
                .get("/api/session-heartbeat", {
                    // Konfigurasi ini memberitahu interceptor custom kita untuk tidak memunculkan toast pada background check
                    headers: { "X-Silent-Ping": "true" },
                })
                .catch((err) => {
                    if (
                        err.response &&
                        (err.response.status === 401 ||
                            err.response.status === 403)
                    ) {
                        setIsKickedOut(true);
                    }
                });
        }, 120000); // 2 Menit sekali

        return () => clearInterval(interval);
    }, []);

    // Handle scroll for glassmorphism header effect on mobile
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const isActive = (route: string) => url.startsWith(route);

    return (
        <div className="h-screen bg-slate-100 font-sans flex text-slate-900 overflow-hidden text-sm">
            <Toaster />
            <GlobalToastListener />
            {/* PWA Window Controls Overlay - Drag Region */}
            <div className="pwa-titlebar-drag"></div>
            <Sidebar
                auth={auth}
                url={url}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative bg-slate-50/50">
                {/* Space Placeholder to prevent content jump due to fixed header */}
                {/* Space Placeholder to prevent content jump due to fixed header */}

                <MobileHeader
                    auth={auth}
                    url={url}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />

                <TopHeader
                    auth={auth}
                    title={title}
                    toggleSidebar={toggleSidebar}
                />

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-20 md:p-6 no-scrollbar md:scrollbar-default relative flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={component}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full flex-1 flex flex-col lg:min-h-0"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <BottomNav
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
        </div>
    );
}
