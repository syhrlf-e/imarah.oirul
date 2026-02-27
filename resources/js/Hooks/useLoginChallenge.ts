import { useState, useEffect, useRef } from "react";
import Echo from "laravel-echo";
import { router } from "@inertiajs/react";

declare global {
    interface Window {
        Echo: any;
        Pusher: any;
    }
}

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
 * Subscribe ke private channel via Reverb untuk menerima Login Challenge
 * ketika HP B mencoba login dengan akun yang sama.
 */
export function useLoginChallenge(userId: string): UseLoginChallengeResult {
    const [activeChallenge, setActiveChallenge] =
        useState<ChallengeData | null>(null);
    const channelRef = useRef<any>(null);
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!userId || !window.Echo) return;

        // Subscribe ke private channel user
        channelRef.current = window.Echo.private(`user.${userId}`);

        channelRef.current.listen(
            ".LoginChallengeIssued",
            (data: ChallengeData) => {
                setActiveChallenge(data);

                // Hitung sisa waktu sampai expired
                const remainingMs =
                    (data.expires_at - Math.floor(Date.now() / 1000)) * 1000;

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
            },
        );

        return () => {
            if (channelRef.current) {
                window.Echo.leave(`user.${userId}`);
            }
            if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
            }
        };
    }, [userId]);

    const handleReject = () => {
        if (!activeChallenge) return;

        // Kirim request reject ke server
        router.post(
            route("login.challenge.reject", {
                token: activeChallenge.challenge_token,
            }),
            {},
            {
                onFinish: () => {
                    if (expiryTimerRef.current)
                        clearTimeout(expiryTimerRef.current);
                    setActiveChallenge(null);
                },
            },
        );
    };

    const clearChallenge = () => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        setActiveChallenge(null);
    };

    return { activeChallenge, handleReject, clearChallenge };
}
