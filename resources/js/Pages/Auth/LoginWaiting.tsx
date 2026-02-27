import { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";

interface Props {
    token: string;
    timeout: number; // detik countdown (misal 10)
}

type ChallengeStatus = "pending" | "rejected" | "expired" | "approved";

/**
 * Halaman waiting untuk HP B saat menunggu konfirmasi dari HP A.
 * Melakukan polling setiap 1.5 detik ke endpoint status challenge.
 */
export default function LoginWaiting({ token, timeout }: Props) {
    const [status, setStatus] = useState<ChallengeStatus>("pending");
    const [secondsLeft, setSecondsLeft] = useState(timeout);
    const [message, setMessage] = useState(
        "Menunggu konfirmasi dari perangkat yang sedang aktif...",
    );

    useEffect(() => {
        let pollInterval: ReturnType<typeof setInterval>;
        let countdownInterval: ReturnType<typeof setInterval>;

        // Countdown visual
        countdownInterval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Polling setiap 1.5 detik
        pollInterval = setInterval(async () => {
            try {
                const res = await fetch(
                    route("login.challenge.status", { token }),
                );
                const data: { status: ChallengeStatus } = await res.json();

                if (data.status === "rejected") {
                    clearInterval(pollInterval);
                    clearInterval(countdownInterval);
                    setStatus("rejected");
                    setMessage(
                        "Login ditolak oleh perangkat yang sedang aktif.",
                    );
                } else if (data.status === "expired") {
                    // Timeout — HP A tidak merespons → HP B diizinkan masuk
                    clearInterval(pollInterval);
                    clearInterval(countdownInterval);
                    setStatus("approved");
                    setMessage("Mengalihkan ke dasbor...");
                    // Redirect ke login ulang untuk mendapatkan sesi baru (karena sesi HP A sudah di-kick)
                    setTimeout(() => {
                        router.get(route("login"));
                    }, 1000);
                }
            } catch {
                // Network error - ignore, tetap polling
            }
        }, 1500);

        return () => {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
        };
    }, [token]);

    const progress = secondsLeft / timeout;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <>
            <Head title="Menunggu Konfirmasi Login" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6">
                <div
                    className="w-full max-w-sm overflow-hidden rounded-2xl bg-white/10 shadow-2xl backdrop-blur-xl"
                    style={{ animation: "fadeIn 0.4s ease-out" }}
                >
                    <div className="p-8">
                        {/* Logo / Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
                                <svg
                                    className="h-8 w-8 text-emerald-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {status === "pending" && (
                            <>
                                {/* Countdown Ring */}
                                <div className="mb-5 flex justify-center">
                                    <div className="relative flex h-24 w-24 items-center justify-center">
                                        <svg
                                            className="absolute inset-0 -rotate-90"
                                            viewBox="0 0 80 80"
                                        >
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="5"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                fill="none"
                                                stroke={
                                                    secondsLeft <= 3
                                                        ? "#ef4444"
                                                        : "#10b981"
                                                }
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={
                                                    strokeDashoffset
                                                }
                                                className="transition-all duration-500"
                                            />
                                        </svg>
                                        <span className="text-3xl font-bold text-white">
                                            {secondsLeft}
                                        </span>
                                    </div>
                                </div>

                                {/* Spinning dots */}
                                <div className="mb-4 flex justify-center gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="h-2 w-2 rounded-full bg-emerald-400"
                                            style={{
                                                animation: `bounce 1.2s infinite ${i * 0.2}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {status === "approved" && (
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                                    <svg
                                        className="h-8 w-8 text-emerald-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {status === "rejected" && (
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                                    <svg
                                        className="h-8 w-8 text-red-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <h2 className="mb-2 text-center text-xl font-bold text-white">
                            {status === "pending" && "Menunggu Konfirmasi"}
                            {status === "approved" && "Mengalihkan..."}
                            {status === "rejected" && "Login Ditolak"}
                        </h2>
                        <p className="text-center text-sm text-white/60">
                            {message}
                        </p>

                        {status === "rejected" && (
                            <button
                                onClick={() => router.get(route("login"))}
                                className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
                            >
                                Kembali ke Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
