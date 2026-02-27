import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

interface LoginChallengeModalProps {
    challengeToken: string;
    deviceInfo: string;
    expiresAt: number; // Unix timestamp
    onReject: () => void;
    onExpired: () => void;
}

/**
 * Modal yang muncul di HP A saat HP B mencoba login dengan akun yang sama.
 * Menampilkan countdown 10 detik dan tombol "Tolak".
 */
export default function LoginChallengeModal({
    challengeToken,
    deviceInfo,
    expiresAt,
    onReject,
    onExpired,
}: LoginChallengeModalProps) {
    const calcRemaining = () =>
        Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
    const [secondsLeft, setSecondsLeft] = useState(calcRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = calcRemaining();
            setSecondsLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onExpired();
            }
        }, 500);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const circumference = 2 * Math.PI * 28; // radius 28
    const progress = secondsLeft / 10;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
                style={{ animation: "slideUp 0.3s ease-out" }}
            >
                {/* Red top bar countdown */}
                <div
                    className="h-1.5 bg-red-500 transition-all duration-500 ease-linear"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                />

                <div className="p-6">
                    {/* Icon + countdown circle */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* SVG Countdown Ring */}
                        <div className="relative flex h-14 w-14 items-center justify-center">
                            <svg
                                className="absolute inset-0 -rotate-90"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="#fee2e2"
                                    strokeWidth="5"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke={
                                        secondsLeft <= 3 ? "#ef4444" : "#f97316"
                                    }
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <span
                                className={`text-xl font-bold ${secondsLeft <= 3 ? "text-red-600" : "text-orange-500"}`}
                            >
                                {secondsLeft}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="mb-1 text-lg font-bold text-gray-900">
                        Ada Percobaan Login Baru
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Seseorang mencoba masuk ke akun Anda dari perangkat
                        lain.
                    </p>

                    {/* Device info card */}
                    <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Perangkat
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-700 break-all">
                            {deviceInfo}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onReject}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
                        >
                            🚫 Tolak
                        </button>
                        <button
                            onClick={onExpired}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                        >
                            Abaikan
                        </button>
                    </div>

                    <p className="mt-3 text-center text-xs text-gray-400">
                        Jika tidak merespons dalam {secondsLeft} detik, Anda
                        akan keluar otomatis.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
