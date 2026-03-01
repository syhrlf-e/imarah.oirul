import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

interface Challenge {
    token: string;
    expires_at: number;
}

export const useLoginChallenge = (userId: string | null) => {
    const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(
        null,
    );
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Buka koneksi SSE
        const eventSource = new EventSource(route("sse.notifications"));
        eventSourceRef.current = eventSource;

        // Terima event challenge dari server
        eventSource.addEventListener("challenge", (e) => {
            const data = JSON.parse(e.data);
            setActiveChallenge(data);
        });

        // Handle error koneksi — reconnect otomatis (EventSource sudah handle ini)
        eventSource.onerror = () => {
            // EventSource akan otomatis reconnect
            // Tidak perlu action manual
        };

        // Cleanup saat unmount
        return () => {
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [userId]);

    const handleReject = async (token: string) => {
        try {
            await fetch(
                route("login.challenge.reject", {
                    token: token,
                }),
                {
                    method: "POST",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "X-XSRF-TOKEN": decodeURIComponent(
                            document.cookie
                                .split("; ")
                                .find((c) => c.startsWith("XSRF-TOKEN="))
                                ?.split("=")[1] ?? "",
                        ),
                        Accept: "application/json",
                    },
                    credentials: "same-origin",
                },
            );
        } catch (error) {
            console.error("Failed to reject challenge:", error);
        }
        setActiveChallenge(null);
    };

    const handleApprove = (token: string) => {
        // Kirim request approve — HP A akan logout setelah ini
        router.post(route("login.challenge.approve"), { token });
        setActiveChallenge(null);
    };

    const clearChallenge = () => {
        setActiveChallenge(null);
    };

    return { activeChallenge, handleReject, handleApprove, clearChallenge };
};
