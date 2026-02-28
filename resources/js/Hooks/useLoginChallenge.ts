import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

interface ChallengeData {
    challenge_token: string;
    device_info: string;
    expires_at: number; // Unix timestamp
}

interface UseLoginChallengeResult {
    activeChallenge: ChallengeData | null;
    handleReject: () => void;
    clearChallenge: () => void;
}

/**
 * Hook yang digunakan di AppLayout (HP A).
 * Polling ke /login/challenge/check setiap 3 detik
 * untuk cek apakah ada Login Challenge dari HP B.
 */
export function useLoginChallenge(userId: string): UseLoginChallengeResult {
    const [activeChallenge, setActiveChallenge] =
        useState<ChallengeData | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Polling setiap 3 detik ke server
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch("/login/challenge/check", {
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                });

                if (!res.ok) return;

                const data = await res.json();

                if (data.has_challenge && !activeChallenge) {
                    const challenge: ChallengeData = {
                        challenge_token: data.challenge_token,
                        device_info: data.device_info,
                        expires_at: data.expires_at,
                    };

                    setActiveChallenge(challenge);

                    // Hitung sisa waktu sampai expired
                    const remainingMs =
                        (challenge.expires_at - Math.floor(Date.now() / 1000)) *
                        1000;

                    // Jika HP A tidak merespons dalam waktu tersebut → auto logout
                    if (expiryTimerRef.current)
                        clearTimeout(expiryTimerRef.current);
                    expiryTimerRef.current = setTimeout(
                        () => {
                            setActiveChallenge(null);
                            router.post(route("logout"));
                        },
                        Math.max(remainingMs, 1000),
                    );

                    // Stop polling setelah challenge ditemukan
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                }
            } catch {
                // Abaikan network error
            }
        }, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
            }
        };
    }, [userId]);

    const handleReject = async () => {
        if (!activeChallenge) return;

        try {
            await window.axios.post(
                route("login.challenge.reject", {
                    token: activeChallenge.challenge_token,
                }),
            );
        } catch (error) {
            console.error("Failed to set reject status", error);
        } finally {
            if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
            setActiveChallenge(null);
        }
    };

    const clearChallenge = () => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        setActiveChallenge(null);
    };

    return { activeChallenge, handleReject, clearChallenge };
}
