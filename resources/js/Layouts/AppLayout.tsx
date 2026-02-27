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
import LoginChallengeModal from "@/Components/LoginChallengeModal";
import { useLoginChallenge } from "@/Hooks/useLoginChallenge";
import { useIsMobile } from "@/Hooks/useIsMobile";

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

    const isMobile = useIsMobile();

    // Login Challenge: Deteksi jika ada user lain yang mencoba login via WebSocket
    const userId = auth?.user?.id ?? "";
    const { activeChallenge, handleReject, clearChallenge } =
        useLoginChallenge(userId);

    // Ambil direction statis dari SessionStorage yang diset oleh BottomNav Tap Item
    const getDirection = () => {
        if (typeof window !== "undefined") {
            const storedDir = sessionStorage.getItem("swipeDirection");
            return storedDir ? parseInt(storedDir) : 0;
        }
        return 0;
    };

    const direction = getDirection();

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
            // Exit halaman lama geser -30% agar terasa natural seperti native app
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

            {/* Login Challenge Modal */}
            <AnimatePresence>
                {activeChallenge && (
                    <LoginChallengeModal
                        challengeToken={activeChallenge.challenge_token}
                        deviceInfo={activeChallenge.device_info}
                        expiresAt={activeChallenge.expires_at}
                        onReject={handleReject}
                        onExpired={clearChallenge}
                    />
                )}
            </AnimatePresence>

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

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-28 md:p-6 no-scrollbar md:scrollbar-default relative flex flex-col">
                    <AnimatePresence
                        custom={direction}
                        mode="popLayout"
                        onExitComplete={() =>
                            sessionStorage.setItem("swipeDirection", "0")
                        }
                    >
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
