import { useState, useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/Components/Toast";
import GlobalToastListener from "@/Components/GlobalToastListener";
import { User, PageProps } from "@/types";
import BottomNav from "@/Components/BottomNav";
import Sidebar from "@/Components/Layout/Sidebar";
import MobileHeader from "@/Components/Layout/MobileHeader";
import TopHeader from "@/Components/Layout/TopHeader";

import {
    NavigationProvider,
    useNavigation,
} from "@/Contexts/NavigationContext";
import { useSwipeGesture } from "@/Hooks/useSwipeGesture";
import { useIsMobile } from "@/Hooks/useIsMobile";

interface Props {
    title?: string;
    children: React.ReactNode;
}

const navItems = [
    { href: "/dashboard", index: 0 },
    { href: "/kas", index: 1 },
    { href: "/zakat", index: 2 },
    { href: "/laporan", index: 3 },
    { href: "/profil-mobile", index: 4 },
];

export default function AppLayout({ title, children }: Props) {
    const { url } = usePage<any>();

    return (
        <NavigationProvider url={url}>
            <AppLayoutInner title={title}>{children}</AppLayoutInner>
        </NavigationProvider>
    );
}

function AppLayoutInner({ title, children }: Props) {
    const { props, url, component } = usePage<any>();
    const { auth } = props;
    const { direction, currentIndex, navigateTo } = useNavigation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isKickedOut, setIsKickedOut] = useState(false);

    const isMobile = useIsMobile();
    const contentRef = useRef<HTMLDivElement>(null);

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

    // Mendaftarkan Touch Gestures
    useSwipeGesture(contentRef, {
        enabled: isMobile,
        onSwipeLeft: () => {
            const next = navItems.find(
                (item) => item.index === currentIndex + 1,
            );
            if (next) navigateTo(next.href, next.index);
        },
        onSwipeRight: () => {
            const prev = navItems.find(
                (item) => item.index === currentIndex - 1,
            );
            if (prev) navigateTo(prev.href, prev.index);
        },
    });

    const mobileVariants = {
        initial: (dir: number) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0.5,
        }),
        animate: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? "-30%" : "30%",
            opacity: 0,
        }),
    };

    const desktopVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

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

                <div
                    ref={contentRef}
                    className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-20 md:p-6 no-scrollbar md:scrollbar-default relative flex flex-col"
                >
                    <AnimatePresence custom={direction} mode="popLayout">
                        <motion.div
                            key={url}
                            custom={direction}
                            variants={
                                isMobile ? mobileVariants : desktopVariants
                            }
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{
                                duration: isMobile ? 0.28 : 0.1,
                                ease: isMobile ? [0.32, 0.72, 0, 1] : "linear",
                            }}
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
